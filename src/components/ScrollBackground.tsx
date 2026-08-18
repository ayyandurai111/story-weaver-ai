import { useEffect, useRef } from "react";

/**
 * Deep-space neural network: a 3D field of nodes and synaptic links that the
 * camera travels through as the page scrolls. Nodes light up when they pass
 * the retrieval point in the centre of the viewport.
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

    type Node3D = {
      x: number;
      y: number;
      z: number;
      r: number;
      phase: number;
      speed: number;
    };

    const depth = 2400;
    const count = w < 640 ? 120 : 260;

    const nodes: Node3D[] = Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 2.2,
      y: (Math.random() - 0.5) * 1.6,
      z: Math.random() * depth,
      r: 1.2 + Math.random() * 2.4,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.7,
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
    const primary = css.getPropertyValue("--primary").trim() || "0 0% 50%";

    const stroke = (color: string, a: number) =>
      `color-mix(in oklab, hsl(${color}) ${a * 100}%, transparent)`;

    const fov = 600;

    const project = (x: number, y: number, z: number, cameraZ: number) => {
      const scale = fov / (fov + z - cameraZ);
      return {
        x: w * 0.5 + x * scale * Math.min(w, h) * 0.45,
        y: h * 0.5 + y * scale * Math.min(w, h) * 0.45,
        scale,
        visible: scale > 0,
      };
    };

    let raf = 0;
    let t = 0;

    const draw = () => {
      t += 0.005;
      progress += (target - progress) * 0.06;

      const cameraZ = progress * (depth + fov * 0.6) - fov * 0.3;
      const rotation = progress * Math.PI * 0.35;

      ctx.clearRect(0, 0, w, h);

      const projected: Array<{ x: number; y: number; scale: number; z: number; intensity: number; i: number }> = [];

      const retrievalZ = cameraZ + fov * 0.4;
      const cx = w * 0.5;
      const cy = h * 0.5;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]!;
        const drift = reduced ? 0 : Math.sin(t * n.speed + n.phase) * 0.008;

        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);
        const rx = n.x * cos - n.z * sin;
        const rz = n.z * cos + n.x * sin;

        const p = project(rx + drift, n.y + drift, rz, cameraZ);
        if (!p.visible) continue;

        const distToRetrieval = Math.abs(rz - retrievalZ);
        const centerDist = Math.hypot(p.x - cx, p.y - cy) / Math.min(w, h);
        const intensity = Math.max(0, 1 - distToRetrieval / 340) * Math.max(0, 1 - centerDist * 2.2);

        projected.push({ x: p.x, y: p.y, scale: p.scale, z: rz, intensity, i });
      }

      // Draw links between nearby nodes in 3D space.
      const linkCount = projected.length;
      const maxLinks = reduced ? 1200 : 2600;
      let linksDrawn = 0;
      for (let i = 0; i < linkCount && linksDrawn < maxLinks; i++) {
        const a = projected[i]!;
        for (let j = i + 1; j < linkCount && linksDrawn < maxLinks; j++) {
          const b = projected[j]!;
          const dz = Math.abs(a.z - b.z);
          if (dz > 260) continue;
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          const threshold = Math.min(w, h) * 0.18 * Math.min(a.scale, b.scale);
          if (d < threshold) {
            const baseAlpha = (1 - d / threshold) * 0.12 * Math.min(a.scale, b.scale);
            const glow = Math.max(a.intensity, b.intensity) * 0.45;
            ctx.strokeStyle = stroke(ink, baseAlpha + glow);
            ctx.lineWidth = Math.max(0.5, 1.2 * Math.min(a.scale, b.scale));
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            linksDrawn++;
          }
        }
      }

      // Draw nodes.
      for (const p of projected) {
        const baseR = p.scale * nodes[p.i]!.r;
        const glowR = baseR * (1 + p.intensity * 1.8);
        const alpha = Math.min(0.9, 0.18 + p.intensity * 0.7) * Math.min(1, p.scale * 1.2);

        ctx.fillStyle = stroke(p.intensity > 0.35 ? primary : ink, alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
        ctx.fill();

        if (p.intensity > 0.15) {
          ctx.fillStyle = stroke(primary, p.intensity * 0.35);
          ctx.beginPath();
          ctx.arc(p.x, p.y, glowR * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Retrieval ring marking the active plane.
      const ringScale = fov / (fov + retrievalZ - cameraZ);
      const ringRadius = Math.min(w, h) * 0.18 * ringScale;
      ctx.strokeStyle = stroke(primary, 0.08 + progress * 0.12);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
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
      <canvas ref={canvasRef} className="absolute inset-0 size-full opacity-80" />
      <div className="absolute left-1/2 top-1/2 size-[55vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
    </div>
  );
}
