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
 * CubeEngine — act two of the prologue, straight after the scroll-journey
 * ride and right before the world begins.
 *
 * A single photo-faced cube on a fixed, transparent, pointer-through canvas.
 * Scroll through the CubeAct runway is the master timeline (0..1), damped so
 * fast flicks still glide:
 *
 *   fall     the cube drops in from above the viewport and eases to dead
 *            centre — accel → decel, with damping standing in for weight
 *   reveal   it rotates through every side in full 3D — four upright faces,
 *            then top (hold), then bottom (hold) — slerped and damped
 *   release  the rotation complete, the cube ascends and recedes, spinning
 *            slowly away into the universe — and as it vanishes the world's
 *            arrival chapter takes the frame. No dock, no page: the cube
 *            returns to the world it came from.
 *
 * Quality contract: one cube, ~6 draw calls, adaptive pixel-ratio, renders
 * only while its runway is on screen, dispose() frees every GPU resource.
 */

/* Timeline windows (fractions of the runway scroll). */
const FALL = [0.0, 0.24]; // longer, gentler drop-in (heavier feel)
const REVEAL = [0.26, 0.66]; // spin through 4 sides, then hold top, then bottom
const RELEASE = [0.7, 0.98]; // ascend + recede into the universe
const REST = [0.66, 0.78]; // settle from bottom-face to the 3/4 pose first

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
      runwayEl = null,
      onCaption = null,
      onActive = null,
      images = [],
    } = opts;

    this.canvas = canvas;
    this.runwayEl = runwayEl;
    this.onCaption = onCaption;
    this.onActive = onActive;
    this._faceImages = images;
    this.coarse = coarse;
    this.disposed = false;
    this._active = false;

    this.time = 0;
    this.lastT = 0;
    this.progress = 0;
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
    this._wobble = new Quaternion();
    this._wAxis = new Vector3(0, 1, 0);
    this._xAxis = new Vector3(1, 0, 0);

    /* precomputed face quaternions + the resting 3/4 departure pose */
    this._faceQ = {};
    for (const [k, [x, y, z]] of Object.entries(FACE_EULER)) {
      this._faceQ[k] = quatFromEuler(x, y, z);
    }
    this._restQ = quatFromEuler(-0.42, -0.62, 0.06); // shows front + right + top
    this._incomingQ = quatFromEuler(-0.55, 0.7, 0.28); // tilted entry as it drops

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
    // Photo faces are UNLIT (MeshBasicMaterial): every side shows the photo
    // flat and true at full brightness regardless of how the cube is turned.
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
     "landed" weight at centre and fades as the cube releases upward. */
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
     or hide the canvas element (belt-and-suspenders against a preserved
     buffer freezing the last cube frame on screen). */
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

  /* Raw runway progress 0..1 + whether the act is anywhere near the frame.
     p reaches 1 exactly when the runway's last viewport-height scrolls out —
     the moment the world region arrives. */
  _readProgress() {
    if (!this.runwayEl) return { p: 0, onScreen: false };
    const r = this.runwayEl.getBoundingClientRect();
    const p = MathUtils.clamp(-r.top / Math.max(r.height - window.innerHeight, 1), 0, 1);
    const onScreen = r.top < window.innerHeight && r.bottom > 0;
    return { p, onScreen };
  }

  _centreScale() {
    // Base presence: ~42% of viewport height, width-capped so the cube stays
    // fully in frame through every rotation at any aspect ratio.
    const byHeight = 0.42 * window.innerHeight * this._wpp;
    const byWidth = (0.72 * window.innerWidth * this._wpp) / Math.SQRT2;
    return Math.min(byHeight, byWidth);
  }

  /* Target orientation for the current progress. Reveal choreography (rp is
     progress across the REVEAL window):
       0.00–0.45  a full turn about Y — all four upright sides sweep past
       0.45–0.60  tilt up to the TOP face
       0.60–0.70  HOLD on the top face
       0.70–0.90  sweep top → front → bottom
       0.90–1.00  HOLD on the BOTTOM face
     After the reveal the cube settles to a 3/4 pose, then spins slowly away
     as it releases into the universe. */
  _orientationFor(p, outQ) {
    if (p <= REVEAL[0]) {
      const fallSpin = smootherstep(win(p, [0, 0.24]));
      outQ.copy(this._incomingQ).slerp(this._faceQ.front, fallSpin);
      return;
    }
    if (p >= REVEAL[1]) {
      // reveal ends bottom-facing; settle to the 3/4 pose, then depart with a
      // slow continuous spin as the cube recedes
      const tr = smootherstep(win(p, REST));
      outQ.copy(this._faceQ.bottom).slerp(this._restQ, tr);
      const away = smootherstep(win(p, RELEASE));
      if (away > 0.0001) {
        this._wobble.setFromAxisAngle(this._wAxis, away * 1.6);
        outQ.multiply(this._wobble);
        this._wobble.setFromAxisAngle(this._xAxis, away * 0.5);
        outQ.multiply(this._wobble);
      }
      return;
    }
    const rp = (p - REVEAL[0]) / (REVEAL[1] - REVEAL[0]); // 0..1
    const HALF_PI = Math.PI / 2;
    let rx = 0;
    let ry = 0;
    if (rp < 0.45) {
      ry = -2 * Math.PI * smootherstep(rp / 0.45);
    } else if (rp < 0.6) {
      rx = HALF_PI * smootherstep((rp - 0.45) / 0.15);
    } else if (rp < 0.7) {
      rx = HALF_PI; // hold — look down onto the top
    } else if (rp < 0.9) {
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

    // Pause entirely when the act is off screen or the tab is hidden.
    if (!onScreen || document.hidden) {
      if (this._visible) {
        this.renderer.clear();
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

    // damped master progress → heavy, weighty follow on fast scroll
    this.progress = MathUtils.damp(this.progress, rawP, 3.4, dt);
    const p = this.progress;

    /* -------- position + scale -------- */
    const release = smootherstep(win(p, RELEASE));
    const centreScale = this._centreScale();

    this._tPos.set(0, 0, 0);
    const fall = smootherstep(1 - win(p, FALL)); // 1 → 0 as it lands
    this._tPos.y += fall * (window.innerHeight * 0.85 * this._wpp);
    // release: ascend and recede — the cube returns to the universe
    this._tPos.y += release * (window.innerHeight * 0.42 * this._wpp);
    this._tPos.z -= release * 10;
    this._tScale = centreScale * (1 - release * 0.85);

    const posLerp = 1 - Math.exp(-6 * dt);
    this._pos.lerp(this._tPos, posLerp);
    this._scale = MathUtils.lerp(this._scale, this._tScale, posLerp);

    this.cubeGroup.position.copy(this._pos);
    this.cubeGroup.scale.setScalar(this._scale);

    /* -------- orientation -------- */
    this._orientationFor(p, this._tq);
    // subtle idle life, faded out as the cube departs
    const idle = 0.03 * (1 - release);
    if (idle > 0.0001) {
      this._wobble.setFromAxisAngle(this._wAxis, Math.sin(time * 0.6) * idle);
      this._tq.multiply(this._wobble);
      this._wobble.setFromAxisAngle(this._xAxis, Math.cos(time * 0.5) * idle * 0.6);
      this._tq.multiply(this._wobble);
    }
    this._q.slerp(this._tq, 1 - Math.exp(-5 * dt));
    this.cubeGroup.quaternion.copy(this._q);

    /* -------- contact shadow + edge glow -------- */
    const grounded = win(p, [0.14, 0.22]) * (1 - release);
    this.shadowMat.opacity = grounded * 0.5;
    this.shadow.position.copy(this._pos);
    this.shadow.position.y -= this._scale * 0.62;
    this.shadow.scale.setScalar(this._scale * 0.9);
    this.edgeMat.opacity =
      (0.28 + (1 - release) * 0.22 + Math.sin(time * 1.4) * 0.04) * (1 - release * 0.7);

    /* -------- readable title signal -------- */
    // Title fades in as the cube drops in and stays legible through the face
    // reveal, dissolving as the cube leaves centre to depart.
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
    for (const item of this._disposables) item.dispose?.();
    this.renderer.dispose();
  }
}

/* Write XYZ Euler angles into an existing quaternion without importing Euler —
   composed directly (X then Y then Z, matching order "XYZ"), in-place so the
   per-frame reveal path allocates nothing. */
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
