/**
 * cinemaLoop — a self-contained, looping "cinematic" rendered to a 2D canvas,
 * standing in for real footage until a video file is dropped in (see
 * CinemaScreen in VideoSection for the swap point). Drifting aurora bands,
 * floating light motes, a slow light-sweep, grain and a vignette read as
 * moody, premium video on the TV screen.
 *
 * Single rAF loop, pauses when off screen or the tab is hidden (the caller
 * toggles `running`), sizes to its canvas's backing store, zero allocation in
 * the draw loop.
 */
export class CinemaLoop {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.running = false;
    this.time = 0;
    this.lastT = 0;
    this.w = 0;
    this.h = 0;
    this._raf = 0;

    // pre-seeded motes (deterministic, no per-frame allocation)
    this.motes = Array.from({ length: 46 }, (_, i) => ({
      x: (Math.sin(i * 12.9) * 0.5 + 0.5),
      y: (Math.cos(i * 78.2) * 0.5 + 0.5),
      r: 0.4 + ((i * 37) % 100) / 100,
      s: 0.02 + ((i * 53) % 100) / 100 * 0.06,
      p: (i * 91) % 100 / 100 * Math.PI * 2,
    }));

    this._loop = this._loop.bind(this);
    this.resize();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    this.w = Math.max(1, Math.round(rect.width));
    this.h = Math.max(1, Math.round(rect.height));
    this.canvas.width = Math.round(this.w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastT = performance.now();
    this._raf = requestAnimationFrame(this._loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this._raf);
  }

  _loop(now) {
    if (!this.running) return;
    this._raf = requestAnimationFrame(this._loop);
    const dt = Math.min((now - this.lastT) / 1000, 0.05);
    this.lastT = now;
    this.time += dt;
    this._draw();
  }

  _draw() {
    const { ctx: g, w, h, time } = this;

    // deep base wash
    const base = g.createLinearGradient(0, 0, 0, h);
    base.addColorStop(0, "#04140b");
    base.addColorStop(0.6, "#02100a");
    base.addColorStop(1, "#010805");
    g.fillStyle = base;
    g.fillRect(0, 0, w, h);

    // drifting aurora bands
    g.globalCompositeOperation = "lighter";
    const bands = 3;
    for (let i = 0; i < bands; i++) {
      const cy = h * (0.35 + i * 0.18) + Math.sin(time * 0.3 + i) * h * 0.08;
      const grad = g.createLinearGradient(0, cy - h * 0.25, 0, cy + h * 0.25);
      const a = 0.10 + i * 0.03;
      grad.addColorStop(0, "rgba(87,224,138,0)");
      grad.addColorStop(0.5, `rgba(${i === 1 ? "125,255,158" : "47,191,95"},${a})`);
      grad.addColorStop(1, "rgba(87,224,138,0)");
      g.fillStyle = grad;
      g.save();
      g.translate(0, Math.sin(time * 0.2 + i * 2) * h * 0.03);
      g.fillRect(0, cy - h * 0.25, w, h * 0.5);
      g.restore();
    }

    // slow diagonal light sweep
    const sweepX = ((time * 0.06) % 1.6 - 0.3) * w;
    const sweep = g.createLinearGradient(sweepX, 0, sweepX + w * 0.35, h);
    sweep.addColorStop(0, "rgba(125,255,158,0)");
    sweep.addColorStop(0.5, "rgba(125,255,158,0.08)");
    sweep.addColorStop(1, "rgba(125,255,158,0)");
    g.fillStyle = sweep;
    g.fillRect(0, 0, w, h);

    // floating motes
    for (const m of this.motes) {
      const mx = ((m.x + time * m.s * 0.12) % 1) * w;
      const my = (m.y * h + Math.sin(time * 0.5 + m.p) * h * 0.04);
      const rad = m.r * Math.min(w, h) * 0.006 + 0.5;
      const glow = g.createRadialGradient(mx, my, 0, mx, my, rad * 4);
      glow.addColorStop(0, "rgba(180,255,205,0.5)");
      glow.addColorStop(1, "rgba(180,255,205,0)");
      g.fillStyle = glow;
      g.beginPath();
      g.arc(mx, my, rad * 4, 0, Math.PI * 2);
      g.fill();
    }
    g.globalCompositeOperation = "source-over";

    // vignette
    const vig = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.25, w / 2, h / 2, Math.max(w, h) * 0.75);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.55)");
    g.fillStyle = vig;
    g.fillRect(0, 0, w, h);

    // faint scan shimmer — a horizontal soft line drifting down
    const scanY = ((time * 0.08) % 1) * h;
    const scan = g.createLinearGradient(0, scanY - 2, 0, scanY + 2);
    scan.addColorStop(0, "rgba(125,255,158,0)");
    scan.addColorStop(0.5, "rgba(125,255,158,0.06)");
    scan.addColorStop(1, "rgba(125,255,158,0)");
    g.fillStyle = scan;
    g.fillRect(0, scanY - 2, w, 4);
  }

  dispose() {
    this.stop();
    this.ctx = null;
  }
}

export default CinemaLoop;
