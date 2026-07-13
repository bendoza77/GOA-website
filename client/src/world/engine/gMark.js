import {
  AdditiveBlending,
  BoxGeometry,
  Color,
  DoubleSide,
  Group,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  Vector3,
} from "three";
import { mulberry, makeGlowTexture, PALETTE } from "./shared.js";
import { CHAPTERS, sstep } from "../worldTimeline.js";

/**
 * gMark — the monument. Thousands of small green cubes fly in from the
 * dark and organise themselves into the GOA pixel-G.
 *
 * Assembly is staggered per cube (each has its own arrival offset and a
 * decelerating ease with settle), so the mark builds itself gradually —
 * digital matter organising, not a switch flipping. Once complete the G
 * breathes: scale pulse, per-frame emissive shimmer, and an inner glow
 * plane behind it. In the finale the same cubes disperse upward and the
 * monument returns to dust.
 *
 * One InstancedMesh (+ one glow plane): 2 draw calls for the whole scene.
 */

/* The brand pixel-G (mirrors the SVG logo mark), subdivided into sub-cubes. */
const G_PIXELS = [
  [0, 1, 1, 1, 1, 0],
  [1, 1, 0, 0, 0, 0],
  [1, 1, 0, 1, 1, 1],
  [1, 1, 0, 0, 1, 1],
  [1, 1, 0, 0, 1, 1],
  [0, 1, 1, 1, 1, 0],
];

export const G_POS = new Vector3(0, 1.2, -96);

export function createGMark(ctx) {
  const { scene, coarse, track } = ctx;

  /* subdivision per pixel: desktop 4×4×3 deep → 23px × 48 = 1104 cubes */
  const sub = coarse ? 3 : 4;
  const depth = coarse ? 2 : 3;
  const cell = 0.62; // world size of one logo pixel
  const size = cell / sub;

  const targets = [];
  const rows = G_PIXELS.length;
  const cols = G_PIXELS[0].length;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!G_PIXELS[r][c]) continue;
      for (let sx = 0; sx < sub; sx++) {
        for (let sy = 0; sy < sub; sy++) {
          for (let sz = 0; sz < depth; sz++) {
            targets.push(
              new Vector3(
                (c - cols / 2 + 0.5) * cell + (sx - sub / 2 + 0.5) * size,
                (rows / 2 - 0.5 - r) * cell + (sy - sub / 2 + 0.5) * size,
                (sz - depth / 2 + 0.5) * size
              )
            );
          }
        }
      }
    }
  }

  const rand = mulberry(9001);
  const cubes = targets.map((target) => ({
    target,
    scatter: new Vector3(
      (rand() - 0.5) * 34,
      (rand() - 0.5) * 22,
      (rand() - 0.5) * 30
    ),
    ascend: new Vector3((rand() - 0.5) * 20, 12 + rand() * 18, (rand() - 0.5) * 16),
    order: rand(), // arrival stagger
    spin: rand() * Math.PI * 2,
  }));

  const geo = new BoxGeometry(size * 0.86, size * 0.86, size * 0.86);
  const mat = new MeshBasicMaterial({
    color: new Color(PALETTE.lime),
    transparent: true,
    opacity: 0,
  });
  const mesh = new InstancedMesh(geo, mat, cubes.length);
  mesh.frustumCulled = false; // scattered bounds churn every frame

  /* per-instance colour: green→neon gradient noise so the mark shimmers */
  const cGreen = new Color(PALETTE.green);
  const cNeon = new Color(PALETTE.neon);
  const tint = new Color();
  cubes.forEach((c, i) => {
    tint.lerpColors(cGreen, cNeon, c.order);
    mesh.setColorAt(i, tint);
  });

  const group = new Group();
  group.position.copy(G_POS);
  group.add(mesh);
  group.visible = false;
  scene.add(group);

  /* inner energy glow behind the mark */
  const glowTex = makeGlowTexture(128);
  const glowGeo = new PlaneGeometry(9, 9);
  const glowMat = new MeshBasicMaterial({
    map: glowTex,
    color: new Color(PALETTE.green),
    transparent: true,
    opacity: 0,
    blending: AdditiveBlending,
    depthWrite: false,
    side: DoubleSide,
  });
  const glow = new Mesh(glowGeo, glowMat);
  glow.position.z = -1.2;
  group.add(glow);

  track(geo, mat, mesh, glowTex, glowGeo, glowMat);

  const dummy = new Object3D();
  const [gA, gB] = CHAPTERS.gMark;
  const [fA] = CHAPTERS.finale;

  return {
    update(f) {
      const { p, time, dim } = f;
      const assemble = sstep(p, gA, gA + (gB - gA) * 0.55);
      const disperse = sstep(p, fA + 0.01, fA + 0.08);
      const gone = disperse >= 1 && p > fA + 0.1;

      if (assemble <= 0.001 || gone) {
        group.visible = false;
        return;
      }
      group.visible = true;

      /* the completed mark breathes and slowly turns toward the orbiting camera */
      const alive = assemble * (1 - disperse);
      group.rotation.y = Math.sin(time * 0.25) * 0.1;
      group.scale.setScalar(1 + Math.sin(time * 1.1) * 0.015 * alive);

      for (let i = 0; i < cubes.length; i++) {
        const c = cubes[i];
        /* staggered arrival: each cube starts once the wave reaches it */
        const local = Math.min(1, Math.max(0, assemble * 1.9 - c.order * 0.9));
        const e = 1 - Math.pow(1 - local, 4); // heavy deceleration = settle
        dummy.position.lerpVectors(c.scatter, c.target, e);
        /* finale: matter releases upward, staggered again */
        if (disperse > 0) {
          const dLocal = Math.min(1, Math.max(0, disperse * 1.7 - c.order * 0.7));
          const de = dLocal * dLocal; // accelerating release
          dummy.position.lerp(c.ascend, de);
        }
        const settle = 1 - e;
        dummy.rotation.set(
          c.spin * settle + disperse * c.spin * 2,
          c.spin * settle * 1.3 + time * 0.06 * settle,
          0
        );
        dummy.scale.setScalar(0.4 + e * 0.6 - disperse * 0.35);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;

      mat.opacity = (0.25 + assemble * 0.75) * (1 - disperse * 0.85) * dim;
      glowMat.opacity =
        assemble * (1 - disperse) * 0.34 * (0.75 + 0.25 * Math.sin(time * 1.3)) * dim;
    },
  };
}
