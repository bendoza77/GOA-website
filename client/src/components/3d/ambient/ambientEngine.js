import {
  Fog,
  MathUtils,
  Object3D,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";

/**
 * AmbientEngine — the shared runtime behind every inner page's 3D ambience.
 *
 * Where JourneyEngine tells the Home story, AmbientEngine is deliberately
 * generic: it owns the renderer, camera, master timeline (damped page-scroll
 * progress) and damped pointer parallax, and delegates the actual objects to
 * a small per-page scene definition:
 *
 *   {
 *     camera?: [x, y, z]      // base camera position (default [0, 0, 8])
 *     look?:   [x, y, z]      // camera target (default origin)
 *     parallax?: number       // pointer sway amplitude (default 0.5)
 *     dolly?: number          // camera z travel across full scroll (default 0)
 *     fog?: [near, far]       // optional depth fade toward the page colour
 *     build(engine)           // create objects; register GPU resources via track()
 *     update(engine)          // per-frame animation (time/dt/progress/px/py)
 *     theme(engine)           // recolour materials from engine.palette
 *     themes?: { dark, light} // palette override (defaults to brand greens)
 *   }
 *
 * Performance contract (same as JourneyEngine):
 *  - unlit materials only, instanced meshes / Points, single rAF loop
 *  - all motion damped (frame-rate independent), zero per-frame allocations
 *  - capped + adaptive pixel ratio, reduced counts on coarse pointers
 *  - dispose() releases every GPU resource
 */

/* Brand palette used by every scene unless it overrides `themes`. */
export const PALETTES = {
  dark: {
    a: "#7dff9e", // neon lime — highlights
    b: "#57e08a", // mid green — structure
    c: "#2fbf5f", // deep green — fills
    ink: "#0c140e",
    dim: 1, // master opacity multiplier
  },
  light: {
    a: "#0d8f3f",
    b: "#16a34a",
    c: "#15803d",
    ink: "#f4faf6",
    dim: 0.45,
  },
};

/** Deterministic pseudo-random — stable layouts across visits. */
export const mulberry = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** smoothstep of p across [a, b] — handy for scroll-windowed effects. */
export const win = (p, a, b) => MathUtils.smoothstep(p, a, b);

export class AmbientEngine {
  constructor(canvas, def, { isDark = true, coarse = false } = {}) {
    this.canvas = canvas;
    this.def = def;
    this.disposed = false;

    /* master timeline + pointer (all damped in _tick) */
    this.progress = 0;
    this.time = 0;
    this.lastT = 0;
    this.maxScroll = 1;
    this.px = 0;
    this.py = 0;
    this._tpx = 0;
    this._tpy = 0;
    this._fpsFrames = 0;
    this._fpsStart = 0;

    /* scratch objects — reused every frame, never allocated in the loop */
    this.dummy = new Object3D();
    this._v1 = new Vector3();
    this._v2 = new Vector3();

    this.renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });

    /* Adaptive quality — same tiering as JourneyEngine. */
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
    if (def.fog) this.scene.fog = new Fog(0x000000, def.fog[0], def.fog[1]);

    this.camera = new PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      60
    );
    this.camBase = new Vector3(...(def.camera ?? [0, 0, 8]));
    this.camLook = new Vector3(...(def.look ?? [0, 0, 0]));
    this.parallax = def.parallax ?? 0.5;
    this.dolly = def.dolly ?? 0;
    this.camera.position.copy(this.camBase);
    this.camera.lookAt(this.camLook);

    this._disposables = [];
    this.state = {}; // scene-owned refs live here
    def.build(this);
    this.setTheme(isDark);

    this._onResize = this._handleResize.bind(this);
    window.addEventListener("resize", this._onResize, { passive: true });

    /* pointer parallax — fine pointers only, damped in the loop */
    this._onPointer = (e) => {
      this._tpx = (e.clientX / window.innerWidth) * 2 - 1;
      this._tpy = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (!this.coarse) {
      window.addEventListener("pointermove", this._onPointer, { passive: true });
    }

    /* Track document height without per-frame layout reads. */
    this._measure = () => {
      this.maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
    };
    this._measure();
    this._ro = new ResizeObserver(this._measure);
    this._ro.observe(document.body);

    this._tick = this._tick.bind(this);
  }

  /** Register geometries/materials/instanced meshes for disposal. */
  track(...items) {
    this._disposables.push(...items);
  }

  setTheme(isDark) {
    this.isDark = isDark;
    const palettes = this.def.themes ?? PALETTES;
    this.palette = palettes[isDark ? "dark" : "light"];
    this.dim = this.palette.dim ?? 1;
    this.def.theme(this);
    if (this.scene.fog) {
      const bg = getComputedStyle(document.documentElement)
        .getPropertyValue("--color-void")
        .trim();
      if (bg) this.scene.fog.color.set(bg);
    }
  }

  start() {
    this.lastT = performance.now();
    this._fpsStart = this.lastT;
    this._raf = requestAnimationFrame(this._tick);
  }

  /** Rolling 2s FPS check — one-way pixel-ratio step-down. */
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

  _handleResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this._measure();
  }

  _tick(now) {
    if (this.disposed) return;
    this._raf = requestAnimationFrame(this._tick);

    const dt = Math.min((now - this.lastT) / 1000, 0.05);
    this.lastT = now;
    this.time += dt;
    this.dt = dt;
    this._adaptQuality(now);

    /* damped master timeline + pointer — fast input still glides */
    const target = MathUtils.clamp(window.scrollY / this.maxScroll, 0, 1);
    this.progress = MathUtils.damp(this.progress, target, 4.2, dt);
    this.px = MathUtils.damp(this.px, this._tpx, 3.5, dt);
    this.py = MathUtils.damp(this.py, this._tpy, 3.5, dt);

    /* camera: base + pointer sway + scroll dolly + gentle handheld drift */
    this._v1
      .copy(this.camBase)
      .add(
        this._v2.set(
          this.px * this.parallax + Math.sin(this.time * 0.21) * 0.1,
          -this.py * this.parallax * 0.6 + Math.cos(this.time * 0.27) * 0.07,
          this.progress * this.dolly
        )
      );
    this.camera.position.copy(this._v1);
    this.camera.lookAt(this.camLook);

    this.def.update(this);
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this._raf);
    window.removeEventListener("resize", this._onResize);
    window.removeEventListener("pointermove", this._onPointer);
    this._ro.disconnect();
    for (const item of this._disposables) item.dispose?.();
    this.renderer.dispose();
  }
}

export default AmbientEngine;
