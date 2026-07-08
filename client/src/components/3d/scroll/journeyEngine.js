import {
  AdditiveBlending,
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  CircleGeometry,
  Color,
  DoubleSide,
  EdgesGeometry,
  Float32BufferAttribute,
  Fog,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
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
  TorusGeometry,
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
 *   0. a holographic laptop floats ahead of the camera, screen glowing;
 *      scrolling spins it, folds it shut and collapses it into a portal ring
 *   1. the camera flies through the portal as it bursts into particles,
 *      drifting on through the "code universe" of stars, binary glyph
 *      streams and floating code panels
 *   2. scattered knowledge nodes gather into orbit around a wireframe core —
 *      an AI mind — with neural link lines pulsing between node and core,
 *      fed by an energy trail flowing back from the portal
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
  laptopOut: [0.09, 0.17], // laptop folds + collapses into the portal
  portalIn: [0.06, 0.16], // portal ring grows out of the collapsing laptop
  portalBurst: [0.2, 0.33], // ...and shatters outward as the camera passes
  trail: [0.15, 0.27], // energy trail: portal → core
  trailOut: [0.36, 0.46],
  gather: [0.1, 0.32], // nodes+panels: scatter → orbit the core
  path: [0.3, 0.44], // learning pathway fades in
  pathOut: [0.68, 0.84], // ...and back out
  gAssemble: [0.48, 0.7], // pixel-G assembles
  disperse: [0.78, 0.96], // nodes+G scatter for the finale
};

/* Camera keyframes: [progress, position, lookAt]. Interpolated with
   smoothstep between neighbours, then damped — cinematic by construction. */
const CAM_KEYS = [
  [0.0, new Vector3(0, 0.3, 6.4), new Vector3(0.3, 0.45, -4)],
  [0.18, new Vector3(2.3, 0.7, 0.5), new Vector3(0, 0, -14)],
  [0.36, new Vector3(-2.6, 1.1, -7.5), new Vector3(0.5, 0, -15)],
  [0.54, new Vector3(-0.8, 0.5, -16.5), new Vector3(6, -0.6, -28)],
  [0.72, new Vector3(4.2, 0.3, -23.5), new Vector3(6, -0.5, -31)],
  [0.88, new Vector3(2.0, 2.4, -18), new Vector3(1, 0, -34)],
  [1.0, new Vector3(0, 3.4, -12), new Vector3(0, 0.5, -40)],
];

const CORE_POS = new Vector3(0, 0, -14);
/* Laptop + portal share an anchor placed ON the camera path between the
   0.18 and 0.36 keyframes, so the camera genuinely flies through the ring
   (~p 0.26) right as it bursts into particles. */
const LAPTOP_POS = new Vector3(0.3, 0.55, -3.2);
const PORTAL_POS = new Vector3(0.3, 0.7, -3.0);
/* off to the right of the camera's finale framing so the assembling mark
   never sits directly behind section copy */
const G_POS = new Vector3(7.8, -0.5, -31.5);

/* The GOA pixel mark, as a cube grid (1 = cube). */
const G_GRID = ["11111", "10000", "10011", "10001", "11111"];

/* Opacities are tuned for copy legibility: the scene plays behind text on
   every Home section, so the brightest elements (stars, code panels, nodes)
   stay below the threshold where they compete with body text. */
const THEMES = {
  dark: {
    star: "#7dff9e",
    core: "#57e08a",
    coreInner: "#2fbf5f",
    node: "#7dff9e",
    panel: "#ffffff",
    path: "#7dff9e",
    cube: "#57e08a",
    starOpacity: 0.55,
    panelOpacity: 0.35,
    nodeOpacity: 0.7,
    coreInnerOpacity: 0.28,
    laptop: "#7dff9e",
    portal: "#7dff9e",
    glyph: "#57e08a",
    link: "#7dff9e",
    glyphOpacity: 0.42,
    linkOpacity: 0.3,
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
    starOpacity: 0.3,
    panelOpacity: 0.2,
    nodeOpacity: 0.3,
    coreInnerOpacity: 0.1,
    laptop: "#0d8f3f",
    portal: "#0d8f3f",
    glyph: "#16a34a",
    link: "#0d8f3f",
    glyphOpacity: 0.2,
    linkOpacity: 0.16,
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

/** Single character drawn white on transparent — Points sprite for the
 *  binary streams. Tinted by the material, so one texture serves both themes. */
function makeGlyphTexture(ch) {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const g = c.getContext("2d");
  g.font = "700 44px 'JetBrains Mono', 'Fira Code', monospace";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillStyle = "#ffffff";
  g.fillText(ch, 32, 34);
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
    this._buildGlyphStreams();
    this._buildLaptop();
    this._buildPortal();
    this._buildCore();
    this._buildNodes();
    this._buildLinks();
    this._buildTrail();
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

  /** Binary streams — "0" and "1" glyph sprites drifting in depth around the
   *  whole camera path. Two counter-rotating clouds, two draw calls. */
  _buildGlyphStreams() {
    const per = this.coarse ? 70 : 140;
    this.glyphs = [];
    this.glyphMats = [];
    ["0", "1"].forEach((ch, gi) => {
      const rand = mulberry(300 + gi * 77);
      const pos = new Float32Array(per * 3);
      for (let i = 0; i < per; i++) {
        pos[i * 3] = (rand() - 0.5) * 56;
        pos[i * 3 + 1] = (rand() - 0.5) * 26;
        pos[i * 3 + 2] = -42 + rand() * 46;
      }
      const geo = new BufferGeometry();
      geo.setAttribute("position", new Float32BufferAttribute(pos, 3));
      const tex = makeGlyphTexture(ch);
      const mat = new PointsMaterial({
        map: tex,
        size: 0.34,
        sizeAttenuation: true,
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
        opacity: 0,
      });
      const points = new Points(geo, mat);
      this.scene.add(points);
      this.glyphs.push(points);
      this.glyphMats.push(mat);
      this._track(geo, mat, tex);
    });
  }

  /** Holographic laptop — the hero's focal object. Edge-line hologram with a
   *  glowing code screen; scrolling folds and collapses it into the portal. */
  _buildLaptop() {
    this.laptop = new Group();
    this.laptop.position.copy(LAPTOP_POS);

    this.lapEdgeMat = new LineBasicMaterial({
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    this.lapFillMat = new MeshBasicMaterial({
      transparent: true,
      opacity: 0.07,
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide,
    });
    this.lapGlowMat = new MeshBasicMaterial({
      transparent: true,
      opacity: 0.12,
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide,
    });

    /* base slab */
    const baseGeo = new BoxGeometry(2.3, 0.1, 1.5);
    const baseEdgeGeo = new EdgesGeometry(baseGeo);
    const base = new Mesh(baseGeo, this.lapFillMat);
    const baseEdges = new LineSegments(baseEdgeGeo, this.lapEdgeMat);
    /* keyboard glow on the deck */
    const kbGeo = new PlaneGeometry(2.0, 1.2);
    const kb = new Mesh(kbGeo, this.lapGlowMat);
    kb.rotation.x = -Math.PI / 2;
    kb.position.y = 0.06;

    /* lid — hinged at the back edge so it can fold shut on scroll */
    this.lid = new Group();
    this.lid.position.z = -0.72;
    const lidGeo = new BoxGeometry(2.3, 1.5, 0.06);
    const lidEdgeGeo = new EdgesGeometry(lidGeo);
    const lidFill = new Mesh(lidGeo, this.lapFillMat);
    const lidEdges = new LineSegments(lidEdgeGeo, this.lapEdgeMat);
    lidFill.position.y = 0.75;
    lidEdges.position.y = 0.75;
    /* code screen — reuses the shared code-editor texture (set in setTheme) */
    this.lapScreenMat = new MeshBasicMaterial({
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
    });
    const screenGeo = new PlaneGeometry(2.06, 1.28);
    const screen = new Mesh(screenGeo, this.lapScreenMat);
    screen.position.set(0, 0.75, 0.05);
    /* soft halo behind the lid */
    const haloGeo = new PlaneGeometry(2.9, 2.0);
    const halo = new Mesh(haloGeo, this.lapGlowMat);
    halo.position.set(0, 0.78, -0.06);
    this.lid.add(lidFill, lidEdges, screen, halo);

    /* holographic motes orbiting above the deck */
    const moteCount = this.coarse ? 36 : 64;
    const rand = mulberry(808);
    const motePos = new Float32Array(moteCount * 3);
    for (let i = 0; i < moteCount; i++) {
      const a = rand() * Math.PI * 2;
      const r = 0.7 + rand() * 1.3;
      motePos[i * 3] = Math.cos(a) * r;
      motePos[i * 3 + 1] = 0.2 + rand() * 1.5;
      motePos[i * 3 + 2] = Math.sin(a) * r * 0.7;
    }
    const moteGeo = new BufferGeometry();
    moteGeo.setAttribute("position", new Float32BufferAttribute(motePos, 3));
    this.moteMat = new PointsMaterial({
      size: 0.045,
      sizeAttenuation: true,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    this.motes = new Points(moteGeo, this.moteMat);

    this.laptop.add(base, baseEdges, kb, this.lid, this.motes);
    this.scene.add(this.laptop);
    this._track(
      baseGeo, baseEdgeGeo, kbGeo, lidGeo, lidEdgeGeo, screenGeo, haloGeo,
      moteGeo, this.lapEdgeMat, this.lapFillMat, this.lapGlowMat,
      this.lapScreenMat, this.moteMat
    );
  }

  /** Portal — twin glowing rings + a faint event-horizon disc + a swirl of
   *  particles. Grows out of the collapsing laptop, then bursts outward as
   *  the camera flies through it. */
  _buildPortal() {
    this.portal = new Group();
    this.portal.position.copy(PORTAL_POS);
    this.portal.visible = false;

    this.portalRingMat = new MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide,
    });
    const ringGeo = new TorusGeometry(1.45, 0.05, 8, 60);
    this.portalRing = new Mesh(ringGeo, this.portalRingMat);
    const ring2Geo = new TorusGeometry(1.12, 0.02, 6, 48);
    this.portalRing2 = new Mesh(ring2Geo, this.portalRingMat);

    this.portalDiscMat = new MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide,
    });
    const discGeo = new CircleGeometry(1.4, 40);
    const disc = new Mesh(discGeo, this.portalDiscMat);

    const swirlCount = this.coarse ? 50 : 90;
    const rand = mulberry(909);
    const swirlPos = new Float32Array(swirlCount * 3);
    for (let i = 0; i < swirlCount; i++) {
      const a = rand() * Math.PI * 2;
      const r = 1.05 + rand() * 0.6;
      swirlPos[i * 3] = Math.cos(a) * r;
      swirlPos[i * 3 + 1] = Math.sin(a) * r;
      swirlPos[i * 3 + 2] = (rand() - 0.5) * 0.3;
    }
    const swirlGeo = new BufferGeometry();
    swirlGeo.setAttribute("position", new Float32BufferAttribute(swirlPos, 3));
    this.swirlMat = new PointsMaterial({
      size: 0.05,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    this.swirl = new Points(swirlGeo, this.swirlMat);

    this.portal.add(this.portalRing, this.portalRing2, disc, this.swirl);
    this.scene.add(this.portal);
    this._track(
      ringGeo, ring2Geo, discGeo, swirlGeo,
      this.portalRingMat, this.portalDiscMat, this.swirlMat
    );
  }

  /** Neural links — line segments pulsing between the AI core and its
   *  orbiting nodes while they're gathered. Endpoints rewritten per frame. */
  _buildLinks() {
    this.linkCount = this.coarse ? 12 : 20;
    this._linkPos = new Float32Array(this.linkCount * 2 * 3);
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(this._linkPos, 3));
    this.linkMat = new LineBasicMaterial({
      transparent: true,
      opacity: 0,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    this.links = new LineSegments(geo, this.linkMat);
    this.links.visible = false;
    this.links.frustumCulled = false; // bounds change every frame
    this.scene.add(this.links);
    /* jittered attachment points on the core so lines don't converge on one
       mathematical point */
    const rand = mulberry(606);
    this.linkAnchors = Array.from({ length: this.linkCount }, () =>
      new Vector3(
        (rand() - 0.5) * 1.6,
        (rand() - 0.5) * 1.6,
        (rand() - 0.5) * 1.6
      ).add(CORE_POS)
    );
    this._track(geo, this.linkMat);
  }

  /** Energy trail — a thin stream of light flowing from the burst portal to
   *  the AI core, stitching chapter one to chapter two. */
  _buildTrail() {
    const curve = new CatmullRomCurve3([
      PORTAL_POS.clone(),
      new Vector3(1.7, 0.3, -6.8),
      new Vector3(-1.0, 0.7, -10.6),
      CORE_POS.clone(),
    ]);
    const geo = new TubeGeometry(curve, 40, 0.028, 6, false);
    this.trailMat = new MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    this.trail = new Mesh(geo, this.trailMat);
    this.trail.visible = false;
    this.scene.add(this.trail);
    this._track(geo, this.trailMat);
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
    /* chapter-zero cast */
    const laptop = new Color(t.laptop);
    this.lapEdgeMat.color = laptop;
    this.lapFillMat.color = laptop;
    this.lapGlowMat.color = laptop;
    this.moteMat.color = laptop;
    this.lapScreenMat.color = new Color(t.panel);
    this.lapScreenMat.map = isDark ? this.panelTex.dark : this.panelTex.light;
    const portal = new Color(t.portal);
    this.portalRingMat.color = portal;
    this.portalDiscMat.color = portal;
    this.swirlMat.color = portal;
    this.trailMat.color = portal;
    this.linkMat.color = new Color(t.link);
    this.linkBaseOpacity = t.linkOpacity;
    const glyph = new Color(t.glyph);
    for (const mat of this.glyphMats) mat.color = glyph;
    this.glyphBaseOpacity = t.glyphOpacity;
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

    /* ------ binary streams: counter-drifting glyph clouds ------ */
    this.glyphs[0].rotation.y = time * 0.012;
    this.glyphs[1].rotation.y = -time * 0.009;
    const glyphGlow =
      this.glyphBaseOpacity * this.dim * (0.8 + 0.2 * Math.sin(time * 0.6));
    this.glyphMats[0].opacity = glyphGlow;
    this.glyphMats[1].opacity = glyphGlow * 0.85;

    /* ------ hero laptop: float → spin → fold → collapse into portal ------ */
    const lapOut = win(p, ...BEATS.laptopOut);
    if (lapOut < 0.999) {
      this.laptop.visible = true;
      const lo = (1 - lapOut) * this.dim;
      this.laptop.position.y = LAPTOP_POS.y + Math.sin(time * 0.7) * 0.09;
      this.laptop.rotation.y =
        -0.35 + Math.sin(time * 0.4) * 0.07 + win(p, 0.02, 0.17) * 2.8;
      this.laptop.rotation.z = Math.sin(time * 0.32) * 0.03 + lapOut * 0.35;
      this.laptop.scale.setScalar(1 - lapOut * 0.94);
      /* lid: open + tilted back at rest, folds shut as it transforms */
      this.lid.rotation.x = -0.32 + win(p, 0.05, 0.15) * 1.55;
      this.motes.rotation.y = time * 0.4;
      this.lapEdgeMat.opacity = 0.8 * lo;
      this.lapFillMat.opacity = 0.07 * lo;
      this.lapGlowMat.opacity = 0.12 * lo * (0.85 + 0.15 * Math.sin(time * 1.7));
      this.lapScreenMat.opacity = 0.75 * lo;
      this.moteMat.opacity = 0.8 * lo;
    } else this.laptop.visible = false;

    /* ------ portal: grows from the laptop → bursts as the camera passes ------ */
    const pin = win(p, ...BEATS.portalIn);
    const burst = win(p, ...BEATS.portalBurst);
    const solid = 1 - burst; // ring/disc dissolve as the swirl takes over
    const pfade = 1 - win(p, 0.3, 0.4);
    if (pin > 0.002 && pfade > 0.002) {
      this.portal.visible = true;
      this.portal.scale.setScalar(0.15 + pin * 0.85 + burst * 2.2);
      this.portalRing.rotation.z = time * 0.3;
      this.portalRing2.rotation.z = -time * 0.45;
      this.swirl.rotation.z = -time * 0.55;
      this.portalRingMat.opacity = pin * solid * pfade * 0.9 * this.dim;
      this.portalDiscMat.opacity =
        pin * solid * solid * pfade * 0.14 * this.dim;
      this.swirlMat.opacity = pin * pfade * 0.75 * this.dim;
      this.swirlMat.size = 0.05 + burst * 0.07; // shards spread as it shatters
    } else this.portal.visible = false;

    /* ------ energy trail: burst portal → AI core ------ */
    const trailIn = win(p, ...BEATS.trail) * (1 - win(p, ...BEATS.trailOut));
    if (trailIn > 0.002) {
      this.trail.visible = true;
      this.trailMat.opacity =
        trailIn * 0.5 * this.dim * (0.8 + 0.2 * Math.sin(time * 3.1));
    } else this.trail.visible = false;

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
      /* first N nodes feed the neural-link line endpoints */
      if (i < this.linkCount) {
        const j = i * 6;
        const anchor = this.linkAnchors[i];
        this._linkPos[j] = anchor.x;
        this._linkPos[j + 1] = anchor.y;
        this._linkPos[j + 2] = anchor.z;
        this._linkPos[j + 3] = d.position.x;
        this._linkPos[j + 4] = d.position.y;
        this._linkPos[j + 5] = d.position.z;
      }
      const s = 0.7 + gather * 0.6 + Math.sin(time * 1.3 + n.phase) * 0.15;
      d.scale.setScalar(s);
      d.rotation.set(0, a, 0);
      d.updateMatrix();
      this.nodes.setMatrixAt(i, d.matrix);
    }
    this.nodes.instanceMatrix.needsUpdate = true;

    /* ------ neural links: pulse between core and gathered nodes ------ */
    if (gather > 0.02) {
      this.links.visible = true;
      this.links.geometry.attributes.position.needsUpdate = true;
      this.linkMat.opacity =
        gather *
        this.linkBaseOpacity *
        this.dim *
        (0.75 + 0.25 * Math.sin(time * 2.4));
    } else this.links.visible = false;

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
