import { useEffect, useRef } from "react";

/**
 * Ink bloom / smoke.
 * Soft clouds of color slowly diffuse, bloom, and drift.
 * Scrolling accelerates the blooms and shifts them upward for a calm, dreamy backdrop.
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

    // Resolve any CSS color (incl. oklch relative syntax) to an "r, g, b" sRGB triplet
    // by rasterizing it on a 1x1 probe canvas — canvas gradients only accept rgba/hex.
    const probe = document.createElement("canvas");
    probe.width = 1;
    probe.height = 1;
    const pctx = probe.getContext("2d", { willReadFrequently: true })!;
    const resolveRGB = (color: string, fallback: string): string => {
      try {
        pctx.clearRect(0, 0, 1, 1);
        pctx.fillStyle = "#000";
        pctx.fillStyle = color;
        pctx.fillRect(0, 0, 1, 1);
        const [r, g, b] = pctx.getImageData(0, 0, 1, 1).data;
        return `${r}, ${g}, ${b}`;
      } catch {
        return fallback;
      }
    };

    const css = getComputedStyle(document.documentElement);
    const primary = resolveRGB(css.getPropertyValue("--primary").trim(), "160, 174, 192");
    const accent = resolveRGB(css.getPropertyValue("--accent").trim(), "113, 128, 150");
    const foreground = resolveRGB(css.getPropertyValue("--foreground").trim(), "248, 250, 252");

    const tint = (rgb: string, a: number) => `rgba(${rgb}, ${Math.max(0, Math.min(1, a))})`;

    const palette = [primary, accent, primary, foreground];

    // Each bloom is a soft cloud that grows, fades, and respawns — like ink diffusing in water.
    type Bloom = {
      x: number;
      y: number;
      seed: number;
      speed: number;
      driftX: number;
      color: string;
      maxAlpha: number;
      size: number;
      phase: number;
    };

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const count = w < 640 ? 5 : 8;
    const blooms: Bloom[] = Array.from({ length: count }, (_, i) => ({
      x: rand(0.1, 0.9),
      y: rand(0.05, 0.95),
      seed: Math.random(),
      speed: rand(0.05, 0.12),
      driftX: rand(-0.02, 0.02),
      color: palette[i % palette.length]!,
      maxAlpha: rand(0.16, 0.34),
      size: rand(0.35, 0.7),
      phase: Math.random(),
    }));

    let progress = 0;
    let target = 0;
    const readScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      target = max > 0 ? window.scrollY / max : 0;
    };
    readScroll();
    progress = target;

    let raf = 0;
    let t = 0;

    const draw = () => {
      if (!reduced) t += 0.0025;
      progress += (target - progress) * 0.06;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      const minDim = Math.min(w, h);

      for (const b of blooms) {
        // life cycle 0..1: grows and fades, driven by time + scroll speed
        const cycle = (t * b.speed + b.phase) % 1;
        const life = cycle;
        // ease: bloom quickly, dissolve slowly
        const grow = Math.sin(life * Math.PI); // 0 -> 1 -> 0
        const radius = minDim * b.size * (0.35 + grow * 0.9);

        // scroll lifts blooms upward and nudges them; time adds gentle drift
        const cx = (b.x + Math.sin(t * 0.6 + b.seed * 6.28) * 0.04 + b.driftX * life) * w;
        const cy = (b.y - progress * 0.35 + Math.cos(t * 0.5 + b.seed * 6.28) * 0.03) * h;
        const wrappedY = ((cy % h) + h) % h;

        const alpha = b.maxAlpha * grow * (0.6 + progress * 0.5);
        if (alpha <= 0.002) continue;

        const grad = ctx.createRadialGradient(cx, wrappedY, 0, cx, wrappedY, radius);
        grad.addColorStop(0, tint(b.color, alpha));
        grad.addColorStop(0.45, tint(b.color, alpha * 0.35));
        grad.addColorStop(1, tint(b.color, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, wrappedY, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
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
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/30" />
      <canvas ref={canvasRef} className="absolute inset-0 size-full opacity-90 blur-3xl" />
    </div>
  );
}
