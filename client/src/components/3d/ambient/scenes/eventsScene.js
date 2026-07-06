import {
  AdditiveBlending,
  BoxGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  Group,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  TorusGeometry,
} from "three";
import { mulberry } from "../ambientEngine.js";

/**
 * Events — "the time ring": a clock-like dial of twelve ticks with event
 * tickets orbiting it on inclined paths. Scroll scrubs the dial forward —
 * time advancing through the calendar — while the active tick pulses like
 * a second hand.
 */

const DIAL_POS = [3.5, 0.2, -1.5];
const TICKS = 12;
const TICKETS = 5;

/** Minimal event-ticket texture: frame, title bar, date line, tear-off end. */
function makeTicketTexture(isDark) {
  const c = document.createElement("canvas");
  c.width = 220;
  c.height = 110;
  const g = c.getContext("2d");
  const bg = isDark ? "rgba(8, 16, 11, 0.92)" : "rgba(248, 252, 249, 0.94)";
  const frame = isDark ? "rgba(125, 255, 158, 0.55)" : "rgba(22, 163, 74, 0.55)";
  const strong = isDark ? "rgba(125, 255, 158, 0.9)" : "rgba(13, 143, 63, 0.85)";
  const faint = isDark ? "rgba(87, 224, 138, 0.4)" : "rgba(21, 128, 61, 0.35)";
  g.fillStyle = bg;
  g.fillRect(0, 0, 220, 110);
  g.strokeStyle = frame;
  g.strokeRect(1, 1, 218, 108);
  /* tear-off perforation */
  g.setLineDash([4, 5]);
  g.beginPath();
  g.moveTo(165, 4);
  g.lineTo(165, 106);
  g.stroke();
  g.setLineDash([]);
  /* title + date lines */
  g.fillStyle = strong;
  g.fillRect(14, 20, 110, 9);
  g.fillStyle = faint;
  g.fillRect(14, 42, 130, 6);
  g.fillRect(14, 58, 96, 6);
  g.fillStyle = strong;
  g.fillRect(14, 80, 56, 7);
  /* stub mark */
  g.fillStyle = faint;
  g.fillRect(178, 40, 28, 28);
  return new CanvasTexture(c);
}

export default {
  camera: [0, 0, 8],
  parallax: 0.55,
  dolly: -1.2,

  build(e) {
    const s = e.state;
    s.dial = new Group();
    s.dial.position.set(...DIAL_POS);

    /* dial ring + hour ticks */
    const ringGeo = new TorusGeometry(1.7, 0.018, 6, 80);
    s.ringMat = new MeshBasicMaterial({ transparent: true, depthWrite: false });
    s.dial.add(new Mesh(ringGeo, s.ringMat));

    const tickGeo = new BoxGeometry(0.05, 0.26, 0.05);
    s.tickMat = new MeshBasicMaterial({ transparent: true, blending: AdditiveBlending, depthWrite: false });
    s.ticks = new InstancedMesh(tickGeo, s.tickMat, TICKS);
    s.dial.add(s.ticks);

    /* inner pulse core */
    const coreGeo = new TorusGeometry(0.35, 0.012, 6, 40);
    s.coreMat = new MeshBasicMaterial({ transparent: true, blending: AdditiveBlending, depthWrite: false });
    s.core = new Mesh(coreGeo, s.coreMat);
    s.dial.add(s.core);

    /* orbiting tickets */
    s.ticketTex = { dark: makeTicketTexture(true), light: makeTicketTexture(false) };
    const ticketGeo = new PlaneGeometry(1.1, 0.55);
    s.ticketMat = new MeshBasicMaterial({
      map: s.ticketTex.dark,
      transparent: true,
      side: DoubleSide,
      depthWrite: false,
    });
    const rand = mulberry(9);
    s.tickets = [];
    s.ticketData = [];
    for (let i = 0; i < TICKETS; i++) {
      const mesh = new Mesh(ticketGeo, s.ticketMat);
      s.tickets.push(mesh);
      s.ticketData.push({
        radius: 2.2 + rand() * 0.7,
        speed: 0.1 + rand() * 0.12,
        phase: (i / TICKETS) * Math.PI * 2,
        incline: (rand() - 0.5) * 0.9,
        bob: rand() * Math.PI * 2,
      });
      s.dial.add(mesh);
    }

    e.scene.add(s.dial);
    e.track(ringGeo, tickGeo, coreGeo, ticketGeo,
      s.ringMat, s.tickMat, s.coreMat, s.ticketMat,
      s.ticketTex.dark, s.ticketTex.light, s.ticks);
  },

  theme(e) {
    const { a, b } = e.palette;
    const s = e.state;
    s.ringMat.color = new Color(b);
    s.ringMat.opacity = 0.35 * e.dim;
    s.tickMat.color = new Color(a);
    s.tickMat.opacity = 0.7 * e.dim;
    s.coreMat.color = new Color(a);
    s.coreMat.opacity = 0.5 * e.dim;
    s.ticketMat.color = new Color("#ffffff");
    s.ticketMat.map = e.isDark ? s.ticketTex.dark : s.ticketTex.light;
    s.ticketMat.opacity = (e.isDark ? 0.55 : 0.4) * (e.dim === 1 ? 1 : 0.9);
  },

  update(e) {
    const { time, progress: p, state: s, dummy: d } = e;

    /* scroll scrubs the dial; idle keeps a faint drift */
    s.dial.rotation.z = -p * 2.2 - time * 0.02;
    s.dial.rotation.y = Math.sin(time * 0.12) * 0.18 + p * 0.4;
    s.dial.position.y = DIAL_POS[1] - p * 1.0 + Math.sin(time * 0.45) * 0.07;

    /* the "second hand" tick pulses around the dial */
    const active = Math.floor(time * 0.8) % TICKS;
    for (let i = 0; i < TICKS; i++) {
      const a = (i / TICKS) * Math.PI * 2;
      d.position.set(Math.cos(a) * 1.7, Math.sin(a) * 1.7, 0);
      d.rotation.set(0, 0, a);
      const pulse = i === active ? 1 + Math.sin(time * 8) * 0.25 : 1;
      d.scale.setScalar(pulse);
      d.updateMatrix();
      s.ticks.setMatrixAt(i, d.matrix);
    }
    s.ticks.instanceMatrix.needsUpdate = true;

    s.core.rotation.z = time * 0.6;
    s.core.scale.setScalar(1 + Math.sin(time * 1.8) * 0.15);

    /* tickets orbit on inclined paths, always facing the camera */
    for (let i = 0; i < s.tickets.length; i++) {
      const td = s.ticketData[i];
      const a = td.phase + time * td.speed + p * 1.2;
      const mesh = s.tickets[i];
      mesh.position.set(
        Math.cos(a) * td.radius,
        Math.sin(a) * td.radius * 0.45 + Math.sin(time * 0.6 + td.bob) * 0.15 + td.incline,
        Math.sin(a) * 0.8
      );
      mesh.quaternion.copy(e.camera.quaternion);
      mesh.rotateZ(Math.sin(time * 0.4 + td.bob) * 0.08);
    }
  },
};
