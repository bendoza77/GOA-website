import {
  AdditiveBlending,
  BoxGeometry,
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  Points,
  PointsMaterial,
} from "three";
import { mulberry, makeGlowTexture, makeRayTexture, PALETTE } from "./shared.js";

/**
 * atmosphere — the living fabric of the digital universe.
 *
 * Two star layers (deep parallax), rising energy wisps, drifting wireframe
 * geometry and slow volumetric-looking light rays. Everything breathes on
 * its own clock and dims/brightens with the master `dim` drive so the story
 * moment can hush the whole world.
 *
 * Draw calls: 2 (stars) + 1 (wisps) + 2 (instanced geometry) + 1 (rays).
 */
export function createAtmosphere(ctx) {
  const { scene, coarse, track } = ctx;
  const group = new Group();
  scene.add(group);

  /* ---- deep + near star fields ---- */
  const starLayers = [];
  [
    { count: coarse ? 800 : 1600, spread: [90, 44, 130], size: 0.07, opacity: 0.5, seed: 42 },
    { count: coarse ? 300 : 650, spread: [50, 26, 120], size: 0.11, opacity: 0.32, seed: 77 },
  ].forEach((cfg) => {
    const rand = mulberry(cfg.seed);
    const pos = new Float32Array(cfg.count * 3);
    for (let i = 0; i < cfg.count; i++) {
      pos[i * 3] = (rand() - 0.5) * cfg.spread[0];
      pos[i * 3 + 1] = (rand() - 0.5) * cfg.spread[1];
      pos[i * 3 + 2] = 14 - rand() * cfg.spread[2];
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(pos, 3));
    const mat = new PointsMaterial({
      color: new Color(PALETTE.neon),
      size: cfg.size,
      sizeAttenuation: true,
      transparent: true,
      opacity: cfg.opacity,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const points = new Points(geo, mat);
    group.add(points);
    starLayers.push({ points, mat, baseOpacity: cfg.opacity });
    track(geo, mat);
  });

  /* ---- rising energy wisps — slow green embers drifting upward ---- */
  const wispCount = coarse ? 120 : 260;
  const wispRand = mulberry(555);
  const wispPos = new Float32Array(wispCount * 3);
  const wispSeed = new Float32Array(wispCount * 2); // phase, speed
  for (let i = 0; i < wispCount; i++) {
    wispPos[i * 3] = (wispRand() - 0.5) * 44;
    wispPos[i * 3 + 1] = -6 + wispRand() * 18;
    wispPos[i * 3 + 2] = 10 - wispRand() * 110;
    wispSeed[i * 2] = wispRand() * Math.PI * 2;
    wispSeed[i * 2 + 1] = 0.16 + wispRand() * 0.35;
  }
  const wispGeo = new BufferGeometry();
  wispGeo.setAttribute("position", new Float32BufferAttribute(wispPos, 3));
  const glowTex = makeGlowTexture(64);
  const wispMat = new PointsMaterial({
    map: glowTex,
    color: new Color(PALETTE.lime),
    size: 0.34,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.35,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const wisps = new Points(wispGeo, wispMat);
  wisps.frustumCulled = false; // positions churn every frame
  group.add(wisps);
  track(wispGeo, wispMat, glowTex);

  /* ---- floating wireframe geometry — icosahedra + cubes, breathing ---- */
  const shardDefs = [
    { geo: new IcosahedronGeometry(0.62, 0), count: coarse ? 10 : 18, seed: 91 },
    { geo: new BoxGeometry(0.5, 0.5, 0.5), count: coarse ? 8 : 14, seed: 17 },
  ];
  const dummy = new Object3D();
  const shards = shardDefs.map(({ geo, count, seed }) => {
    const mat = new MeshBasicMaterial({
      color: new Color(PALETTE.green),
      wireframe: true,
      transparent: true,
      opacity: 0.34,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const mesh = new InstancedMesh(geo, mat, count);
    const rand = mulberry(seed);
    const data = Array.from({ length: count }, () => ({
      base: [
        (rand() - 0.5) * 40,
        -2 + rand() * 12,
        8 - rand() * 100,
      ],
      spin: rand() * Math.PI * 2,
      speed: 0.05 + rand() * 0.16,
      bob: 0.4 + rand() * 1.2,
      scale: 0.6 + rand() * 1.7,
    }));
    group.add(mesh);
    track(geo, mat, mesh);
    return { mesh, mat, data };
  });

  /* ---- deep nebula — a vast, soft green glow far down the world's axis.
     It gives the arrival void a horizon and every chapter a sense of
     depth; it breathes slowly and dies with the finale warp. ---- */
  const nebulaTex = makeGlowTexture(128);
  const nebulaGeo = new PlaneGeometry(70, 42);
  const nebulaMat = new MeshBasicMaterial({
    map: nebulaTex,
    color: new Color(PALETTE.deep),
    transparent: true,
    opacity: 0,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const nebula = new Mesh(nebulaGeo, nebulaMat);
  nebula.position.set(0, 4, -105);
  group.add(nebula);
  track(nebulaTex, nebulaGeo, nebulaMat);

  /* ---- light rays — tall additive shafts leaning through the fog ---- */
  const rayTex = makeRayTexture();
  const rayGeo = new PlaneGeometry(2.6, 26);
  const rayMat = new MeshBasicMaterial({
    map: rayTex,
    color: new Color(PALETTE.deep),
    transparent: true,
    opacity: 0.16,
    blending: AdditiveBlending,
    depthWrite: false,
    side: DoubleSide,
  });
  const rayCount = coarse ? 3 : 5;
  const rayRand = mulberry(31);
  for (let i = 0; i < rayCount; i++) {
    const ray = new Mesh(rayGeo, rayMat);
    ray.position.set((rayRand() - 0.5) * 36, 5, -8 - rayRand() * 80);
    ray.rotation.z = (rayRand() - 0.5) * 0.5;
    group.add(ray);
  }
  track(rayGeo, rayMat, rayTex);

  return {
    /** f = { time, dim, reveal, warp } */
    update(f) {
      const { time, dim, reveal, warp } = f;

      starLayers.forEach((l, li) => {
        l.points.rotation.y = time * (li === 0 ? 0.006 : -0.004);
        l.mat.opacity = l.baseOpacity * dim * reveal;
        // finale star-warp: stars swell as the universe compresses
        l.mat.size = (li === 0 ? 0.07 : 0.11) * (1 + warp * 1.6);
      });

      /* wisps rise for ever, wrapping vertically */
      const wp = wispGeo.attributes.position.array;
      for (let i = 0; i < wispCount; i++) {
        const speed = wispSeed[i * 2 + 1];
        let y = wp[i * 3 + 1] + speed * f.dt * (1 + warp * 6);
        if (y > 14) y = -7;
        wp[i * 3 + 1] = y;
        wp[i * 3] += Math.sin(time * 0.4 + wispSeed[i * 2]) * 0.0035;
      }
      wispGeo.attributes.position.needsUpdate = true;
      wispMat.opacity = (0.24 + 0.1 * Math.sin(time * 0.7)) * dim * reveal;

      /* shards breathe: slow tumble, gentle bob, pulse of scale */
      shards.forEach(({ mesh, mat, data }) => {
        for (let i = 0; i < data.length; i++) {
          const s = data[i];
          dummy.position.set(
            s.base[0],
            s.base[1] + Math.sin(time * 0.3 + s.spin) * s.bob,
            s.base[2]
          );
          dummy.rotation.set(time * s.speed, s.spin + time * s.speed * 0.7, 0);
          dummy.scale.setScalar(s.scale * (1 + Math.sin(time * 0.8 + s.spin) * 0.06));
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
        mat.opacity = 0.3 * dim * reveal * (1 - warp);
      });

      /* rays shimmer only — static transforms; opacity carries the life */
      rayMat.opacity = (0.1 + 0.06 * Math.sin(time * 0.5)) * dim * reveal * (1 - warp);

      nebulaMat.opacity =
        (0.16 + 0.05 * Math.sin(time * 0.33)) * dim * reveal * (1 - warp * 0.8);
    },
  };
}
