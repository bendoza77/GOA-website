import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Points,
  PointsMaterial,
  Mesh,
  ShaderMaterial,
  Vector3,
} from "three";
import { samplePoint, sampleTangent } from "./roadPath.js";
import { mulberry, makeGlowTexture, PALETTE } from "./shared.js";

/**
 * road — the glowing green digital road, built in real time by scroll.
 *
 * A ribbon extruded along the road curve, shaded procedurally:
 *  - `uBuild` gates the ribbon along its length — scroll extends the road,
 *    and a hot white-green construction front travels at the leading edge,
 *    so energy visibly *builds* the road rather than revealing it
 *  - glowing edges, a breathing dashed centre line and energy pulses that
 *    flow toward the horizon carry the life of the surface
 *  - a stream of particles races down the built portion of the road
 *
 * 2 draw calls (ribbon + particles). The ribbon geometry is static; all
 * motion lives in uniforms, so scroll can never stutter it.
 */

const SEGMENTS = 380;
const WIDTH = 1.55;

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uBuild;
  uniform float uOpacity;
  uniform vec3 uRoad;
  uniform vec3 uEdge;
  varying vec2 vUv;

  void main() {
    /* build gate: nothing past the front, soft ramp behind it */
    float built = 1.0 - smoothstep(uBuild - 0.012, uBuild, vUv.y);
    if (built <= 0.001) discard;

    /* hot construction front where the road is being born */
    float front = exp(-abs(vUv.y - uBuild) * 160.0);

    /* glowing edges, soft interior */
    float toEdge = min(vUv.x, 1.0 - vUv.x);          // 0 at edge, .5 centre
    float edge = 1.0 - smoothstep(0.0, 0.16, toEdge);
    float lane = smoothstep(0.5, 0.34, toEdge) * 0.22;

    /* dashed centre line, drifting forward */
    float centre = 1.0 - smoothstep(0.012, 0.03, abs(vUv.x - 0.5));
    float dash = step(0.45, fract(vUv.y * 90.0 - uTime * 0.9));
    centre *= dash * 0.8;

    /* energy pulses flowing toward the horizon */
    float flow = pow(0.5 + 0.5 * sin(vUv.y * 110.0 - uTime * 2.6), 4.0) * 0.5;
    flow += pow(0.5 + 0.5 * sin(vUv.y * 34.0 - uTime * 1.2 + 2.1), 6.0) * 0.35;

    vec3 col = uEdge * (edge * 1.15 + centre * 0.9 + front * 2.4)
             + uRoad * (lane + flow * (0.35 + toEdge));
    float alpha = built * (edge * 0.85 + lane + centre * 0.6 + flow * 0.4 + 0.05)
                + front * 1.6;

    gl_FragColor = vec4(col, alpha * uOpacity);
  }
`;

export function createRoad(ctx) {
  const { scene, coarse, track } = ctx;

  /* ---- ribbon geometry along the curve ---- */
  const verts = new Float32Array((SEGMENTS + 1) * 2 * 3);
  const uvs = new Float32Array((SEGMENTS + 1) * 2 * 2);
  const idx = [];
  const p = new Vector3();
  const t = new Vector3();
  for (let i = 0; i <= SEGMENTS; i++) {
    const s = i / SEGMENTS;
    samplePoint(s, p);
    sampleTangent(s, t);
    const px = -t.z; // ground-plane perpendicular
    const pz = t.x;
    const inv = 1 / Math.hypot(px, pz);
    const ox = px * inv * (WIDTH / 2);
    const oz = pz * inv * (WIDTH / 2);
    const v = i * 6;
    verts[v] = p.x - ox;
    verts[v + 1] = p.y;
    verts[v + 2] = p.z - oz;
    verts[v + 3] = p.x + ox;
    verts[v + 4] = p.y;
    verts[v + 5] = p.z + oz;
    const u = i * 4;
    uvs[u] = 0;
    uvs[u + 1] = s;
    uvs[u + 2] = 1;
    uvs[u + 3] = s;
    if (i < SEGMENTS) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new Float32BufferAttribute(verts, 3));
  geo.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geo.setIndex(idx);

  const mat = new ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: {
      uTime: { value: 0 },
      uBuild: { value: 0 },
      uOpacity: { value: 1 },
      uRoad: { value: new Color(PALETTE.green) },
      uEdge: { value: new Color(PALETTE.neon) },
    },
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    side: DoubleSide,
  });
  const ribbon = new Mesh(geo, mat);
  ribbon.frustumCulled = false; // spans the whole world; always partly visible
  scene.add(ribbon);
  track(geo, mat);

  /* ---- energy particles racing down the built road ---- */
  const count = coarse ? 160 : 380;
  const rand = mulberry(2024);
  const pos = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 3); // t0, speed, lateral
  for (let i = 0; i < count; i++) {
    seeds[i * 3] = rand();
    seeds[i * 3 + 1] = 0.02 + rand() * 0.045;
    seeds[i * 3 + 2] = (rand() - 0.5) * 1.15;
  }
  const pGeo = new BufferGeometry();
  pGeo.setAttribute("position", new Float32BufferAttribute(pos, 3));
  const glowTex = makeGlowTexture(64);
  const pMat = new PointsMaterial({
    map: glowTex,
    color: new Color(PALETTE.lime),
    size: 0.16,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const particles = new Points(pGeo, pMat);
  particles.frustumCulled = false;
  scene.add(particles);
  track(pGeo, pMat, glowTex);

  const sp = new Vector3();
  const st = new Vector3();

  return {
    /** f = { time, dt, dim, build (0..1 along curve), fade } */
    update(f) {
      const { time, build, dim, fade } = f;
      mat.uniforms.uTime.value = time;
      mat.uniforms.uBuild.value = build;
      mat.uniforms.uOpacity.value = dim * fade;

      const arr = pGeo.attributes.position.array;
      if (build > 0.01 && fade > 0.01) {
        particles.visible = true;
        for (let i = 0; i < count; i++) {
          // each particle loops over the *built* stretch of road
          const tt = (seeds[i * 3] + time * seeds[i * 3 + 1]) % 1 * build;
          samplePoint(tt, sp);
          sampleTangent(tt, st);
          const px = -st.z;
          const pz = st.x;
          const inv = 1 / Math.hypot(px, pz);
          const lat = seeds[i * 3 + 2];
          arr[i * 3] = sp.x + px * inv * lat * (WIDTH / 2);
          arr[i * 3 + 1] = sp.y + 0.06 + Math.sin(time * 2 + i) * 0.04;
          arr[i * 3 + 2] = sp.z + pz * inv * lat * (WIDTH / 2);
        }
        pGeo.attributes.position.needsUpdate = true;
        pMat.opacity = 0.65 * dim * fade;
      } else {
        particles.visible = false;
      }
      ribbon.visible = build > 0.001 && fade > 0.01;
    },
  };
}
