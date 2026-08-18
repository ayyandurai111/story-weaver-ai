import { useEffect, useRef } from "react";

/**
 * Deep-space neural network.
 * Scroll start: tiny, almost invisible dots drifting in deep space (no ring).
 * Scroll end: every neuron converges onto a single ring that keeps rotating in 3D.
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

    const depth = 2400;
    const count = w < 640 ? 110 : 240;

    const nodes = Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2;
      return {
        x: (Math.random() - 0.5) * 2.2,
        y: (Math.random() - 0.5) * 1.6,
        z: Math.random() * depth,
        r: 1.0 + Math.random() * 2.2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.7,
        // ring target (unit circle in x/y, flat in z)
        ra: a,
        rr: 0.78 + Math.random() * 0.1,
        rz: (Math.random() - 0.5) * 120,
      };
    });

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

    const tint = (color: string, a: number) =>
      `color-mix(in oklab, hsl(${color}) ${Math.max(0, Math.min(1, a)) * 100}%, transparent)`;

    const fov = 600;
    const smooth = (t: number) => t * t * (3 - 2 * t);
    const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

    let raf = 0;
    let t = 0;
    let spin = 0;

    const draw = () => {
      t += 0.005;
      progress += (target - progress) * 0.06;

      // 0 → deep space travel, 1 → fully gathered into the ring
      const gather = smooth(clamp01((progress - 0.55) / 0.45));
      // dots start almost invisible and grow in
      const born = smooth(clamp01(progress / 0.28));

      if (!reduced) spin += 0.0015 + gather * 0.006;

      const cameraZ = progress * (depth + fov * 0.6) - fov * 0.3;
      const rotation = progress * Math.PI * 0.35 + spin;
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);

      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.5;
      const ringZ = cameraZ + fov * 0.55;
      const projected: Array<{ x: number; y: number; scale: number; z: number; intensity: number; r: number }> = [];

      for (const n of nodes) {
        const drift = reduced ? 0 : Math.sin(t * n.speed + n.phase) * 0.008;

        // free position
        const fx = n.x + drift;
        const fy = n.y + drift;
        const fz = n.z;

        // ring position (locked to camera so it stays in view)
        const gx = Math.cos(n.ra + spin * 1.2) * n.rr;
        const gy = Math.sin(n.ra + spin * 1.2) * n.rr * 0.42;
        const gz = ringZ + Math.sin(n.ra + spin * 1.2) * 220 + n.rz;

        const px = fx + (gx - fx) * gather;
        const py = fy + (gy - fy) * gather;
        const pz = fz + (gz - fz) * gather;

        // 3D rotate around Y
        const rx = px * cos - ((pz - cameraZ) / 1400) * sin;
        const rz = pz;

        const scale = fov / (fov + rz - cameraZ);
        if (scale <= 0) continue;

        const sx = cx + rx * scale * Math.min(w, h) * 0.45;
        const sy = cy + py * scale * Math.min(w, h) * 0.45;

        const dist = Math.abs(rz - ringZ);
        const intensity = Math.max(gather * 0.6, Math.max(0, 1 - dist / 340) * 0.9);

        projected.push({ x: sx, y: sy, scale, z: rz, intensity, r: n.r });
      }

      // synapses
      const maxLinks = reduced ? 900 : 2200;
      let drawn = 0;
      for (let i = 0; i < projected.length && drawn < maxLinks; i++) {
        const a = projected[i]!;
        for (let j = i + 1; j < projected.length && drawn < maxLinks; j++) {
          const b = projected[j]!;
          if (Math.abs(a.z - b.z) > 300) continue;
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          const threshold = Math.min(w, h) * 0.18 * Math.min(a.scale, b.scale);
          if (d >= threshold) continue;
          const base = (1 - d / threshold) * 0.1 * Math.min(a.scale, b.scale);
          const glow = Math.max(a.intensity, b.intensity) * 0.35 * born;
          ctx.strokeStyle = tint(ink, (base + glow) * born);
          ctx.lineWidth = Math.max(0.4, 1.1 * Math.min(a.scale, b.scale));
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          drawn++;
        }
      }

      // neurons
      for (const p of projected) {
        const baseR = p.scale * p.r * (0.15 + born * 0.85);
        const glowR = baseR * (1 + p.intensity * 1.6);
        const alpha = Math.min(0.9, 0.05 + p.intensity * 0.75) * born * Math.min(1, p.scale * 1.2);

        ctx.fillStyle = tint(p.intensity > 0.35 ? primary : ink, alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.3, glowR), 0, Math.PI * 2);
        ctx.fill();

        if (p.intensity > 0.2 && born > 0.4) {
          ctx.fillStyle = tint(primary, p.intensity * 0.25 * born);
          ctx.beginPath();
          ctx.arc(p.x, p.y, glowR * 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ring outline appears only once the neurons gather
      if (gather > 0.02) {
        const ringScale = fov / (fov + ringZ - cameraZ);
        ctx.strokeStyle = tint(primary, gather * 0.22);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy,
          Math.min(w, h) * 0.45 * 0.82 * ringScale,
          Math.min(w, h) * 0.45 * 0.35 * ringScale,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }

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
