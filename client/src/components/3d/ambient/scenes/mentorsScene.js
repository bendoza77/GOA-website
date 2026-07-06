import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  MeshBasicMaterial,
  SphereGeometry,
  Vector3,
} from "three";
import { mulberry, win } from "../ambientEngine.js";

/**
 * Mentors — "the constellation": people-nodes scattered on a loose sphere,
 * wired together by hairline edges, with bright pulses travelling along the
 * connections — knowledge moving through the network. Scroll rotates and
 * gently expands the constellation.
 */

const NEST_POS = [2.7, 0.3, -2];
const NODES = 26;
const LINK_DIST = 1.9;
const PULSES = 6;

export default {
  camera: [0, 0, 8],
  parallax: 0.6,
  dolly: -1.0,

  build(e) {
    const s = e.state;
    s.nest = new Group();
    s.nest.position.set(...NEST_POS);

    /* nodes on a fuzzy sphere */
    const rand = mulberry(202);
    s.nodePos = Array.from({ length: NODES }, () => {
      const r = 1.7 + rand() * 0.9;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      return new Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    });
    const nodeGeo = new IcosahedronGeometry(0.075, 0);
    s.nodeMat = new MeshBasicMaterial({ transparent: true, depthWrite: false });
    s.nodes = new InstancedMesh(nodeGeo, s.nodeMat, NODES);
    s.nodePhase = Array.from({ length: NODES }, () => rand() * Math.PI * 2);
    s.nest.add(s.nodes);

    /* hairline edges between close neighbours */
    s.edges = [];
    const linePts = [];
    for (let i = 0; i < NODES; i++) {
      for (let j = i + 1; j < NODES; j++) {
        if (s.nodePos[i].distanceTo(s.nodePos[j]) < LINK_DIST) {
          s.edges.push([i, j]);
          linePts.push(...s.nodePos[i].toArray(), ...s.nodePos[j].toArray());
        }
      }
    }
    const lineGeo = new BufferGeometry();
    lineGeo.setAttribute("position", new Float32BufferAttribute(linePts, 3));
    s.lineMat = new LineBasicMaterial({ transparent: true, depthWrite: false });
    s.nest.add(new LineSegments(lineGeo, s.lineMat));

    /* pulses that travel the edges */
    const pulseGeo = new SphereGeometry(0.05, 8, 8);
    s.pulseMat = new MeshBasicMaterial({ transparent: true, blending: AdditiveBlending, depthWrite: false });
    s.pulses = new InstancedMesh(pulseGeo, s.pulseMat, PULSES);
    s.pulseData = Array.from({ length: PULSES }, () => ({
      edge: Math.floor(rand() * s.edges.length),
      speed: 0.25 + rand() * 0.3,
      phase: rand(),
    }));
    s.nest.add(s.pulses);

    e.scene.add(s.nest);
    e.track(nodeGeo, lineGeo, pulseGeo, s.nodeMat, s.lineMat, s.pulseMat, s.nodes, s.pulses);
  },

  theme(e) {
    const { a, b } = e.palette;
    const s = e.state;
    s.nodeMat.color = new Color(a);
    s.nodeMat.opacity = 0.75 * e.dim;
    s.lineMat.color = new Color(b);
    s.lineMat.opacity = 0.16 * e.dim;
    s.pulseMat.color = new Color(a);
    s.pulseMat.opacity = 0.9 * e.dim;
  },

  update(e) {
    const { time, progress: p, state: s, dummy: d } = e;

    /* constellation slowly turns; scroll adds rotation + gentle expansion */
    s.nest.rotation.y = time * 0.06 + p * 1.6;
    s.nest.rotation.x = Math.sin(time * 0.15) * 0.1 + p * 0.25;
    s.nest.scale.setScalar(1 + win(p, 0, 0.6) * 0.18 - win(p, 0.75, 1) * 0.12);
    s.nest.position.y = NEST_POS[1] - p * 0.8;

    for (let i = 0; i < NODES; i++) {
      d.position.copy(s.nodePos[i]);
      d.scale.setScalar(0.85 + Math.sin(time * 1.2 + s.nodePhase[i]) * 0.25);
      d.rotation.set(0, time * 0.3 + s.nodePhase[i], 0);
      d.updateMatrix();
      s.nodes.setMatrixAt(i, d.matrix);
    }
    s.nodes.instanceMatrix.needsUpdate = true;

    /* pulses run their edge, hop to the next when the loop wraps */
    for (let i = 0; i < s.pulseData.length; i++) {
      const pd = s.pulseData[i];
      const t = (time * pd.speed + pd.phase) % 1;
      const [ia, ib] = s.edges[pd.edge % s.edges.length];
      d.position.lerpVectors(s.nodePos[ia], s.nodePos[ib], t);
      d.scale.setScalar(0.7 + Math.sin(t * Math.PI) * 0.8); // bright mid-flight
      d.rotation.set(0, 0, 0);
      d.updateMatrix();
      s.pulses.setMatrixAt(i, d.matrix);
    }
    s.pulses.instanceMatrix.needsUpdate = true;
  },
};
