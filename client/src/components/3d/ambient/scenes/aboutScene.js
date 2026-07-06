import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  Points,
  PointsMaterial,
  SphereGeometry,
  TetrahedronGeometry,
  TorusGeometry,
} from "three";
import { mulberry, win } from "../ambientEngine.js";

/**
 * About — "holographic globe": a wireframe world with precessing orbit
 * rings, a glowing core, a particle atmosphere and a handful of orbiting
 * shards. Sits right of the copy; a faint icosahedron anchors bottom-left.
 * Scroll spins the globe through a slow half-revolution and settles it
 * deeper into the frame.
 */

const GLOBE_POS = [3.1, 0.4, -1];

export default {
  camera: [0, 0, 8],
  parallax: 0.55,
  dolly: -1.4,

  build(e) {
    const s = e.state;
    s.globe = new Group();
    s.globe.position.set(...GLOBE_POS);

    /* wireframe world + inner glow core */
    const sphereGeo = new SphereGeometry(1.9, 20, 14);
    s.wireMat = new MeshBasicMaterial({ wireframe: true, transparent: true, depthWrite: false });
    s.globe.add(new Mesh(sphereGeo, s.wireMat));

    const coreGeo = new IcosahedronGeometry(0.85, 1);
    s.coreMat = new MeshBasicMaterial({ transparent: true, blending: AdditiveBlending, depthWrite: false });
    s.core = new Mesh(coreGeo, s.coreMat);
    s.globe.add(s.core);

    /* two precessing orbit rings */
    const ringGeo = new TorusGeometry(2.5, 0.015, 6, 72);
    s.ringMat = new MeshBasicMaterial({ transparent: true, depthWrite: false });
    s.ringA = new Mesh(ringGeo, s.ringMat);
    s.ringB = new Mesh(ringGeo, s.ringMat);
    s.ringB.scale.setScalar(1.18);
    s.globe.add(s.ringA, s.ringB);

    /* particle atmosphere — a fuzzy shell around the globe */
    const count = e.coarse ? 90 : 170;
    const rand = mulberry(31);
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2.1 + rand() * 1.5;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const dustGeo = new BufferGeometry();
    dustGeo.setAttribute("position", new Float32BufferAttribute(pos, 3));
    s.dustMat = new PointsMaterial({
      size: 0.045,
      sizeAttenuation: true,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    s.dust = new Points(dustGeo, s.dustMat);
    s.globe.add(s.dust);

    /* orbiting geometric shards */
    const shardCount = 10;
    const shardGeo = new TetrahedronGeometry(0.11, 0);
    s.shardMat = new MeshBasicMaterial({ transparent: true, depthWrite: false });
    s.shards = new InstancedMesh(shardGeo, s.shardMat, shardCount);
    const srand = mulberry(77);
    s.shardData = Array.from({ length: shardCount }, () => ({
      radius: 2.4 + srand() * 1.1,
      speed: 0.15 + srand() * 0.3,
      phase: srand() * Math.PI * 2,
      incline: (srand() - 0.5) * 1.4,
      spin: srand() * Math.PI * 2,
    }));
    s.globe.add(s.shards);

    /* faint counterweight bottom-left */
    const anchorGeo = new IcosahedronGeometry(1.05, 0);
    s.anchorMat = new MeshBasicMaterial({ wireframe: true, transparent: true, depthWrite: false });
    s.anchor = new Mesh(anchorGeo, s.anchorMat);
    s.anchor.position.set(-3.6, -2.4, -3);
    e.scene.add(s.globe, s.anchor);

    e.track(sphereGeo, coreGeo, ringGeo, dustGeo, shardGeo, anchorGeo,
      s.wireMat, s.coreMat, s.ringMat, s.dustMat, s.shardMat, s.anchorMat, s.shards);
  },

  theme(e) {
    const { a, b, c } = e.palette;
    const s = e.state;
    s.wireMat.color = new Color(b);
    s.wireMat.opacity = 0.16 * e.dim;
    s.coreMat.color = new Color(c);
    s.coreMat.opacity = 0.3 * e.dim;
    s.ringMat.color = new Color(a);
    s.ringMat.opacity = 0.3 * e.dim;
    s.dustMat.color = new Color(a);
    s.dustMat.opacity = 0.65 * e.dim;
    s.shardMat.color = new Color(a);
    s.shardMat.opacity = 0.55 * e.dim;
    s.anchorMat.color = new Color(b);
    s.anchorMat.opacity = 0.1 * e.dim;
  },

  update(e) {
    const { time, progress: p, state: s, dummy: d } = e;

    /* globe: idle spin + a scroll-driven half revolution, settling deeper */
    s.globe.rotation.y = time * 0.1 + p * Math.PI;
    s.globe.rotation.x = Math.sin(time * 0.18) * 0.08;
    s.globe.position.y = GLOBE_POS[1] - p * 1.1 + Math.sin(time * 0.5) * 0.08;
    s.globe.scale.setScalar(1 - win(p, 0.5, 1) * 0.18);

    s.core.rotation.y = -time * 0.35;
    s.core.scale.setScalar(1 + Math.sin(time * 1.1) * 0.06);

    /* rings precess on independent axes */
    s.ringA.rotation.set(Math.PI / 2.4 + Math.sin(time * 0.22) * 0.25, time * 0.16, 0);
    s.ringB.rotation.set(Math.PI / 1.7, -time * 0.11, Math.sin(time * 0.19) * 0.3);

    s.dust.rotation.y = time * 0.04;

    for (let i = 0; i < s.shardData.length; i++) {
      const sd = s.shardData[i];
      const a = sd.phase + time * sd.speed;
      d.position.set(
        Math.cos(a) * sd.radius,
        Math.sin(a * 0.8) * sd.radius * 0.3 + sd.incline,
        Math.sin(a) * sd.radius
      );
      d.rotation.set(sd.spin + time * 0.4, a, 0);
      d.scale.setScalar(0.8 + Math.sin(time * 1.4 + sd.phase) * 0.2);
      d.updateMatrix();
      s.shards.setMatrixAt(i, d.matrix);
    }
    s.shards.instanceMatrix.needsUpdate = true;

    s.anchor.rotation.y = time * 0.07;
    s.anchor.rotation.z = time * 0.05;
    s.anchor.position.y = -2.4 + p * 1.6; // slow counter-parallax against scroll
  },
};
