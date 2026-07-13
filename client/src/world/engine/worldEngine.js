import {
  Fog,
  MathUtils,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import {
  CHAPTERS,
  courseWindow,
  COURSE_COUNT,
  PROLOGUE_VH,
  WORLD_VH,
  sstep,
  bell,
} from "../worldTimeline.js";
import { samplePoint, sampleTangent, docAnchor } from "./roadPath.js";
import { createAtmosphere } from "./atmosphere.js";
import { createRoad } from "./road.js";
import { createDocuments } from "./documents.js";
import { createGMark, G_POS } from "./gMark.js";

/**
 * WorldEngine — the GOA digital world. One scene, one camera, one master
 * timeline: page scroll (0..1).
 *
 * The camera is the storyteller. It descends into the universe (arrival),
 * rides above the energy road as scroll builds it (roadIntro → courses),
 * glances at each course artifact as the road bends past it, drifts into
 * the dark for the story typography and the film sequence (which live in
 * the DOM overlay above this canvas), circles the assembling cube-G, and
 * finally pulls up and away as the world dissolves into rising light.
 *
 * Performance contract (inherited from the original journeyEngine):
 *  - unlit materials only, ~35 draw calls worst case
 *  - instanced meshes / Points for everything numerous
 *  - single rAF; every motion damped (frame-rate independent)
 *  - zero per-frame allocations; capped DPR; FPS-adaptive step-down
 *  - dispose() releases every GPU resource
 */

/* Camera rig constants */
const CAM_HEIGHT = 1.6;
const CAM_BACK = 2.6;
const LOOK_AHEAD = 0.055;
const LOOK_HEIGHT = 1.05;

export class WorldEngine {
  constructor(canvas, { coarse = false } = {}) {
    this.canvas = canvas;
    this.disposed = false;
    this.progress = 0;
    this.time = 0;
    this.lastT = 0;
    this.maxScroll = 1;
    this._fpsFrames = 0;
    this._fpsStart = 0;
    this._boot = 0; // time-based fade-in on top of scroll reveal

    /* scratch — reused every frame */
    this._v1 = new Vector3();
    this._v2 = new Vector3();
    this._v3 = new Vector3();
    this._v4 = new Vector3();
    this._pos = new Vector3(0, 5.5, 13);
    this._look = new Vector3(0, 0.5, -20);

    /* damped pointer parallax */
    this.px = 0;
    this.py = 0;
    this._tpx = 0;
    this._tpy = 0;

    this.renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
    const gl = this.renderer.getContext();
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    const gpu = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : "";
    const software = /swiftshader|llvmpipe|software/i.test(gpu);
    this.coarse = coarse || software;
    this._pixelRatio = software
      ? 0.75
      : Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 1.75);
    this._minPixelRatio = 0.5;
    this.renderer.setPixelRatio(this._pixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);

    this.scene = new Scene();
    this.scene.fog = new Fog(0x020604, 14, 58);

    this.camera = new PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 140);
    this.camera.position.copy(this._pos);

    this._disposables = [];
    const ctx = {
      scene: this.scene,
      coarse: this.coarse,
      track: (...items) => this._disposables.push(...items),
    };
    this.atmosphere = createAtmosphere(ctx);
    this.road = createRoad(ctx);
    this.documents = createDocuments(ctx);
    this.gMark = createGMark(ctx);

    /* course anchors for camera glances */
    this._docAnchors = Array.from({ length: COURSE_COUNT }, (_, i) => docAnchor(i));
    this._docWindows = Array.from({ length: COURSE_COUNT }, (_, i) => courseWindow(i));

    this._onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this._measure();
    };
    window.addEventListener("resize", this._onResize, { passive: true });

    this._onPointer = (e) => {
      this._tpx = (e.clientX / window.innerWidth) * 2 - 1;
      this._tpy = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (!this.coarse) {
      window.addEventListener("pointermove", this._onPointer, { passive: true });
    }

    /* The world's timeline starts where the prologue (ride + cube) ends and
       spans the rest of the document. All runway heights are vh-based, so a
       resize is fully handled by remeasuring against innerHeight. */
    this._measure = () => {
      const vh = window.innerHeight;
      this._worldStart = (PROLOGUE_VH / 100) * vh;
      this._worldSpan = Math.max(((WORLD_VH - 100) / 100) * vh, 1);
    };
    this._measure();
    this._asleep = false;

    this._tick = this._tick.bind(this);
  }

  start() {
    this.lastT = performance.now();
    this._fpsStart = this.lastT;
    this._raf = requestAnimationFrame(this._tick);
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

  /** Camera choreography — target position/look for progress p.
   *  Piecewise by chapter; endpoints line up, and damping in _tick welds
   *  the joins into one continuous cinematic move. */
  _cameraAt(p, outPos, outLook) {
    const [, arriveEnd] = CHAPTERS.arrival;
    const roadStart = arriveEnd;
    const [, coursesEnd] = CHAPTERS.courses;
    const [storyStart, storyEnd] = CHAPTERS.story;
    const [, videosEnd] = CHAPTERS.videos;
    const [gStart, gEnd] = CHAPTERS.gMark;
    const [finStart] = CHAPTERS.finale;

    /* rig above the road at curve param t */
    const roadCam = (t, pos, look) => {
      samplePoint(t, pos);
      sampleTangent(t, this._v3);
      pos.addScaledVector(this._v3, -CAM_BACK);
      pos.y += CAM_HEIGHT;
      samplePoint(Math.min(t + LOOK_AHEAD, 1), look);
      look.y += LOOK_HEIGHT;
    };

    if (p < roadStart) {
      /* arrival: descend from high above into the road rig */
      const t = sstep(p, 0, arriveEnd);
      roadCam(0, this._v1, this._v2);
      outPos.set(0, 5.5, 13).lerp(this._v1, t);
      outLook.set(0, 0.5, -20).lerp(this._v2, t);
    } else if (p < storyStart) {
      /* ride the road; glance at each course artifact in its window */
      const t = MathUtils.mapLinear(p, roadStart, coursesEnd, 0.01, 0.93);
      roadCam(MathUtils.clamp(t, 0, 0.93), outPos, outLook);
      for (let i = 0; i < COURSE_COUNT; i++) {
        const [a, b] = this._docWindows[i];
        const w = bell(p, a, b, 0.35, 0.3);
        if (w > 0.001) outLook.lerp(this._docAnchors[i], w * 0.55);
      }
    } else if (p < videosEnd) {
      /* story + films: leave the road's end and drift dead-slow into the dark */
      roadCam(0.93, this._v1, this._v2);
      const t = sstep(p, storyStart, storyEnd + 0.02);
      outPos.lerpVectors(this._v1, this._v4.set(0, 0.8, -84), t);
      outLook.lerpVectors(this._v2, this._v3.set(0, 1.3, -96), t);
      const drift = sstep(p, storyEnd, videosEnd) * 4;
      outPos.z -= drift; // -84 → -88 across the film sequence
    } else if (p < finStart) {
      /* the monument: swing into orbit around the G */
      const t = sstep(p, gStart, gEnd);
      const angle = t * Math.PI * 1.6;
      const radius = 8 - t * 2.5;
      outPos.set(
        G_POS.x + Math.sin(angle) * radius,
        G_POS.y + 0.4 + Math.sin(t * Math.PI) * 1.6,
        G_POS.z + Math.cos(angle) * radius
      );
      outLook.copy(G_POS);
    } else {
      /* finale: rise and pull away as the world returns to light */
      const t = sstep(p, finStart, finStart + 0.1);
      const angle = Math.PI * 1.6;
      this._v1.set(
        G_POS.x + Math.sin(angle) * 5.5,
        G_POS.y + 0.4,
        G_POS.z + Math.cos(angle) * 5.5
      );
      outPos.lerpVectors(this._v1, this._v4.set(0, 11, -76), t);
      outLook.copy(G_POS);
      outLook.y += sstep(p, finStart, 1) * 3;
    }
  }

  _tick(now) {
    if (this.disposed) return;
    this._raf = requestAnimationFrame(this._tick);

    /* asleep while the prologue owns the frame — wake just before handoff */
    if (window.scrollY < this._worldStart - window.innerHeight * 1.5) {
      if (!this._asleep) {
        this.renderer.clear();
        this._asleep = true;
      }
      this.lastT = now;
      return;
    }
    this._asleep = false;

    const dt = Math.min((now - this.lastT) / 1000, 0.05);
    this.lastT = now;
    this.time += dt;
    this._boot = Math.min(this._boot + dt / 1.6, 1);
    this._adaptQuality(now);
    const time = this.time;

    /* master timeline — damped so fast scrolling still glides */
    const target = MathUtils.clamp(
      (window.scrollY - this._worldStart) / this._worldSpan,
      0,
      1
    );
    this.progress = MathUtils.damp(this.progress, target, 4.2, dt);
    const p = this.progress;
    this.px = MathUtils.damp(this.px, this._tpx, 3.5, dt);
    this.py = MathUtils.damp(this.py, this._tpy, 3.5, dt);

    /* ------ camera: choreography + breath + pointer lean ------ */
    this._cameraAt(p, this._v1, this._v2);
    this._v1.x += Math.sin(time * 0.23) * 0.16 + this.px * 0.4;
    this._v1.y += Math.cos(time * 0.31) * 0.1 - this.py * 0.28;
    this._pos.lerp(this._v1, 1 - Math.exp(-3.6 * dt));
    this._look.lerp(this._v2, 1 - Math.exp(-4 * dt));
    this.camera.position.copy(this._pos);
    this.camera.lookAt(this._look);

    /* ------ master drives ------ */
    const reveal = sstep(p, 0, 0.04) * 0.4 + 0.6 * this._boot;
    /* the world hushes for the story + film chapters, returns for the G */
    const hush =
      sstep(p, 0.465, 0.5) * (1 - sstep(p, CHAPTERS.videos[1] - 0.02, CHAPTERS.gMark[0] + 0.01));
    const blackout = sstep(p, 0.975, 0.998); // DOM fade owns the very end
    const dim = (1 - hush * 0.85) * (1 - blackout);
    const warp = sstep(p, 0.86, 0.97);

    /* road builds just ahead of the camera and completes before course 6:
       first stretch is born during roadIntro (the "energy builds the road"
       reveal), the rest extends steadily through the course chapters */
    const [riStart, riEnd] = CHAPTERS.roadIntro;
    const buildDone = CHAPTERS.courses[1] - 0.04;
    const build =
      p < riEnd
        ? sstep(p, riStart, riEnd) * 0.18
        : 0.18 + MathUtils.clamp(MathUtils.mapLinear(p, riEnd, buildDone, 0, 0.82), 0, 0.82);
    const roadFade = 1 - sstep(p, CHAPTERS.story[0], CHAPTERS.story[0] + 0.05);

    /* fog breathes with the chapters: tight in the hush, open on the road */
    this.scene.fog.near = 14 - hush * 6;
    this.scene.fog.far = 58 - hush * 18 + warp * 30;

    const frame = { p, time, dt, dim, reveal, warp, build, fade: roadFade };
    this.atmosphere.update(frame);
    this.road.update(frame);
    this.documents.update(frame);
    this.gMark.update(frame);

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this._raf);
    window.removeEventListener("resize", this._onResize);
    window.removeEventListener("pointermove", this._onPointer);
    for (const item of this._disposables) item.dispose?.();
    this.renderer.dispose();
  }
}

export default WorldEngine;
