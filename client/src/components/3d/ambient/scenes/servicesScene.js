import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  OctahedronGeometry,
  Points,
  PointsMaterial,
  TorusGeometry,
} from "three";
import { mulberry, win } from "../ambientEngine.js";

/**
 * Services — "the service constellation": a slow-turning orbital ring of
 * glowing octahedron nodes (one per service) circling a faceted wireframe hub,
 * inside a soft starfield. Scrolling tilts the whole system and pulls the
 * camera through it (dolly), so the constellation opens up as the page unrolls
 * — the ambient 3D companion to the on-page service grid + process corridor.
 */

const NODES = 7;
const RING_R = 3.2;
const RIG_POS = [2.4, 0.2, -1.5];

export default {
  camera: [0, 0, 8.5],
  parallax: 0.55,
  dolly: -1.7,
  fog: [7, 22],

  build(e) {
    const s = e.state;
    s.rig = new Group();
    s.rig.position.set(...RIG_POS);

    /* central hub — a faceted wireframe crystal */
    const hubGeo = new OctahedronGeometry(1.15, 1);
    s.hubMat = new MeshBasicMaterial({ wireframe: true, transparent: true, depthWrite: false });
    s.hub = new Mesh(hubGeo, s.hubMat);
    s.rig.add(s.hub);

    /* orbit guide — a thin ring the nodes ride around */
    const ringGeo = new TorusGeometry(RING_R, 0.012, 6, 120);
    s.ringMat = new MeshBasicMaterial({ transparent: true, blending: AdditiveBlending, depthWrite: false });
    s.ring = new Mesh(ringGeo, s.ringMat);
    s.ring.rotation.x = Math.PI / 2;
    s.rig.add(s.ring);

    /* service nodes — solid octahedra + an additive halo shell each */
    const nodeGeo = new OctahedronGeometry(0.34, 0);
    s.nodeMat = new MeshBasicMaterial({ transparent: true, depthWrite: false });
    s.nodes = new InstancedMesh(nodeGeo, s.nodeMat, NODES);
    const haloGeo = new OctahedronGeometry(0.6, 0);
    s.haloMat = new MeshBasicMaterial({ transparent: true, blending: AdditiveBlending, depthWrite: false });
    s.halos = new InstancedMesh(haloGeo, s.haloMat, NODES);
    const rand = mulberry(23);
    s.nodeData = Array.from({ length: NODES }, (_, i) => ({
      base: (i / NODES) * Math.PI * 2,
      wobble: rand() * Math.PI * 2,
      tilt: (rand() - 0.5) * 0.6,
    }));
    s.rig.add(s.nodes, s.halos);

    /* starfield — a slow shell of dust behind it all */
    const count = e.coarse ? 130 : 260;
    const prand = mulberry(71);
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = prand() * Math.PI * 2;
      const b = Math.acos(prand() * 2 - 1);
      const r = 5 + prand() * 5;
      pos[i * 3] = Math.sin(b) * Math.cos(a) * r;
      pos[i * 3 + 1] = Math.cos(b) * r * 0.7;
      pos[i * 3 + 2] = Math.sin(b) * Math.sin(a) * r;
    }
    const starGeo = new BufferGeometry();
    starGeo.setAttribute("position", new Float32BufferAttribute(pos, 3));
    s.starMat = new PointsMaterial({
      size: 0.04,
      sizeAttenuation: true,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    s.stars = new Points(starGeo, s.starMat);

    e.scene.add(s.rig, s.stars);
    e.track(hubGeo, ringGeo, nodeGeo, haloGeo, starGeo,
      s.hubMat, s.ringMat, s.nodeMat, s.haloMat, s.starMat, s.nodes, s.halos);
  },

  theme(e) {
    const { a, b, c } = e.palette;
    const s = e.state;
    s.hubMat.color = new Color(b);
    s.hubMat.opacity = 0.28 * e.dim;
    s.ringMat.color = new Color(a);
    s.ringMat.opacity = 0.5 * e.dim;
    s.nodeMat.color = new Color(a);
    s.nodeMat.opacity = 0.9 * e.dim;
    s.haloMat.color = new Color(c);
    s.haloMat.opacity = 0.18 * e.dim;
    s.starMat.color = new Color(a);
    s.starMat.opacity = 0.55 * e.dim;
  },

  update(e) {
    const { time, progress: p, state: s, dummy: d } = e;

    /* scroll opens the ring out and spins it up */
    const spin = time * 0.16 + p * 1.3;
    const radius = RING_R * (0.86 + win(p, 0, 0.8) * 0.2);
    for (let i = 0; i < s.nodeData.length; i++) {
      const nd = s.nodeData[i];
      const angle = nd.base + spin;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(time * 0.8 + nd.wobble) * 0.22 + nd.tilt;
      const pulse = 0.85 + Math.sin(time * 1.4 + nd.wobble) * 0.15;
      d.position.set(x, y, z);
      d.rotation.set(time * 0.5 + nd.wobble, angle, 0);

      d.scale.setScalar(pulse);
      d.updateMatrix();
      s.nodes.setMatrixAt(i, d.matrix);

      d.scale.setScalar(pulse * (1 + Math.sin(time * 1.1 + nd.wobble) * 0.12));
      d.updateMatrix();
      s.halos.setMatrixAt(i, d.matrix);
    }
    s.nodes.instanceMatrix.needsUpdate = true;
    s.halos.instanceMatrix.needsUpdate = true;

    /* whole rig tilts as you scroll; hub counter-rotates inside */
    s.rig.rotation.y = Math.sin(time * 0.1) * 0.15 + p * 0.5;
    s.rig.rotation.x = -0.15 + win(p, 0, 1) * 0.5;
    s.ring.rotation.z = time * 0.08;
    s.hub.rotation.x = time * 0.12;
    s.hub.rotation.y = -time * 0.16;
    s.hub.scale.setScalar(1 + Math.sin(time * 0.9) * 0.04);

    s.stars.rotation.y = time * 0.02;
  },
};
