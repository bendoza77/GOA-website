import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Points,
  PointsMaterial,
} from "three";
import { docAnchor, DOC_T, samplePoint, sampleTangent } from "./roadPath.js";
import { mulberry, makeGlowTexture, PALETTE } from "./shared.js";
import { COURSE_COUNT, courseWindow, sstep, bell } from "../worldTimeline.js";

/**
 * documents — the six course artifacts along the road.
 *
 * No cards, no grid: each course is a floating holographic document that
 * assembles out of a particle swarm as the road reaches it, unfolds with a
 * physical overshoot, glows while the camera regards it, then drifts aside
 * dimmed — an artifact you passed on the journey. The real course title and
 * copy live in the DOM overlay (crisp, localised); the 3D document is the
 * abstract body they belong to.
 *
 * Draw calls: 4 per document (face, edges, halo, swarm) — 24 total, all
 * tiny geometry, and every hidden document is skipped by visibility.
 */

const DOC_W = 1.5;
const DOC_H = 1.95;

/** Abstract "document" texture — header dots, an icon block, text bars.
 *  Deliberately wordless (copy is DOM), so one texture serves any locale. */
function makeDocTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 332;
  const g = c.getContext("2d");
  g.fillStyle = "rgba(6, 16, 10, 0.88)";
  g.beginPath();
  g.roundRect(2, 2, 252, 328, 14);
  g.fill();
  g.strokeStyle = "rgba(125, 255, 158, 0.55)";
  g.lineWidth = 2;
  g.stroke();
  /* header dots */
  for (let i = 0; i < 3; i++) {
    g.fillStyle = "rgba(125, 255, 158, 0.6)";
    g.beginPath();
    g.arc(22 + i * 16, 22, 4, 0, Math.PI * 2);
    g.fill();
  }
  /* icon block */
  g.strokeStyle = "rgba(125, 255, 158, 0.8)";
  g.strokeRect(20, 44, 44, 44);
  g.fillStyle = "rgba(87, 224, 138, 0.35)";
  g.fillRect(28, 52, 28, 28);
  /* title bars */
  g.fillStyle = "rgba(238, 244, 239, 0.85)";
  g.fillRect(20, 108, 170, 12);
  g.fillStyle = "rgba(238, 244, 239, 0.4)";
  g.fillRect(20, 128, 120, 8);
  /* body lines */
  const rand = mulberry(12);
  let y = 158;
  while (y < 296) {
    const w = 90 + rand() * 130;
    g.fillStyle = rand() > 0.75 ? "rgba(125,255,158,0.55)" : "rgba(185,198,189,0.28)";
    g.fillRect(20, y, w, 6);
    y += 18;
  }
  /* footer chip row */
  g.strokeStyle = "rgba(125, 255, 158, 0.5)";
  for (let i = 0; i < 3; i++) {
    g.beginPath();
    g.roundRect(20 + i * 62, 304, 52, 16, 8);
    g.stroke();
  }
  return new CanvasTexture(c);
}

/* physical overshoot for the unfold — anticipation + follow-through */
const easeOutBack = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export function createDocuments(ctx) {
  const { scene, coarse, track } = ctx;

  const faceTex = makeDocTexture();
  const glowTex = makeGlowTexture(128);
  const faceGeo = new PlaneGeometry(DOC_W, DOC_H);
  const edgeGeo = new EdgesGeometry(faceGeo);
  const haloGeo = new PlaneGeometry(DOC_W * 2.1, DOC_H * 1.8);
  track(faceTex, glowTex, faceGeo, edgeGeo, haloGeo);

  const swarmCount = coarse ? 60 : 110;

  const docs = Array.from({ length: COURSE_COUNT }, (_, i) => {
    const group = new Group();
    const anchor = docAnchor(i);
    group.position.copy(anchor);

    /* face the stretch of road the camera approaches on */
    const tan = sampleTangent(DOC_T[i], anchor.clone());
    group.rotation.y = Math.atan2(tan.x, tan.z) + Math.PI;

    const faceMat = new MeshBasicMaterial({
      map: faceTex,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: DoubleSide,
    });
    const face = new Mesh(faceGeo, faceMat);

    const edgeMat = new LineBasicMaterial({
      color: new Color(PALETTE.neon),
      transparent: true,
      opacity: 0,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const edges = new LineSegments(edgeGeo, edgeMat);

    const haloMat = new MeshBasicMaterial({
      map: glowTex,
      color: new Color(PALETTE.green),
      transparent: true,
      opacity: 0,
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide,
    });
    const halo = new Mesh(haloGeo, haloMat);
    halo.position.z = -0.1;

    /* particle swarm — scattered shell → document surface */
    const rand = mulberry(4000 + i * 17);
    const scatter = new Float32Array(swarmCount * 3);
    const target = new Float32Array(swarmCount * 3);
    const pos = new Float32Array(swarmCount * 3);
    for (let s = 0; s < swarmCount; s++) {
      scatter[s * 3] = (rand() - 0.5) * 7;
      scatter[s * 3 + 1] = (rand() - 0.5) * 5;
      scatter[s * 3 + 2] = (rand() - 0.5) * 6;
      target[s * 3] = (rand() - 0.5) * DOC_W;
      target[s * 3 + 1] = (rand() - 0.5) * DOC_H;
      target[s * 3 + 2] = (rand() - 0.5) * 0.08;
    }
    const swarmGeo = new BufferGeometry();
    swarmGeo.setAttribute("position", new Float32BufferAttribute(pos, 3));
    const swarmMat = new PointsMaterial({
      map: glowTex,
      color: new Color(PALETTE.lime),
      size: 0.075,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const swarm = new Points(swarmGeo, swarmMat);
    swarm.frustumCulled = false;

    group.add(face, edges, halo, swarm);
    group.visible = false;
    scene.add(group);
    track(faceMat, edgeMat, haloMat, swarmGeo, swarmMat);

    /* drift-aside direction: outward from the road, slightly up */
    const roadPoint = samplePoint(DOC_T[i], anchor.clone());
    const aside = group.position.clone().sub(roadPoint).setY(0).normalize();

    return {
      group, face, faceMat, edgeMat, haloMat,
      swarm, swarmGeo, swarmMat, scatter, target,
      base: group.position.clone(), aside,
      window: courseWindow(i), phase: i * 1.7,
    };
  });

  return {
    /** f = { p, time, dim } */
    update(f) {
      const { p, time, dim } = f;
      for (const doc of docs) {
        const [a, b] = doc.window;
        const span = b - a;
        // skip well outside the window — no work, no draw
        if (p < a - span * 0.4 || p > b + span * 1.2) {
          doc.group.visible = false;
          continue;
        }
        doc.group.visible = true;

        const assemble = sstep(p, a, a + span * 0.42);
        const focus = bell(p, a, b, 0.42, 0.35);
        const passed = sstep(p, b - span * 0.2, b + span * 0.35);

        /* swarm: converge onto the document, then fade as the face lands */
        const arr = doc.swarmGeo.attributes.position.array;
        for (let s = 0; s < arr.length / 3; s++) {
          // staggered per-particle arrival — the swarm feels intelligent
          const local = Math.min(1, Math.max(0, assemble * 1.5 - (s % 10) * 0.05));
          const e = 1 - Math.pow(1 - local, 3);
          const j = s * 3;
          arr[j] = doc.scatter[j] + (doc.target[j] - doc.scatter[j]) * e;
          arr[j + 1] =
            doc.scatter[j + 1] +
            (doc.target[j + 1] - doc.scatter[j + 1]) * e +
            Math.sin(time * 1.4 + s) * 0.02;
          arr[j + 2] = doc.scatter[j + 2] + (doc.target[j + 2] - doc.scatter[j + 2]) * e;
        }
        doc.swarmGeo.attributes.position.needsUpdate = true;
        doc.swarmMat.opacity = Math.sin(Math.min(assemble, 1) * Math.PI) * 0.85 * dim;

        /* unfold: the face swings open with overshoot as the swarm lands */
        const unfold = easeOutBack(sstep(p, a + span * 0.18, a + span * 0.5));
        doc.face.rotation.y = (1 - unfold) * 1.35;
        doc.face.scale.setScalar(0.65 + unfold * 0.35);

        /* alive at rest: breathing bob + slow sway */
        doc.group.position.copy(doc.base);
        doc.group.position.y += Math.sin(time * 0.6 + doc.phase) * 0.08;
        doc.group.position.addScaledVector(doc.aside, passed * 1.6);
        doc.group.rotation.z = Math.sin(time * 0.4 + doc.phase) * 0.02;

        const lit = (0.25 + focus * 0.75) * (1 - passed * 0.75) * dim;
        doc.faceMat.opacity = assemble * 0.95 * (1 - passed * 0.6) * dim;
        doc.edgeMat.opacity = assemble * lit;
        doc.haloMat.opacity =
          assemble * lit * 0.4 * (0.8 + 0.2 * Math.sin(time * 1.1 + doc.phase));
      }
    },
  };
}
