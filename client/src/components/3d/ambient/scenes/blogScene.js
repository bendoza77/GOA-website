import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Points,
  PointsMaterial,
} from "three";
import { mulberry } from "../ambientEngine.js";

/**
 * Blog — "field notes adrift": portrait document pages floating through the
 * frame, each with a headline and paragraph strokes, plus a fine mist of
 * "ink" particles. Scroll leafs the pages upward at different depths —
 * layered parallax — while each sheet sways as if caught in a slow draft.
 */

const PAGES = 7;

/** Simple article-page texture (headline, byline, paragraph strokes). */
function makePageTexture(isDark, seed) {
  const c = document.createElement("canvas");
  c.width = 180;
  c.height = 240;
  const g = c.getContext("2d");
  const bg = isDark ? "rgba(7, 15, 10, 0.92)" : "rgba(252, 254, 252, 0.95)";
  const frame = isDark ? "rgba(125, 255, 158, 0.45)" : "rgba(22, 163, 74, 0.45)";
  const strong = isDark ? "rgba(125, 255, 158, 0.85)" : "rgba(13, 143, 63, 0.8)";
  const faint = isDark ? "rgba(87, 224, 138, 0.35)" : "rgba(21, 128, 61, 0.3)";
  g.fillStyle = bg;
  g.fillRect(0, 0, 180, 240);
  g.strokeStyle = frame;
  g.strokeRect(1, 1, 178, 238);
  /* headline */
  g.fillStyle = strong;
  g.fillRect(16, 20, 120, 10);
  g.fillRect(16, 36, 88, 10);
  /* byline */
  g.fillStyle = faint;
  g.fillRect(16, 58, 60, 5);
  /* paragraphs */
  const rand = mulberry(seed);
  let y = 78;
  while (y < 220) {
    const w = 100 + rand() * 48;
    g.fillStyle = rand() > 0.85 ? strong : faint;
    g.fillRect(16, y, w, 5);
    y += 12 + (rand() > 0.8 ? 8 : 0); // occasional paragraph break
  }
  return new CanvasTexture(c);
}

export default {
  camera: [0, 0, 8],
  parallax: 0.5,
  dolly: -0.8,

  build(e) {
    const s = e.state;
    s.drift = new Group();

    s.pageTex = {
      dark: [makePageTexture(true, 3), makePageTexture(true, 11)],
      light: [makePageTexture(false, 3), makePageTexture(false, 11)],
    };
    const geo = new PlaneGeometry(1.05, 1.4);
    s.pageMats = [0, 1].map(
      (i) =>
        new MeshBasicMaterial({
          map: s.pageTex.dark[i],
          transparent: true,
          side: DoubleSide,
          depthWrite: false,
        })
    );

    const rand = mulberry(64);
    s.pages = [];
    s.pageData = [];
    for (let i = 0; i < PAGES; i++) {
      const mesh = new Mesh(geo, s.pageMats[i % 2]);
      s.pages.push(mesh);
      s.pageData.push({
        /* keep the corridor over the content clear: bias pages to the edges */
        home: [
          (rand() > 0.5 ? 1 : -1) * (2.4 + rand() * 1.6),
          (rand() - 0.5) * 5,
          -3 + rand() * 3.2,
        ],
        depth: 0.5 + rand() * 1.2, // parallax factor against scroll
        sway: rand() * Math.PI * 2,
        tilt: (rand() - 0.5) * 0.5,
      });
      s.drift.add(mesh);
    }

    /* ink mist */
    const count = e.coarse ? 80 : 150;
    const prand = mulberry(19);
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (prand() - 0.5) * 12;
      pos[i * 3 + 1] = (prand() - 0.5) * 8;
      pos[i * 3 + 2] = -5 + prand() * 5;
    }
    const mistGeo = new BufferGeometry();
    mistGeo.setAttribute("position", new Float32BufferAttribute(pos, 3));
    s.mistMat = new PointsMaterial({
      size: 0.035,
      sizeAttenuation: true,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    s.mist = new Points(mistGeo, s.mistMat);
    s.drift.add(s.mist);

    e.scene.add(s.drift);
    e.track(geo, mistGeo, ...s.pageMats, s.mistMat,
      ...s.pageTex.dark, ...s.pageTex.light);
  },

  theme(e) {
    const { a } = e.palette;
    const s = e.state;
    const texSet = e.isDark ? s.pageTex.dark : s.pageTex.light;
    s.pageMats.forEach((m, i) => {
      m.map = texSet[i];
      m.opacity = (e.isDark ? 0.55 : 0.45) * (e.dim === 1 ? 1 : 0.95);
      m.color = new Color("#ffffff");
    });
    s.mistMat.color = new Color(a);
    s.mistMat.opacity = 0.5 * e.dim;
  },

  update(e) {
    const { time, progress: p, state: s } = e;

    for (let i = 0; i < s.pages.length; i++) {
      const mesh = s.pages[i];
      const pd = s.pageData[i];
      mesh.position.set(
        pd.home[0] + Math.sin(time * 0.3 + pd.sway) * 0.25,
        pd.home[1] + Math.sin(time * 0.45 + pd.sway * 1.3) * 0.2 + p * pd.depth * 2.4,
        pd.home[2]
      );
      /* face the camera with a hand-placed tilt + slow page-turn sway */
      mesh.quaternion.copy(e.camera.quaternion);
      mesh.rotateY(Math.sin(time * 0.25 + pd.sway) * 0.35);
      mesh.rotateZ(pd.tilt + Math.sin(time * 0.2 + pd.sway) * 0.06);
    }

    s.mist.rotation.y = time * 0.02;
    s.mist.position.y = p * 1.4;
  },
};
