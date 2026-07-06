import {
  AdditiveBlending,
  BoxGeometry,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  InstancedMesh,
  MeshBasicMaterial,
  OctahedronGeometry,
  Mesh,
  Points,
  PointsMaterial,
} from "three";
import { mulberry, win } from "../ambientEngine.js";

/**
 * Courses — "the curriculum helix": a spiral column of floating books that
 * twists and fans open as you scroll (the syllabus unrolling), wrapped in a
 * slow updraft of knowledge particles. A faint octahedron balances the
 * lower-left.
 */

const HELIX_POS = [3.0, 0, -1.2];
const BOOKS = 11;

export default {
  camera: [0, 0, 8],
  parallax: 0.5,
  dolly: -1.2,

  build(e) {
    const s = e.state;
    s.helix = new Group();
    s.helix.position.set(...HELIX_POS);

    /* books — flat slabs with a thin glowing "spine" edge */
    const bookGeo = new BoxGeometry(1.25, 0.09, 0.9);
    s.bookMat = new MeshBasicMaterial({ transparent: true, depthWrite: false });
    s.books = new InstancedMesh(bookGeo, s.bookMat, BOOKS);
    const spineGeo = new BoxGeometry(1.29, 0.03, 0.94);
    s.spineMat = new MeshBasicMaterial({ transparent: true, blending: AdditiveBlending, depthWrite: false });
    s.spines = new InstancedMesh(spineGeo, s.spineMat, BOOKS);
    const rand = mulberry(12);
    s.bookData = Array.from({ length: BOOKS }, (_, i) => ({
      t: i / (BOOKS - 1), // 0..1 along the column
      wobble: rand() * Math.PI * 2,
      radius: 1.15 + rand() * 0.35,
    }));
    s.helix.add(s.books, s.spines);

    /* knowledge particles — updraft column around the helix */
    const count = e.coarse ? 110 : 220;
    const prand = mulberry(48);
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = prand() * Math.PI * 2;
      const r = 1.6 + prand() * 2.4;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = (prand() - 0.5) * 8;
      pos[i * 3 + 2] = Math.sin(a) * r;
    }
    const dustGeo = new BufferGeometry();
    dustGeo.setAttribute("position", new Float32BufferAttribute(pos, 3));
    s.dustMat = new PointsMaterial({
      size: 0.04,
      sizeAttenuation: true,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    s.dust = new Points(dustGeo, s.dustMat);
    s.helix.add(s.dust);

    /* counterweight lower-left */
    const gemGeo = new OctahedronGeometry(0.9, 0);
    s.gemMat = new MeshBasicMaterial({ wireframe: true, transparent: true, depthWrite: false });
    s.gem = new Mesh(gemGeo, s.gemMat);
    s.gem.position.set(-3.5, -2.2, -2.6);

    e.scene.add(s.helix, s.gem);
    e.track(bookGeo, spineGeo, dustGeo, gemGeo,
      s.bookMat, s.spineMat, s.dustMat, s.gemMat, s.books, s.spines);
  },

  theme(e) {
    const { a, b } = e.palette;
    const s = e.state;
    s.bookMat.color = new Color(e.isDark ? "#101c14" : "#ffffff");
    s.bookMat.opacity = (e.isDark ? 0.85 : 0.9) * e.dim;
    s.spineMat.color = new Color(a);
    s.spineMat.opacity = 0.4 * e.dim;
    s.dustMat.color = new Color(a);
    s.dustMat.opacity = 0.6 * e.dim;
    s.gemMat.color = new Color(b);
    s.gemMat.opacity = 0.12 * e.dim;
  },

  update(e) {
    const { time, progress: p, state: s, dummy: d } = e;

    /* scroll twists the helix and fans the books apart */
    const twist = p * 2.4;
    const spread = 1 + win(p, 0, 0.7) * 0.55;
    for (let i = 0; i < s.bookData.length; i++) {
      const bd = s.bookData[i];
      const angle = bd.t * Math.PI * 2.2 + twist + time * 0.08;
      const y = (bd.t - 0.5) * 4.4 * spread + Math.sin(time * 0.7 + bd.wobble) * 0.12;
      d.position.set(Math.cos(angle) * bd.radius, y, Math.sin(angle) * bd.radius);
      d.rotation.set(
        Math.sin(time * 0.4 + bd.wobble) * 0.12,
        -angle + Math.PI / 2,
        0.12 + Math.sin(time * 0.5 + bd.wobble) * 0.08
      );
      d.updateMatrix();
      s.books.setMatrixAt(i, d.matrix);
      s.spines.setMatrixAt(i, d.matrix);
    }
    s.books.instanceMatrix.needsUpdate = true;
    s.spines.instanceMatrix.needsUpdate = true;

    s.helix.rotation.y = Math.sin(time * 0.1) * 0.1;
    s.helix.position.y = HELIX_POS[1] - p * 0.9;

    /* updraft: slow rise with a seamless loop via rotation + bounded bob */
    s.dust.rotation.y = time * 0.05;
    s.dust.position.y = Math.sin(time * 0.16) * 0.8;

    s.gem.rotation.x = time * 0.09;
    s.gem.rotation.y = time * 0.12;
    s.gem.position.y = -2.2 + p * 1.4;
  },
};
