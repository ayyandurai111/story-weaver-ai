import { useEffect, useRef } from "react";

/**
 * RAG-themed scroll background: documents on the left dissolve into a
 * vector/embedding constellation that converges toward a retrieval point
 * on the right as the page scrolls.
 */
export function ScrollBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    type Node = {
      x: number;
      y: number;
      tx: number;
      ty: number;
      r: number;
      speed: number;
      phase: number;
    };

    const count = w < 640 ? 34 : 68;
    const nodes: Node[] = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      tx: 0.5 + (Math.random() - 0.5) * 0.28,
      ty: 0.5 + (Math.random() - 0.5) * 0.36,
      r: 1 + Math.random() * 2.2,
      speed: 0.4 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
    }));

    let progress = 0;
    let target = 0;
    const readScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      target = max > 0 ? window.scrollY / max : 0;
    };
    readScroll();
    progress = target;

    const css = getComputedStyle(document.documentElement);
    const ink = css.getPropertyValue("--foreground").trim() || "0 0% 20%";
    const stroke = (a: number) => `color-mix(in oklab, hsl(${ink}) ${a * 100}%, transparent)`;

    let raf = 0;
    let t = 0;

    const draw = () => {
      t += 0.006;
      progress += (target - progress) * 0.08;
      ctx.clearRect(0, 0, w, h);

      const pts: Array<{ x: number; y: number; a: number }> = [];

      for (const n of nodes) {
        const drift = reduced ? 0 : Math.sin(t * n.speed + n.phase) * 0.012;
        const e = Math.min(1, Math.max(0, progress * 1.25));
        const ease = e * e * (3 - 2 * e);
        const x = (n.x + (n.tx - n.x) * ease + drift) * w;
        const y = (n.y + (n.ty - n.y) * ease + drift * 0.6) * h;
        pts.push({ x, y, a: 0.18 + ease * 0.22 });
      }

      // retrieval links between near neighbours
      const linkDist = Math.min(w, h) * (0.16 + progress * 0.1);
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i]!;
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j]!;
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < linkDist) {
            ctx.strokeStyle = stroke((1 - d / linkDist) * 0.1 * (0.4 + progress));
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]!;
        ctx.fillStyle = stroke(p.a);
        ctx.beginPath();
        ctx.arc(p.x, p.y, nodes[i]!.r, 0, Math.PI * 2);
        ctx.fill();
      }


      // query pulse ring at the convergence point
      const cx = w * 0.5;
      const cy = h * 0.5;
      const pulse = (t * 0.35) % 1;
      ctx.strokeStyle = stroke(0.14 * (1 - pulse));
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, pulse * Math.min(w, h) * 0.42, 0, Math.PI * 2);
      ctx.stroke();

      raf = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/40" />
      <canvas ref={canvasRef} className="absolute inset-0 size-full opacity-70" />
      <div className="absolute left-1/2 top-1/2 size-[55vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
    </div>
  );
}
