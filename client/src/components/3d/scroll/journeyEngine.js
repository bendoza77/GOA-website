import {
  AdditiveBlending,
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Fog,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Scene,
  SphereGeometry,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
} from "three";

/**
 * JourneyEngine — the scroll-driven 3D story behind the Home page.
 *
 * One continuous scene, one camera. Page scroll progress (0..1) is the master
 * timeline: the camera travels a cinematic path while the story unfolds in
 * overlapping chapters —
 *
 *   1. drift through a particle "code universe" with floating code panels
 *   2. scattered knowledge nodes gather into orbit around a wireframe core
 *   3. a glowing learning pathway arcs away from the core
 *   4. pixel cubes assemble into the GOA "G" mark at the end of the path
 *   5. everything disperses as the camera pulls up for a wide finale
 *
 * Performance contract:
 *  - unlit materials only (no lights/shadows), ~15 draw calls
 *  - instanced meshes for nodes / path beads / pixel cubes; Points for stars
 *  - a single rAF loop; all motion damped (frame-rate independent) so scroll
 *    can never snap or jitter the scene
 *  - zero per-frame allocations (pre-allocated scratch vectors)
 *  - capped device pixel ratio; reduced counts on coarse-pointer devices
 *  - dispose() releases every GPU resource
 */

/* Timeline windows (fractions of full Home scroll) for each story beat. */
const BEATS = {
  gather: [0.1, 0.32], // nodes+panels: scatter → orbit the core
  path: [0.3, 0.44], // learning pathway fades in
  pathOut: [0.68, 0.84], // ...and back out
  gAssemble: [0.48, 0.7], // pixel-G assembles
  disperse: [0.78, 0.96], // nodes+G scatter for the finale
};

/* Camera keyframes: [progress, position, lookAt]. Interpolated with
   smoothstep between neighbours, then damped — cinematic by construction. */
const CAM_KEYS = [
  [0.0, new Vector3(0, 0.2, 6), new Vector3(0, 0, -8)],
  [0.18, new Vector3(2.3, 0.7, 0.5), new Vector3(0, 0, -14)],
  [0.36, new Vector3(-2.6, 1.1, -7.5), new Vector3(0.5, 0, -15)],
  [0.54, new Vector3(-0.8, 0.5, -16.5), new Vector3(6, -0.6, -28)],
  [0.72, new Vector3(4.2, 0.3, -23.5), new Vector3(6, -0.5, -31)],
  [0.88, new Vector3(2.0, 2.4, -18), new Vector3(1, 0, -34)],
  [1.0, new Vector3(0, 3.4, -12), new Vector3(0, 0.5, -40)],
];

const CORE_POS = new Vector3(0, 0, -14);
/* off to the right of the camera's finale framing so the assembling mark
   never sits directly behind section copy */
const G_POS = new Vector3(7.8, -0.5, -31.5);

/* The GOA pixel mark, as a cube grid (1 = cube). */
const G_GRID = ["11111", "10000", "10011", "10001", "11111"];

const THEMES = {
  dark: {
    star: "#7dff9e",
    core: "#57e08a",
    coreInner: "#2fbf5f",
    node: "#7dff9e",
    panel: "#ffffff",
    path: "#7dff9e",
    cube: "#57e08a",
    starOpacity: 0.75,
    panelOpacity: 0.5,
    nodeOpacity: 0.9,
    coreInnerOpacity: 0.28,
    dim: 1, // master multiplier for scroll-driven opacities
  },
  light: {
    star: "#0d8f3f",
    core: "#16a34a",
    coreInner: "#15803d",
    node: "#0a7d37",
    panel: "#ffffff",
    path: "#0d8f3f",
    cube: "#16a34a",
    starOpacity: 0.4,
    panelOpacity: 0.28,
    nodeOpacity: 0.4,
    coreInnerOpacity: 0.1,
    dim: 0.5,
  },
};

/* smoothstep of p across [a, b] */
const win = (p, a, b) => MathUtils.smoothstep(p, a, b);

/** Deterministic pseudo-random (stable scatter layouts across visits). */
const mulberry = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** Tiny "code editor" texture shared by every floating panel.
 *  Two variants so panels read as dark glass in dark mode and pale cards in
 *  light mode instead of heavy slabs. */
function makeCodeTexture(isDark) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 160;
  const g = c.getContext("2d");
  const bg = isDark ? "rgba(6, 14, 9, 0.92)" : "rgba(244, 250, 246, 0.9)";
  const frame = isDark ? "rgba(125, 255, 158, 0.5)" : "rgba(22, 163, 74, 0.5)";
  const lineA = isDark ? "rgba(125, 255, 158, 0.85)" : "rgba(13, 143, 63, 0.8)";
  const lineB = isDark ? "rgba(87, 224, 138, 0.45)" : "rgba(21, 128, 61, 0.35)";
  g.fillStyle = bg;
  g.fillRect(0, 0, 256, 160);
  g.strokeStyle = frame;
  g.strokeRect(1, 1, 254, 158);
  // title bar dots
  for (let i = 0; i < 3; i++) {
    g.fillStyle = frame;
    g.beginPath();
    g.arc(14 + i * 14, 13, 4, 0, Math.PI * 2);
    g.fill();
  }
  const rand = mulberry(7);
  let y = 34;
  while (y < 148) {
    const indent = 12 + Math.floor(rand() * 3) * 16;
    const width = 40 + rand() * (200 - indent);
    g.fillStyle = rand() > 0.7 ? lineA : lineB;
    g.fillRect(indent, y, width, 6);
    y += 14;
  }
  return new CanvasTexture(c);
}

export class JourneyEngine {
  constructor(canvas, { isDark = true, coarse = false } = {}) {
    this.canvas = canvas;
    this.disposed = false;
    this.progress = 0;
    this.time = 0;
    this.lastT = 0;
    this.maxScroll = 1;
    /* fps accounting for adaptive quality */
    this._fpsFrames = 0;
    this._fpsStart = 0;

    /* scratch objects — reused every frame, never allocated in the loop */
    this._v1 = new Vector3();
    this._v2 = new Vector3();
    this._v3 = new Vector3();
    this._look = new Vector3(0, 0, -8);
    this._dummy = new Object3D();

    this.renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });

    /* Adaptive quality: software rasterizers (SwiftShader/llvmpipe) and
       coarse-pointer devices start at a lower tier; if measured FPS still
       sags, _tick steps the pixel ratio down until the frame rate holds. */
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
    this.scene.fog = new Fog(0x000000, 18, 46); // colour set by theme

    this.camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 80);
    this.camera.position.copy(CAM_KEYS[0][1]);

    this._disposables = [];
    this._buildStars();
    this._buildCore();
    this._buildNodes();
    this._buildPanels();
    this._buildPath();
    this._buildPixelG();

    this.setTheme(isDark);

    this._onResize = this._handleResize.bind(this);
    window.addEventListener("resize", this._onResize, { passive: true });

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

  /* ---------------------------------------------------------- builders */

  _track(...items) {
    this._disposables.push(...items);
  }

  _buildStars() {
    const count = this.coarse ? 700 : 1400;
    const rand = mulberry(42);
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rand() - 0.5) * 60;
      pos[i * 3 + 1] = (rand() - 0.5) * 30;
      pos[i * 3 + 2] = -46 + rand() * 60;
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(pos, 3));
    this.starMat = new PointsMaterial({
      size: 0.07,
      sizeAttenuation: true,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    this.stars = new Points(geo, this.starMat);
    this.scene.add(this.stars);
    this._track(geo, this.starMat);
  }

  _buildCore() {
    this.core = new Group();
    this.core.position.copy(CORE_POS);

    const wireGeo = new IcosahedronGeometry(1.6, 1);
    this.coreWireMat = new MeshBasicMaterial({
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });
    this.coreWire = new Mesh(wireGeo, this.coreWireMat);

    const innerGeo = new IcosahedronGeometry(0.85, 0);
    this.coreInnerMat = new MeshBasicMaterial({
      transparent: true,
      opacity: 0.28,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    this.coreInner = new Mesh(innerGeo, this.coreInnerMat);

    this.core.add(this.coreWire, this.coreInner);
    this.scene.add(this.core);
    this._track(wireGeo, innerGeo, this.coreWireMat, this.coreInnerMat);
  }

  _buildNodes() {
    const count = this.coarse ? 28 : 48;
    const rand = mulberry(1234);
    const geo = new IcosahedronGeometry(0.09, 0);
    this.nodeMat = new MeshBasicMaterial({
      transparent: true,
      opacity: 0.9,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    this.nodes = new InstancedMesh(geo, this.nodeMat, count);
    this.nodeData = Array.from({ length: count }, () => ({
      scatter: new Vector3((rand() - 0.5) * 34, (rand() - 0.5) * 18, -30 + rand() * 34),
      radius: 2.4 + rand() * 1.8,
      speed: 0.12 + rand() * 0.25,
      phase: rand() * Math.PI * 2,
      incline: (rand() - 0.5) * 1.6,
    }));
    this.scene.add(this.nodes);
    this._track(geo, this.nodeMat, this.nodes);
  }

  _buildPanels() {
    const count = this.coarse ? 5 : 8;
    const rand = mulberry(99);
    this.panelTex = { dark: makeCodeTexture(true), light: makeCodeTexture(false) };
    const geo = new PlaneGeometry(1.7, 1.06);
    this.panelMat = new MeshBasicMaterial({
      map: this.panelTex.dark,
      transparent: true,
      side: DoubleSide,
      depthWrite: false,
    });
    this.panels = [];
    this.panelData = [];
    for (let i = 0; i < count; i++) {
      const mesh = new Mesh(geo, this.panelMat);
      this.panels.push(mesh);
      this.panelData.push({
        drift: new Vector3((rand() - 0.5) * 16, (rand() - 0.5) * 7, -1 - rand() * 12),
        orbitR: 3.6 + rand() * 1.6,
        orbitSpeed: 0.1 + rand() * 0.12,
        phase: rand() * Math.PI * 2,
        bob: 0.5 + rand() * 0.8,
        tilt: (rand() - 0.5) * 0.5,
      });
      this.scene.add(mesh);
    }
    this._track(geo, this.panelMat, this.panelTex.dark, this.panelTex.light);
  }

  _buildPath() {
    const curve = new CatmullRomCurve3([
      new Vector3(0.8, -0.4, -16),
      new Vector3(3.2, 0.5, -20),
      new Vector3(5.2, -0.7, -24),
      new Vector3(6.8, 0.3, -27.5),
      G_POS.clone(),
    ]);
    const tubeGeo = new TubeGeometry(curve, 48, 0.035, 6, false);
    this.pathMat = new MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    this.path = new Mesh(tubeGeo, this.pathMat);
    this.scene.add(this.path);

    /* milestone beads along the pathway */
    const beadGeo = new SphereGeometry(0.12, 10, 10);
    this.beadMat = new MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const beadCount = 7;
    this.beads = new InstancedMesh(beadGeo, this.beadMat, beadCount);
    this.beadPts = Array.from({ length: beadCount }, (_, i) =>
      curve.getPoint((i + 0.5) / beadCount)
    );
    this.scene.add(this.beads);
    this._track(tubeGeo, this.pathMat, beadGeo, this.beadMat, this.beads);
  }

  _buildPixelG() {
    const cells = [];
    G_GRID.forEach((row, r) =>
      [...row].forEach((ch, c) => {
        if (ch === "1") cells.push([c, r]);
      })
    );
    const gap = 0.5;
    const geo = new BoxGeometry(0.42, 0.42, 0.42); // crisp pixels, like the logo mark
    this.cubeMat = new MeshBasicMaterial({
      transparent: true,
      opacity: 0.95,
      wireframe: false,
    });
    this.pixelG = new InstancedMesh(geo, this.cubeMat, cells.length);
    const rand = mulberry(555);
    this.cubeData = cells.map(([c, r]) => ({
      target: new Vector3((c - 2) * gap, (2 - r) * gap, 0),
      scatter: new Vector3((rand() - 0.5) * 18, (rand() - 0.5) * 12, (rand() - 0.5) * 14),
      spin: rand() * Math.PI * 2,
    }));
    this.gGroup = new Group();
    this.gGroup.position.copy(G_POS);
    this.gGroup.add(this.pixelG);
    this.scene.add(this.gGroup);
    this._track(geo, this.cubeMat, this.pixelG);
  }

  /* ------------------------------------------------------------ theme */

  setTheme(isDark) {
    const t = THEMES[isDark ? "dark" : "light"];
    this.dim = t.dim;
    this.starMat.color = new Color(t.star);
    this.starMat.opacity = t.starOpacity;
    this.coreWireMat.color = new Color(t.core);
    this.coreInnerMat.color = new Color(t.coreInner);
    this.coreInnerMat.opacity = t.coreInnerOpacity;
    this.nodeMat.color = new Color(t.node);
    this.nodeMat.opacity = t.nodeOpacity;
    this.panelMat.color = new Color(t.panel);
    this.panelMat.map = isDark ? this.panelTex.dark : this.panelTex.light;
    this.panelBaseOpacity = t.panelOpacity;
    this.pathMat.color = new Color(t.path);
    this.beadMat.color = new Color(t.path);
    this.cubeMat.color = new Color(t.cube);
    /* fog fades far objects toward the page background colour */
    const bg = getComputedStyle(document.documentElement).getPropertyValue("--color-void").trim();
    if (bg) this.scene.fog.color.set(bg);
  }

  /* ------------------------------------------------------------- loop */

  start() {
    this.lastT = performance.now();
    this._fpsStart = this.lastT;
    this._raf = requestAnimationFrame(this._tick);
  }

  /** Rolling 2s FPS check — one-way pixel-ratio step-down keeps motion
   *  smooth on hardware weaker than the initial tier guessed. */
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

  _cameraAt(p, outPos, outLook) {
    let i = 0;
    while (i < CAM_KEYS.length - 2 && p > CAM_KEYS[i + 1][0]) i++;
    const [pa, posA, lookA] = CAM_KEYS[i];
    const [pb, posB, lookB] = CAM_KEYS[i + 1];
    const t = MathUtils.smoothstep(MathUtils.clamp((p - pa) / (pb - pa), 0, 1), 0, 1);
    outPos.lerpVectors(posA, posB, t);
    outLook.lerpVectors(lookA, lookB, t);
  }

  _tick(now) {
    if (this.disposed) return;
    this._raf = requestAnimationFrame(this._tick);

    const dt = Math.min((now - this.lastT) / 1000, 0.05);
    this.lastT = now;
    this.time += dt;
    this._adaptQuality(now);
    const time = this.time;

    /* master timeline — damped so fast scrolling still glides */
    const target = MathUtils.clamp(window.scrollY / this.maxScroll, 0, 1);
    this.progress = MathUtils.damp(this.progress, target, 4.2, dt);
    const p = this.progress;

    /* ------ camera ------ */
    this._cameraAt(p, this._v1, this._v2);
    /* gentle handheld sway keeps the frame alive even when idle */
    this._v1.x += Math.sin(time * 0.23) * 0.18;
    this._v1.y += Math.cos(time * 0.31) * 0.12;
    this.camera.position.copy(this._v1);
    this._look.lerp(this._v2, 1 - Math.exp(-4 * dt));
    this.camera.lookAt(this._look);

    /* ------ stars: slow drift ------ */
    this.stars.rotation.y = time * 0.008;
    this.stars.rotation.z = time * 0.004;
    this.starMat.size = 0.07 + win(p, 0.8, 1) * 0.03;

    /* ------ knowledge core ------ */
    const coreGrow = 0.55 + win(p, ...BEATS.gather) * 0.85 - win(p, 0.4, 0.58) * 0.5;
    this.core.scale.setScalar(coreGrow + Math.sin(time * 0.9) * 0.02);
    this.core.rotation.y = time * 0.12;
    this.core.rotation.x = Math.sin(time * 0.2) * 0.18;
    this.coreInner.rotation.y = -time * 0.3;
    this.coreWireMat.opacity = (0.25 + win(p, ...BEATS.gather) * 0.35) * this.dim;

    /* ------ nodes: scatter → orbit → disperse ------ */
    const gather = win(p, ...BEATS.gather) * (1 - win(p, ...BEATS.disperse));
    const d = this._dummy;
    for (let i = 0; i < this.nodeData.length; i++) {
      const n = this.nodeData[i];
      const a = n.phase + time * n.speed;
      this._v3
        .set(Math.cos(a) * n.radius, Math.sin(a * 0.9) * n.radius * 0.35 + n.incline, Math.sin(a) * n.radius)
        .add(CORE_POS);
      d.position.lerpVectors(n.scatter, this._v3, gather);
      /* ambient drift while scattered */
      d.position.y += Math.sin(time * 0.4 + n.phase) * 0.25 * (1 - gather);
      const s = 0.7 + gather * 0.6 + Math.sin(time * 1.3 + n.phase) * 0.15;
      d.scale.setScalar(s);
      d.rotation.set(0, a, 0);
      d.updateMatrix();
      this.nodes.setMatrixAt(i, d.matrix);
    }
    this.nodes.instanceMatrix.needsUpdate = true;

    /* ------ code panels: drift → orbit the core ------ */
    const orbit = win(p, ...BEATS.gather) * (1 - win(p, 0.66, 0.82));
    this.panelMat.opacity =
      this.panelBaseOpacity * (0.6 + 0.4 * orbit) * (1 - win(p, 0.86, 0.98));
    for (let i = 0; i < this.panels.length; i++) {
      const mesh = this.panels[i];
      const pd = this.panelData[i];
      const a = pd.phase + time * pd.orbitSpeed;
      this._v3
        .set(Math.cos(a) * pd.orbitR, Math.sin(a * 0.7) * 1.2, Math.sin(a) * pd.orbitR)
        .add(CORE_POS);
      mesh.position.lerpVectors(pd.drift, this._v3, orbit);
      mesh.position.y += Math.sin(time * 0.5 + pd.phase) * 0.2 * pd.bob;
      mesh.quaternion.copy(this.camera.quaternion); // billboard toward camera
      mesh.rotateZ(pd.tilt * (1 - orbit));
      const sc = 0.8 + orbit * 0.2;
      mesh.scale.setScalar(sc);
    }

    /* ------ learning pathway ------ */
    const pathIn = win(p, ...BEATS.path) * (1 - win(p, ...BEATS.pathOut));
    this.pathMat.opacity = pathIn * 0.7 * this.dim;
    this.beadMat.opacity = pathIn * this.dim;
    if (pathIn > 0.001) {
      for (let i = 0; i < this.beadPts.length; i++) {
        d.position.copy(this.beadPts[i]);
        d.scale.setScalar(0.7 + Math.sin(time * 1.6 - i * 0.9) * 0.3);
        d.rotation.set(0, 0, 0);
        d.updateMatrix();
        this.beads.setMatrixAt(i, d.matrix);
      }
      this.beads.instanceMatrix.needsUpdate = true;
      this.beads.visible = true;
      this.path.visible = true;
    } else {
      this.beads.visible = false;
      this.path.visible = false;
    }

    /* ------ pixel-G: assemble → hold → disperse ------ */
    const assemble = win(p, ...BEATS.gAssemble) * (1 - win(p, ...BEATS.disperse));
    this.gGroup.visible = assemble > 0.001 || win(p, 0.4, 0.5) > 0;
    if (this.gGroup.visible) {
      /* face the 0.72 camera keyframe so the assembled mark reads clearly */
      this.gGroup.rotation.y = -0.35 + Math.sin(time * 0.4) * 0.1;
      this.gGroup.rotation.x = Math.sin(time * 0.27) * 0.05;
      for (let i = 0; i < this.cubeData.length; i++) {
        const cd = this.cubeData[i];
        d.position.lerpVectors(cd.scatter, cd.target, assemble);
        d.rotation.set(0, cd.spin * (1 - assemble) + time * 0.1 * (1 - assemble), cd.spin * (1 - assemble));
        d.scale.setScalar(0.35 + assemble * 0.65);
        d.updateMatrix();
        this.pixelG.setMatrixAt(i, d.matrix);
      }
      this.pixelG.instanceMatrix.needsUpdate = true;
      this.cubeMat.opacity = (0.22 + assemble * 0.48) * this.dim;
    }

    this.renderer.render(this.scene, this.camera);
  }

  /* ---------------------------------------------------------- dispose */

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this._raf);
    window.removeEventListener("resize", this._onResize);
    this._ro.disconnect();
    for (const item of this._disposables) item.dispose?.();
    this.renderer.dispose();
  }
}

export default JourneyEngine;
