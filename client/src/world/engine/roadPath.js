import { CatmullRomCurve3, Vector3 } from "three";

/**
 * roadPath — the spine of the digital world.
 *
 * One serpentine curve runs from the arrival point deep into the universe.
 * The road ribbon is extruded along it, the camera travels above it, the
 * course artifacts hang beside its bends and the energy particles flow down
 * it — everything in chapters 1–4 is positioned relative to this curve.
 *
 * The curve is sampled once into flat typed arrays so per-frame consumers
 * (camera, particles) never allocate or call getPoint().
 */

const ROAD_POINTS = [
  new Vector3(0, -1.1, 6),
  new Vector3(0, -1.15, -4),
  new Vector3(3.6, -0.9, -14),
  new Vector3(-3.2, -1.2, -25),
  new Vector3(3.4, -0.8, -36),
  new Vector3(-3.6, -1.1, -47),
  new Vector3(3.0, -0.85, -58),
  new Vector3(-2.6, -1.05, -68),
  new Vector3(0, -0.9, -78),
];

export const roadCurve = new CatmullRomCurve3(ROAD_POINTS, false, "catmullrom", 0.6);

/** Curve parameters where the six course artifacts sit. Each is ~0.05 of
 *  curve (≈4.5 world units) AHEAD of where the camera rides during that
 *  course's scroll window, so the artifact assembles in frame and the
 *  camera reaches it just as its chapter ends. */
export const DOC_T = [0.25, 0.383, 0.516, 0.649, 0.782, 0.915];

const SAMPLES = 512;
const pos = new Float32Array((SAMPLES + 1) * 3);
const tan = new Float32Array((SAMPLES + 1) * 3);
{
  const p = new Vector3();
  const t = new Vector3();
  for (let i = 0; i <= SAMPLES; i++) {
    roadCurve.getPointAt(i / SAMPLES, p);
    roadCurve.getTangentAt(i / SAMPLES, t);
    pos.set([p.x, p.y, p.z], i * 3);
    tan.set([t.x, t.y, t.z], i * 3);
  }
}

/** Write the curve point at param t (0..1) into `out` (lerped sample). */
export const samplePoint = (t, out) => {
  const f = Math.min(Math.max(t, 0), 1) * SAMPLES;
  const i = Math.min(Math.floor(f), SAMPLES - 1);
  const k = f - i;
  const a = i * 3;
  const b = a + 3;
  out.set(
    pos[a] + (pos[b] - pos[a]) * k,
    pos[a + 1] + (pos[b + 1] - pos[a + 1]) * k,
    pos[a + 2] + (pos[b + 2] - pos[a + 2]) * k
  );
  return out;
};

/** Write the curve tangent at param t (0..1) into `out` (lerped sample). */
export const sampleTangent = (t, out) => {
  const f = Math.min(Math.max(t, 0), 1) * SAMPLES;
  const i = Math.min(Math.floor(f), SAMPLES - 1);
  const k = f - i;
  const a = i * 3;
  const b = a + 3;
  out.set(
    tan[a] + (tan[b] - tan[a]) * k,
    tan[a + 1] + (tan[b + 1] - tan[a + 1]) * k,
    tan[a + 2] + (tan[b + 2] - tan[a + 2]) * k
  );
  return out.normalize();
};

/** Course artifact anchors — beside the road, floating above it, on the
 *  outside of each bend, alternating left/right so the journey sways. */
export const docAnchor = (i) => {
  const p = new Vector3();
  const t = new Vector3();
  samplePoint(DOC_T[i], p);
  sampleTangent(DOC_T[i], t);
  // perpendicular in the ground plane
  const side = i % 2 === 0 ? 1 : -1;
  const perp = new Vector3(-t.z, 0, t.x).normalize().multiplyScalar(2.3 * side);
  return p.clone().add(perp).add(new Vector3(0, 2.05, 0));
};
