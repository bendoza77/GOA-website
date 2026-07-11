import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BoxGeometry,
  CanvasTexture,
  Color,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import { makeCubeFaces } from "./cubeFaces.js";

/**
 * CubeEngine — the hero cube act that plays AFTER the scroll-journey ride.
 *
 * A single lit cube on a fixed, transparent, pointer-through canvas. Page
 * scroll through the CubeStage runway is the master timeline (0..1), damped so
 * fast flicks still glide:
 *
 *   fall     the cube drops in from above the viewport and eases to dead
 *            centre — accel → decel, with position/scale damping standing in
 *            for weight and inertia (no linear motion, no snap)
 *   reveal   it rotates through every side in full 3D — front → right → left
 *            → top → bottom — slerped and damped so the turn never jumps
 *   travel   as the Hero scrolls up, the cube flies to the Hero's reserved
 *            right-hand slot, scaling down and settling to a 3/4 hero pose
 *   dock     pixel-locked to the live Hero slot rect, so it now scrolls WITH
 *            the page as if it were a DOM element — a 3D object embedded in
 *            the interface. Rotation rests; scroll control is released.
 *
 * Quality contract: one cube, ~6 draw calls, a studio env-map for reflections
 * (desktop only), adaptive pixel-ratio, renders only while on screen, and a
 * dispose() that frees every GPU resource.
 */

/* Timeline windows (fractions of the runway scroll). */
const FALL = [0.0, 0.24]; // longer, gentler drop-in (heavier feel)
const REVEAL = [0.26, 0.66]; // spin through 4 sides, then hold top, then bottom
const TRAVEL = [0.66, 1.0]; // fly + shrink into the hero slot
const REST = [0.7, 0.92]; // settle to the hero 3/4 pose

const CAM_DIST = 7;
const FOV = 35;

const smootherstep = (t) => {
  const x = MathUtils.clamp(t, 0, 1);
  return x * x * x * (x * (x * 6 - 15) + 10);
};
const win = (p, [a, b]) => MathUtils.smoothstep(p, a, b);

/* Euler (rad) that turns each named face toward the camera (+z). */
const FACE_EULER = {
  front: [0, 0, 0],
  right: [0, -Math.PI / 2, 0],
  left: [0, Math.PI / 2, 0],
  top: [Math.PI / 2, 0, 0],
  bottom: [-Math.PI / 2, 0, 0],
};

export class CubeEngine {
  constructor(canvas, opts = {}) {
    const {
      isDark = true,
      coarse = false,
      docked = false,
      runwayEl = null,
      dockEl = null,
      onCaption = null,
      onActive = null,
      images = [],
    } = opts;

    this.canvas = canvas;
    // Docked mode (return visits): no runway, the cube sits at the end-state
    // pose in the hero slot from the first frame instead of playing the ride.
    this.docked = docked;
    this.runwayEl = runwayEl;
    this.dockEl = dockEl;
    this.onCaption = onCaption;
    this.onActive = onActive;
    this._faceImages = images;
    this.coarse = coarse;
    this.disposed = false;
    this._active = false;
    this._seeded = false;

    this.time = 0;
    this.lastT = 0;
    // Start already at the dock end of the timeline when docked, so no scroll
    // is needed to bring the cube into the hero.
    this.progress = docked ? 1 : 0;
    this._lastCaption = -1;
    this._fpsFrames = 0;
    this._fpsStart = 0;
    this._visible = false;

    /* scratch — no per-frame allocation */
    this._pos = new Vector3(0, 6, 0); // starts above frame
    this._tPos = new Vector3();
    this._scale = 0.001;
    this._tScale = 1;
    this._q = new Quaternion();
    this._tq = new Quaternion();
    this._qa = new Quaternion();
    this._qb = new Quaternion();
    this._wobble = new Quaternion();
    this._wAxis = new Vector3(0, 1, 0);

    /* precomputed face quaternions + the resting 3/4 hero pose */
    this._faceQ = {};
    for (const [k, [x, y, z]] of Object.entries(FACE_EULER)) {
      this._faceQ[k] = quatFromEuler(x, y, z);
    }
    this._restQ = quatFromEuler(-0.42, -0.62, 0.06); // shows front + right + top
    this._incomingQ = quatFromEuler(-0.55, 0.7, 0.28); // tilted entry as it drops
    this._v = new Vector3(); // scratch for the live dock target
    this._anchor = new Vector3(); // scratch for the fixed → live travel anchor

    this.renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !coarse,
      powerPreference: "high-performance",
    });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    const gl = this.renderer.getContext();
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    const gpu = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : "";
    const software = /swiftshader|llvmpipe|software/i.test(gpu);
    this._lowEnd = coarse || software;
    this._pixelRatio = software ? 0.75 : Math.min(window.devicePixelRatio || 1, coarse ? 1.75 : 2);
    this._minPixelRatio = 0.6;
    this.renderer.setPixelRatio(this._pixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, 0.1, 60);
    this.camera.position.set(0, 0, CAM_DIST);

    this._disposables = [];
    this._buildCube(isDark);
    this._buildShadow();

    this._measureWpp();

    this._onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this._measureWpp();
    };
    window.addEventListener("resize", this._onResize, { passive: true });

    this._tick = this._tick.bind(this);
  }

  /* world units per screen pixel at the cube's z-plane (z = 0) */
  _measureWpp() {
    this._wpp =
      (2 * CAM_DIST * Math.tan(MathUtils.degToRad(FOV) / 2)) / window.innerHeight;
  }

  _buildCube(isDark) {
    this.cubeGroup = new Group();

    const size = this._lowEnd ? 256 : 512;
    this._faces = makeCubeFaces({ isDark, size, images: this._faceImages });

    // BoxGeometry exposes 6 material groups in order +x,-x,+y,-y,+z,-z, which
    // matches FACE_ORDER, so each side gets its own photo.
    const geo = new BoxGeometry(1, 1, 1, 2, 2, 2);
    // Photo faces are UNLIT (MeshBasicMaterial): no scene lights, reflections
    // or specular sheen sweep across them, so every side shows the photo flat
    // and true at full brightness regardless of how the cube is turned.
    // toneMapped:false keeps the image colours exactly as authored.
    this.cubeMats = this._faces.textures.map(
      (tex) =>
        new MeshBasicMaterial({
          map: tex,
          toneMapped: false,
        })
    );
    const cube = new Mesh(geo, this.cubeMats);
    this.cubeGroup.add(cube);

    // premium defined edges — thin additive neon lines
    const edgeGeo = new EdgesGeometry(new BoxGeometry(1.002, 1.002, 1.002));
    this.edgeMat = new LineBasicMaterial({
      color: new Color(isDark ? 0x7dff9e : 0x0a7d37),
      transparent: true,
      opacity: 0.4,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    this.cubeGroup.add(new LineSegments(edgeGeo, this.edgeMat));

    this.scene.add(this.cubeGroup);
    this._track(geo, edgeGeo, this.edgeMat, ...this.cubeMats);
  }

  /* Soft contact shadow — a dark radial blob under the cube that sells the
     "landed" weight at centre and fades out as the cube flies to the slot. */
  _buildShadow() {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(64, 64, 4, 64, 64, 64);
    grad.addColorStop(0, "rgba(0,0,0,0.55)");
    grad.addColorStop(0.5, "rgba(0,0,0,0.22)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    const tex = new CanvasTexture(c);
    this.shadowMat = new MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const geo = new PlaneGeometry(2.4, 2.4);
    this.shadow = new Mesh(geo, this.shadowMat);
    this.shadow.rotation.x = -Math.PI * 0.5;
    this.shadow.position.y = -1.1;
    this.scene.add(this.shadow);
    this._track(geo, this.shadowMat, tex);
  }

  _track(...items) {
    this._disposables.push(...items);
  }

  start() {
    this.lastT = performance.now();
    this._fpsStart = this.lastT;
    this._raf = requestAnimationFrame(this._tick);
  }

  /* Notify the wrapper when the act enters / leaves the frame so it can show
     or hide the canvas element (belt-and-suspenders against a preserved buffer
     freezing the last cube frame on screen). */
  _setActive(v) {
    if (v === this._active) return;
    this._active = v;
    this.onActive?.(v);
  }

  _adaptQuality(now) {
    this._fpsFrames++;
    const elapsed = now - this._fpsStart;
    if (elapsed < 2000) return;
    const fps = (this._fpsFrames / elapsed) * 1000;
    this._fpsFrames = 0;
    this._fpsStart = now;
    if (fps < 34 && this._pixelRatio > this._minPixelRatio) {
      this._pixelRatio = Math.max(this._pixelRatio * 0.8, this._minPixelRatio);
      this.renderer.setPixelRatio(this._pixelRatio);
    }
  }

  /* Raw runway progress 0..1. Measured from runway-top → hero-top, so p=1
     lands exactly when the Hero has settled at the top of the viewport and its
     right-hand slot is at its natural resting position — the dock moment. */
  _readProgress() {
    // Docked: pinned at the end of the timeline; on screen whenever the hero
    // slot it lives in is in view (it scrolls away cleanly with the hero).
    if (this.docked) {
      const d = this.dockEl?.getBoundingClientRect();
      const onScreen = !!d && d.top < window.innerHeight && d.bottom > 0;
      return { p: 1, onScreen };
    }
    if (!this.runwayEl) return { p: 0, onScreen: false };
    const r = this.runwayEl.getBoundingClientRect();
    const p = MathUtils.clamp(-r.top / Math.max(r.height, 1), 0, 1);
    // engine matters while the runway is anywhere near the frame, or while the
    // docked cube (tied to the hero slot) is still visible
    let onScreen = r.top < window.innerHeight && r.bottom > 0;
    if (!onScreen && p >= 1 && this.dockEl) {
      const d = this.dockEl.getBoundingClientRect();
      onScreen = d.top < window.innerHeight && d.bottom > 0;
    }
    return { p, onScreen };
  }

  /* Dead-centre world target during the fall/reveal (screen centre, z = 0). */
  _centreTarget(out) {
    out.set(0, 0, 0);
  }

  /* Map a screen point (px, top-left origin) to a world point on the cube's
     z=0 plane. The camera sits on the +z axis looking at the origin, so this
     is a straight pixels→world scale about the screen centre. */
  _screenToWorld(px, py, out) {
    out.set(
      (px - window.innerWidth / 2) * this._wpp,
      -(py - window.innerHeight / 2) * this._wpp,
      0
    );
    return out;
  }

  /* Live hero-slot world target during travel/dock (pixel-mapped), returns the
     world size the cube should shrink to so it fits the slot. */
  _dockTarget(out) {
    const d = this.dockEl?.getBoundingClientRect();
    // No reserved slot, OR the slot is hidden below the lg breakpoint (where
    // it is `display:none`, so its rect collapses to all-zeros): rest small in
    // the upper-RIGHT and fade with the hero. Guarding on the zero rect keeps
    // the cube on the right instead of snapping to the top-left corner.
    if (!d || (d.width === 0 && d.height === 0)) {
      this._screenToWorld(window.innerWidth * 0.72, window.innerHeight * 0.4, out);
      return this._centreScale() * 0.42;
    }
    this._screenToWorld(d.left + d.width / 2, d.top + d.height / 2, out);
    // Fit inside the slot box: ~62% of its width, but never taller than ~90% of
    // its height (mobile slots are wide-but-short, so the height cap stops the
    // docked cube spilling up into the caption or down into the copy).
    return Math.max(Math.min(d.width * 0.62, d.height * 0.9) * this._wpp, 0.4);
  }

  _centreScale() {
    // Base presence: ~42% of viewport height. The hero title above it is kept
    // clear by its own higher/smaller placement (see CubeStage), so the cube
    // keeps full presence without rising into the text as it tilts toward its
    // top face.
    const byHeight = 0.42 * window.innerHeight * this._wpp;
    // On narrow screens (phones, portrait tablets) that height-based size would
    // spill past the side edges as the cube spins — its projected width reaches
    // ~√2× mid-turn — and the cube reads as "cut off / disappearing". So also
    // cap it to a fraction of viewport WIDTH; the smaller of the two wins,
    // keeping the whole cube in frame through every rotation at any aspect.
    const byWidth = (0.72 * window.innerWidth * this._wpp) / Math.SQRT2;
    return Math.min(byHeight, byWidth);
  }

  /* Target orientation for the current progress. Reveal choreography (rp is
     progress across the REVEAL window):
       0.00–0.45  a full turn about Y — front → right → back → left → front,
                  so every one of the four upright sides sweeps past the camera
       0.45–0.60  tilt up to the TOP face
       0.60–0.70  HOLD on the top face (a clear beat looking down onto it)
       0.70–0.90  sweep top → front → bottom
       0.90–1.00  HOLD on the BOTTOM face
     The holds guarantee the top and bottom are actually seen at any scroll
     speed; everything is continuous Euler (no keyframe hops) so it reads as
     one heavy, unbroken motion. */
  _orientationFor(p, outQ) {
    if (p <= REVEAL[0]) {
      // during the drop-in, ease from a tilted entry pose to a clean front —
      // subtle rotation that reads as the cube righting itself as it lands
      const fallSpin = smootherstep(win(p, [0, 0.24]));
      outQ.copy(this._incomingQ).slerp(this._faceQ.front, fallSpin);
      return;
    }
    if (p >= TRAVEL[0]) {
      // the reveal ends bottom-facing; settle from there to the hero 3/4 pose
      const tr = smootherstep(win(p, REST));
      outQ.copy(this._faceQ.bottom).slerp(this._restQ, tr);
      return;
    }
    const rp = (p - REVEAL[0]) / (REVEAL[1] - REVEAL[0]); // 0..1
    const HALF_PI = Math.PI / 2;
    let rx = 0;
    let ry = 0;
    if (rp < 0.45) {
      // four upright sides: one smooth 360° turn about Y
      ry = -2 * Math.PI * smootherstep(rp / 0.45);
    } else if (rp < 0.6) {
      // tilt up to the top face
      rx = HALF_PI * smootherstep((rp - 0.45) / 0.15);
    } else if (rp < 0.7) {
      rx = HALF_PI; // hold — look down onto the top
    } else if (rp < 0.9) {
      // sweep top → front → bottom
      rx = HALF_PI - Math.PI * smootherstep((rp - 0.7) / 0.2);
    } else {
      rx = -HALF_PI; // hold — look up at the bottom
    }
    setQuatFromEuler(outQ, rx, ry, 0);
  }

  _tick(now) {
    if (this.disposed) return;
    this._raf = requestAnimationFrame(this._tick);

    const dt = Math.min((now - this.lastT) / 1000, 0.05);
    this.lastT = now;

    const { p: rawP, onScreen } = this._readProgress();

    // Pause entirely when the act is off screen or the tab is hidden. Clear
    // the buffer AND flag inactive so the wrapper can hide the canvas — some
    // browsers (and headless) preserve the drawing buffer, so a stale cube
    // would otherwise linger on the fixed canvas over later sections.
    if (!onScreen || document.hidden) {
      if (this._visible) {
        this.renderer.clear();
        // reset the title so it can't linger over later sections / the footer
        if (this._lastCaption !== 0) {
          this.onCaption?.(0);
          this._lastCaption = 0;
        }
      }
      this._visible = false;
      this._setActive(false);
      return;
    }
    this._visible = true;
    this._setActive(true);
    this.time += dt;
    this._adaptQuality(now);
    const time = this.time;

    // damped master progress → cinematic glide on fast scroll. Low rate =
    // heavy, weighty follow: the cube lags the scroll a touch so the drop-in,
    // rotation and travel carry momentum rather than tracking scroll 1:1 — but
    // not so low that the rotation can't reach the top/bottom extremes.
    this.progress = MathUtils.damp(this.progress, rawP, 3.4, dt);
    const p = this.progress;

    /* -------- position + scale targets -------- */
    const travel = smootherstep(win(p, TRAVEL));
    const centreScale = this._centreScale();

    // "settled" = the cube has finished its entrance and is now resting/docked
    // in the hero. While settled it must track the slot RIGIDLY: the damped
    // follow below is what makes a docked cube rubber-band (lag then spring
    // back) as the page scrolls, which reads as an unwanted bounce. The
    // entrance flight itself (travel < 0.92) keeps its weighty damping.
    const settled = this.docked ? 1 : smootherstep(win(p, [0.92, 1.0]));

    // centre target (screen middle), plus the fall offset from above the frame
    this._centreTarget(this._tPos);
    const fall = smootherstep(1 - win(p, FALL)); // 1 → 0 as it lands
    this._tPos.y += fall * (window.innerHeight * 0.85 * this._wpp);

    // Travel destination: the cube first flies to a FIXED on-screen right-hand
    // anchor (so it stays in frame while the Hero is still scrolling up from
    // below), then in the final stretch eases onto the LIVE hero slot rect —
    // which by then has arrived at that same spot — and stays glued to it,
    // scrolling with the page like an embedded element.
    const dockScale = this._dockTarget(this._v); // live hero-slot world + size
    // Hold at a fixed screen height, but horizontally aligned with the slot the
    // cube is heading for, so the hand-off has no sideways jump — critical on
    // mobile/tablet where the slot sits centred rather than off to the right.
    const dRect = this.dockEl?.getBoundingClientRect();
    const anchorX =
      dRect && (dRect.width || dRect.height)
        ? dRect.left + dRect.width / 2
        : window.innerWidth * 0.72;
    this._screenToWorld(anchorX, window.innerHeight * 0.46, this._anchor);
    const handoff = smootherstep(win(p, [0.88, 1.0]));
    this._anchor.lerp(this._v, handoff); // fixed anchor → live slot
    this._tPos.lerp(this._anchor, travel);
    this._tScale = MathUtils.lerp(centreScale, dockScale, travel);

    // Damped follow (inertia / weight) during the entrance, blending to a
    // rigid 1:1 lock once settled so the docked cube scrolls WITH the slot
    // instead of bouncing/lagging behind it.
    const posLerp = 1 - Math.exp(-6 * dt);
    const posFollow = posLerp + (1 - posLerp) * settled; // → 1 when settled
    this._pos.lerp(this._tPos, posFollow);
    this._scale = MathUtils.lerp(this._scale, this._tScale, posFollow);

    this.cubeGroup.position.copy(this._pos);
    this.cubeGroup.scale.setScalar(this._scale);

    /* -------- orientation -------- */
    this._orientationFor(p, this._tq);
    // Subtle idle life during the reveal, faded fully OUT once settled — a
    // resting cube must sit dead-still, or the constant sway reads as a bounce
    // while the user scrolls.
    const idle = 0.03 * (1 - settled);
    if (idle > 0.0001) {
      this._wobble.setFromAxisAngle(this._wAxis, Math.sin(time * 0.6) * idle);
      this._tq.multiply(this._wobble);
      this._wobble.setFromAxisAngle(new Vector3(1, 0, 0), Math.cos(time * 0.5) * idle * 0.6);
      this._tq.multiply(this._wobble);
    }
    // Heavy, smooth rotational follow during the turn; rigid once settled.
    const qLerp = 1 - Math.exp(-5 * dt);
    this._q.slerp(this._tq, qLerp + (1 - qLerp) * settled);
    this.cubeGroup.quaternion.copy(this._q);

    // Docked mode: hard-snap to the resting pose on the very first frame so the
    // cube appears already placed in the hero (no grow-in from the fall start
    // pose). Afterwards it's already at target, so the damped follow above just
    // tracks the slot as the hero scrolls.
    if (this.docked && !this._seeded) {
      this._pos.copy(this._tPos);
      this._scale = this._tScale;
      this._q.copy(this._tq);
      this.cubeGroup.position.copy(this._pos);
      this.cubeGroup.scale.setScalar(this._scale);
      this.cubeGroup.quaternion.copy(this._q);
      this._seeded = true;
    }

    /* -------- contact shadow + edge glow -------- */
    const grounded = win(p, [0.14, 0.22]) * (1 - travel);
    this.shadowMat.opacity = grounded * 0.5;
    this.shadow.position.copy(this._pos);
    this.shadow.position.y -= this._scale * 0.62;
    this.shadow.scale.setScalar(this._scale * 0.9);
    this.edgeMat.opacity = 0.28 + (1 - travel) * 0.22 + Math.sin(time * 1.4) * 0.04;

    /* -------- readable title signal -------- */
    // Title (above the cube) fades in as the cube drops in and stays legible
    // through the whole face reveal, dissolving only as the cube leaves centre
    // to travel into the hero.
    if (this.onCaption) {
      const c = win(p, [0.05, 0.14]) * (1 - win(p, [0.58, 0.7]));
      if (Math.abs(c - this._lastCaption) > 0.01) {
        this.onCaption(c);
        this._lastCaption = c;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  setTheme(isDark) {
    // rebuild face art for the new theme (cheap; runs on toggle only)
    const size = this._lowEnd ? 256 : 512;
    const next = makeCubeFaces({ isDark, size, images: this._faceImages });
    this.cubeMats.forEach((m, i) => {
      m.map = next.textures[i];
      m.needsUpdate = true;
    });
    this._faces.dispose();
    this._faces = next;
    this.edgeMat.color = new Color(isDark ? 0x7dff9e : 0x0a7d37);
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this._raf);
    window.removeEventListener("resize", this._onResize);
    this._faces?.dispose();
    this._envRT?.dispose();
    for (const item of this._disposables) item.dispose?.();
    this.renderer.dispose();
  }
}

/* Write XYZ Euler angles into an existing quaternion without importing Euler —
   three's Quaternion.setFromEuler needs a real Euler instance, so we compose
   the axis rotations directly (X then Y then Z, matching order "XYZ"). In-place
   so the per-frame reveal path allocates nothing. */
function setQuatFromEuler(q, x, y, z) {
  const c1 = Math.cos(x / 2), s1 = Math.sin(x / 2);
  const c2 = Math.cos(y / 2), s2 = Math.sin(y / 2);
  const c3 = Math.cos(z / 2), s3 = Math.sin(z / 2);
  return q.set(
    s1 * c2 * c3 + c1 * s2 * s3,
    c1 * s2 * c3 - s1 * c2 * s3,
    c1 * c2 * s3 + s1 * s2 * c3,
    c1 * c2 * c3 - s1 * s2 * s3
  );
}

/* Allocating convenience wrapper — used only at construction time. */
function quatFromEuler(x, y, z) {
  return setQuatFromEuler(new Quaternion(), x, y, z);
}

export default CubeEngine;
