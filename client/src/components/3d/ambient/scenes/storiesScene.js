import {
  AdditiveBlending,
  BoxGeometry,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  Float32BufferAttribute,
  Group,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  Points,
  PointsMaterial,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from "three";
import { mulberry, win } from "../ambientEngine.js";

/**
 * SuccessStories — "the trajectory": a glowing career arc climbing up and to
 * the right, milestone beads riding it, and outcome bars that grow from the
 * baseline as you scroll — the numbers going up, literally. Rising spark
 * particles keep the air alive.
 */

const CHART_POS = [2.8, -0.4, -1.5];
const BARS = 6;

export default {
  camera: [0, 0, 8],
  parallax: 0.5,
  dolly: -1.0,

  build(e) {
    const s = e.state;
    s.chart = new Group();
    s.chart.position.set(...CHART_POS);

    /* the career arc */
    s.curve = new CatmullRomCurve3([
      new Vector3(-3.0, -1.3, -0.6),
      new Vector3(-1.6, -0.8, 0.2),
      new Vector3(-0.2, -0.4, -0.4),
      new Vector3(1.0, 0.6, 0.3),
      new Vector3(2.2, 2.0, -0.2),
    ]);
    const tubeGeo = new TubeGeometry(s.curve, 40, 0.028, 6, false);
    s.pathMat = new MeshBasicMaterial({ transparent: true, blending: AdditiveBlending, depthWrite: false });
    s.chart.add(new Mesh(tubeGeo, s.pathMat));

    /* milestone beads along the arc */
    const beadGeo = new SphereGeometry(0.09, 10, 10);
    s.beadMat = new MeshBasicMaterial({ transparent: true, blending: AdditiveBlending, depthWrite: false });
    const beadCount = 6;
    s.beads = new InstancedMesh(beadGeo, s.beadMat, beadCount);
    s.beadPts = Array.from({ length: beadCount }, (_, i) =>
      s.curve.getPoint((i + 0.5) / beadCount)
    );
    s.chart.add(s.beads);

    /* outcome bars growing from the baseline */
    const barGeo = new BoxGeometry(0.34, 1, 0.34);
    barGeo.translate(0, 0.5, 0); // pivot at the base so scale.y grows upward
    s.barMat = new MeshBasicMaterial({ transparent: true, depthWrite: false });
    s.bars = new InstancedMesh(barGeo, s.barMat, BARS);
    const rand = mulberry(88);
    s.barData = Array.from({ length: BARS }, (_, i) => ({
      x: -2.6 + i * 0.95,
      height: 0.7 + (i / (BARS - 1)) * 1.9 + rand() * 0.3,
      delay: i * 0.07,
      sway: rand() * Math.PI * 2,
    }));
    s.chart.add(s.bars);

    /* rising sparks */
    const count = e.coarse ? 90 : 170;
    const prand = mulberry(23);
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (prand() - 0.5) * 8;
      pos[i * 3 + 1] = (prand() - 0.5) * 7;
      pos[i * 3 + 2] = -1.5 + prand() * 2;
    }
    const sparkGeo = new BufferGeometry();
    sparkGeo.setAttribute("position", new Float32BufferAttribute(pos, 3));
    s.sparkMat = new PointsMaterial({
      size: 0.04,
      sizeAttenuation: true,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    s.sparks = new Points(sparkGeo, s.sparkMat);
    s.chart.add(s.sparks);

    e.scene.add(s.chart);
    e.track(tubeGeo, beadGeo, barGeo, sparkGeo,
      s.pathMat, s.beadMat, s.barMat, s.sparkMat, s.beads, s.bars);
  },

  theme(e) {
    const { a, b, c } = e.palette;
    const s = e.state;
    s.pathMat.color = new Color(a);
    s.pathMat.opacity = 0.55 * e.dim;
    s.beadMat.color = new Color(a);
    s.beadMat.opacity = 0.85 * e.dim;
    s.barMat.color = new Color(e.isDark ? c : b);
    s.barMat.opacity = 0.4 * e.dim;
    s.sparkMat.color = new Color(a);
    s.sparkMat.opacity = 0.6 * e.dim;
  },

  update(e) {
    const { time, progress: p, state: s, dummy: d } = e;

    s.chart.rotation.y = Math.sin(time * 0.1) * 0.1 - 0.15 + p * 0.35;
    s.chart.position.y = CHART_POS[1] - p * 0.9 + Math.sin(time * 0.4) * 0.06;

    /* beads pulse in sequence along the arc */
    for (let i = 0; i < s.beadPts.length; i++) {
      d.position.copy(s.beadPts[i]);
      d.scale.setScalar(0.7 + Math.sin(time * 1.7 - i * 0.9) * 0.3);
      d.rotation.set(0, 0, 0);
      d.updateMatrix();
      s.beads.setMatrixAt(i, d.matrix);
    }
    s.beads.instanceMatrix.needsUpdate = true;

    /* bars grow with scroll, staggered left to right, then breathe */
    for (let i = 0; i < s.barData.length; i++) {
      const bd = s.barData[i];
      const grow = win(p, 0.02 + bd.delay, 0.4 + bd.delay);
      d.position.set(bd.x, -1.6, -0.9);
      d.scale.set(1, Math.max(bd.height * grow + Math.sin(time * 0.9 + bd.sway) * 0.04, 0.02), 1);
      d.rotation.set(0, 0, 0);
      d.updateMatrix();
      s.bars.setMatrixAt(i, d.matrix);
    }
    s.bars.instanceMatrix.needsUpdate = true;

    /* sparks drift upward on a bounded, seamless bob */
    s.sparks.rotation.y = time * 0.03;
    s.sparks.position.y = Math.sin(time * 0.2) * 0.6 + p * 0.8; // rise as you scroll
  },
};
