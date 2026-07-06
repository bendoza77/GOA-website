import {
  AdditiveBlending,
  BoxGeometry,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Points,
  PointsMaterial,
  TorusGeometry,
} from "three";
import { mulberry } from "../ambientEngine.js";

/**
 * Contact — "the signal": a wireframe communication core broadcasting
 * expanding signal rings, with a small satellite (body + solar wings)
 * sweeping an inclined orbit and a field of receiver points listening in.
 * Scroll tips the orbit plane and tightens the broadcast.
 */

const CORE_POS = [3.0, 0.3, -1];
const RINGS = 3;

export default {
  camera: [0, 0, 8],
  parallax: 0.6,
  dolly: -1.2,

  build(e) {
    const s = e.state;
    s.station = new Group();
    s.station.position.set(...CORE_POS);

    /* communication core: wireframe shell + glow heart */
    const shellGeo = new IcosahedronGeometry(0.75, 1);
    s.shellMat = new MeshBasicMaterial({ wireframe: true, transparent: true, depthWrite: false });
    s.shell = new Mesh(shellGeo, s.shellMat);
    const heartGeo = new IcosahedronGeometry(0.4, 0);
    s.heartMat = new MeshBasicMaterial({ transparent: true, blending: AdditiveBlending, depthWrite: false });
    s.heart = new Mesh(heartGeo, s.heartMat);
    s.station.add(s.shell, s.heart);

    /* expanding signal rings (one material each — independent fade) */
    const ringGeo = new TorusGeometry(1, 0.014, 6, 64);
    s.ringMats = [];
    s.rings = [];
    for (let i = 0; i < RINGS; i++) {
      const mat = new MeshBasicMaterial({ transparent: true, blending: AdditiveBlending, depthWrite: false });
      const ring = new Mesh(ringGeo, mat);
      ring.rotation.x = Math.PI / 2.6;
      s.ringMats.push(mat);
      s.rings.push(ring);
      s.station.add(ring);
    }

    /* orbit guide + satellite */
    const orbitGeo = new TorusGeometry(2.3, 0.008, 6, 96);
    s.orbitMat = new MeshBasicMaterial({ transparent: true, depthWrite: false });
    s.orbitRing = new Mesh(orbitGeo, s.orbitMat);
    s.station.add(s.orbitRing);

    s.sat = new Group();
    const bodyGeo = new BoxGeometry(0.16, 0.16, 0.28);
    s.satMat = new MeshBasicMaterial({ transparent: true, depthWrite: false });
    const wingGeo = new PlaneGeometry(0.5, 0.16);
    s.wingMat = new MeshBasicMaterial({ transparent: true, depthWrite: false, side: 2 });
    const body = new Mesh(bodyGeo, s.satMat);
    const wingL = new Mesh(wingGeo, s.wingMat);
    const wingR = new Mesh(wingGeo, s.wingMat);
    wingL.position.x = -0.4;
    wingR.position.x = 0.4;
    s.sat.add(body, wingL, wingR);
    s.station.add(s.sat);

    /* receiver points listening in the distance */
    const count = e.coarse ? 90 : 160;
    const rand = mulberry(55);
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rand() - 0.5) * 14 - 2;
      pos[i * 3 + 1] = (rand() - 0.5) * 8;
      pos[i * 3 + 2] = -6 + rand() * 4;
    }
    const fieldGeo = new BufferGeometry();
    fieldGeo.setAttribute("position", new Float32BufferAttribute(pos, 3));
    s.fieldMat = new PointsMaterial({
      size: 0.04,
      sizeAttenuation: true,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    s.field = new Points(fieldGeo, s.fieldMat);

    e.scene.add(s.station, s.field);
    e.track(shellGeo, heartGeo, ringGeo, orbitGeo, bodyGeo, wingGeo, fieldGeo,
      s.shellMat, s.heartMat, ...s.ringMats, s.orbitMat, s.satMat, s.wingMat, s.fieldMat);
  },

  theme(e) {
    const { a, b, c } = e.palette;
    const s = e.state;
    s.shellMat.color = new Color(b);
    s.shellMat.opacity = 0.35 * e.dim;
    s.heartMat.color = new Color(c);
    s.heartMat.opacity = 0.45 * e.dim;
    s.ringBase = 0.5 * e.dim;
    for (const m of s.ringMats) m.color = new Color(a);
    s.orbitMat.color = new Color(b);
    s.orbitMat.opacity = 0.14 * e.dim;
    s.satMat.color = new Color(a);
    s.satMat.opacity = 0.8 * e.dim;
    s.wingMat.color = new Color(b);
    s.wingMat.opacity = 0.5 * e.dim;
    s.fieldMat.color = new Color(a);
    s.fieldMat.opacity = 0.5 * e.dim;
  },

  update(e) {
    const { time, progress: p, state: s } = e;

    s.station.position.y = CORE_POS[1] - p * 1.0 + Math.sin(time * 0.5) * 0.07;
    s.station.rotation.y = Math.sin(time * 0.1) * 0.15 + p * 0.5;

    s.shell.rotation.y = time * 0.2;
    s.shell.rotation.x = Math.sin(time * 0.3) * 0.15;
    s.heart.rotation.y = -time * 0.5;
    s.heart.scale.setScalar(1 + Math.sin(time * 2.2) * 0.1);

    /* signal rings: staggered broadcast loop — grow and fade */
    for (let i = 0; i < s.rings.length; i++) {
      const t = (time * 0.35 + i / RINGS) % 1;
      s.rings[i].scale.setScalar(0.5 + t * 2.6);
      s.ringMats[i].opacity = (1 - t) * (s.ringBase ?? 0.5);
    }

    /* orbit plane tips over as you scroll */
    const incline = 1.15 - p * 0.7;
    s.orbitRing.rotation.x = incline;
    const a = time * 0.45;
    s.sat.position.set(
      Math.cos(a) * 2.3,
      Math.sin(a) * 2.3 * Math.cos(incline),
      Math.sin(a) * 2.3 * Math.sin(incline)
    );
    s.sat.rotation.set(0, a, Math.sin(time * 0.8) * 0.15);

    s.field.rotation.y = time * 0.015;
  },
};
