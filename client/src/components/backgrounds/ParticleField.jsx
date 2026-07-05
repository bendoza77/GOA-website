import { useEffect, useRef } from "react";
import { cn } from "../../utils/cn.js";
import { useAnimationContext } from "../../context/AnimationContext.jsx";
import { useThemeContext } from "../../context/ThemeContext.jsx";

/**
 * ParticleField — lightweight canvas of drifting green nodes with subtle
 * proximity links (a calm "network" ambience). Performance-first:
 *  - particle count scales with viewport area (capped)
 *  - pauses when off-screen / reduced-motion
 *  - devicePixelRatio-aware for crisp rendering
 */
const ParticleField = ({ className, density = 0.00008, linkDistance = 130 }) => {
  const canvasRef = useRef(null);
  const { animationsOn } = useAnimationContext();
  const { isDark } = useThemeContext();

  useEffect(() => {
    if (!animationsOn) return;
    const nodeColor = isDark ? "125, 255, 158" : "22, 128, 61";
    const linkColor = isDark ? "87, 224, 138" : "21, 128, 61";
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let particles = [];
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let visible = true;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(Math.floor(width * height * density), 90);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.6 + 0.6,
      }));
    };

    const nodeFill = `rgba(${nodeColor}, 0.55)`;
    const linkDistSq = linkDistance * linkDistance;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Nodes — one path, one fill (style changes and fills are the slow part)
      ctx.fillStyle = nodeFill;
      ctx.beginPath();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        ctx.moveTo(p.x + p.r, p.y);
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      }
      ctx.fill();

      // Links — squared-distance cull so the sqrt only runs for close pairs
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < linkDistSq) {
            const dist = Math.sqrt(distSq);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(${linkColor}, ${0.14 * (1 - dist / linkDistance)})`;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(draw);
        } else {
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 }
    );

    resize();
    io.observe(canvas);
    window.addEventListener("resize", resize, { passive: true });
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [animationsOn, density, linkDistance, isDark]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      aria-hidden="true"
    />
  );
};

export default ParticleField;
