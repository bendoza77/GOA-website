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
 * Community — "the swarm": a wide halo of particles orbiting as one ring —
 * thousands of members moving together — with a few brighter members
 * (octahedra) riding the current and a hairline guide ring. Centred and far
 * back so it reads as atmosphere behind the content, never over it.
 * Scroll tilts the halo from face-on toward edge-on.
 */

const HALO_POS = [0, -0.2, -5];

export default {
  camera: [0, 0, 8],
  parallax: 0.4,
  dolly: -0.8,

  build(e) {
    const s = e.state;
    s.halo = new Group();
    s.halo.position.set(...HALO_POS);

    /* the swarm — particles scattered around a torus ring */
    const count = e.coarse ? 320 : 620;
    const rand = mulberry(404);
    const pos = new Float32Array(count * 3);
    const R = 3.6;
    for (let i = 0; i < count; i++) {
      const a = rand() * Math.PI * 2;
      const tube = Math.pow(rand(), 0.6) * 0.9; // denser near the ring core
      const b = rand() * Math.PI * 2;
      pos[i * 3] = Math.cos(a) * (R + Math.cos(b) * tube);
      pos[i * 3 + 1] = Math.sin(b) * tube * 0.7;
      pos[i * 3 + 2] = Math.sin(a) * (R + Math.cos(b) * tube);
    }
    const swarmGeo = new BufferGeometry();
    swarmGeo.setAttribute("position", new Float32BufferAttribute(pos, 3));
    s.swarmMat = new PointsMaterial({
      size: 0.05,
      sizeAttenuation: true,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    s.swarm = new Points(swarmGeo, s.swarmMat);
    s.halo.add(s.swarm);

    /* hairline guide ring */
    const ringGeo = new TorusGeometry(R, 0.012, 6, 96);
    s.ringMat = new MeshBasicMaterial({ transparent: true, depthWrite: false });
    const ring = new Mesh(ringGeo, s.ringMat);
    ring.rotation.x = Math.PI / 2; // lie flat in the halo plane
    s.halo.add(ring);

    /* brighter members riding the current */
    const riderCount = 8;
    const riderGeo = new OctahedronGeometry(0.09, 0);
    s.riderMat = new MeshBasicMaterial({ transparent: true, blending: AdditiveBlending, depthWrite: false });
    s.riders = new InstancedMesh(riderGeo, s.riderMat, riderCount);
    s.riderData = Array.from({ length: riderCount }, (_, i) => ({
      phase: (i / riderCount) * Math.PI * 2,
      speed: 0.12 + rand() * 0.1,
      bob: rand() * Math.PI * 2,
      radius: R + (rand() - 0.5) * 0.5,
    }));
    s.halo.add(s.riders);

    e.scene.add(s.halo);
    e.track(swarmGeo, ringGeo, riderGeo, s.swarmMat, s.ringMat, s.riderMat, s.riders);
  },

  theme(e) {
    const { a, b } = e.palette;
    const s = e.state;
    s.swarmMat.color = new Color(a);
    s.swarmMat.opacity = 0.55 * e.dim;
    s.ringMat.color = new Color(b);
    s.ringMat.opacity = 0.18 * e.dim;
    s.riderMat.color = new Color(a);
    s.riderMat.opacity = 0.85 * e.dim;
  },

  update(e) {
    const { time, progress: p, state: s, dummy: d } = e;

    /* halo: constant slow orbit; scroll tilts it from face-on to edge-on */
    s.halo.rotation.x = 1.15 - win(p, 0, 1) * 0.75;
    s.halo.rotation.z = time * 0.03 + p * 0.6;
    const breathe = 1 + Math.sin(time * 0.4) * 0.02 + win(p, 0.6, 1) * 0.12;
    s.halo.scale.setScalar(breathe);
    s.halo.position.y = HALO_POS[1] + Math.sin(time * 0.3) * 0.1 - p * 0.5;

    s.swarm.rotation.z = time * 0.05; // swarm drifts against the halo spin

    for (let i = 0; i < s.riderData.length; i++) {
      const rd = s.riderData[i];
      const a = rd.phase + time * rd.speed;
      d.position.set(
        Math.cos(a) * rd.radius,
        Math.sin(time * 0.9 + rd.bob) * 0.25,
        Math.sin(a) * rd.radius
      );
      d.rotation.set(time * 0.5 + rd.bob, a, 0);
      d.scale.setScalar(0.8 + Math.sin(time * 1.1 + rd.bob) * 0.2);
      d.updateMatrix();
      s.riders.setMatrixAt(i, d.matrix);
    }
    s.riders.instanceMatrix.needsUpdate = true;
  },
};
