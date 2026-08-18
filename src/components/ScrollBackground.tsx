import { useEffect, useRef } from "react";

/**
 * Aurora gradient waves.
 * Slow-moving bands of colored light that flow across the screen.
 * Scrolling shifts the bands, their intensity, and their hue for a calm, clean backdrop.
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

    const css = getComputedStyle(document.documentElement);
    const primary = css.getPropertyValue("--primary").trim() || "260 80% 60%";
    const accent = css.getPropertyValue("--accent").trim() || "200 80% 60%";
    const foreground = css.getPropertyValue("--foreground").trim() || "0 0% 90%";

    const tint = (color: string, a: number) =>
      `color-mix(in oklab, hsl(${color}) ${Math.max(0, Math.min(1, a)) * 100}%, transparent)`;

    // Each band flows with its own frequency, phase, and vertical anchor.
    const bands = [
      { color: primary, base: 0.28, amp: 0.16, freq: 1.1, speed: 0.16, phase: 0.0, thickness: 0.42, alpha: 0.5 },
      { color: accent, base: 0.5, amp: 0.2, freq: 0.8, speed: -0.12, phase: 1.6, thickness: 0.5, alpha: 0.42 },
      { color: primary, base: 0.68, amp: 0.14, freq: 1.5, speed: 0.2, phase: 3.1, thickness: 0.36, alpha: 0.32 },
      { color: foreground, base: 0.84, amp: 0.1, freq: 2.0, speed: -0.18, phase: 4.4, thickness: 0.3, alpha: 0.12 },
    ];

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
      if (!reduced) t += 0.005;
      progress += (target - progress) * 0.06;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      const steps = w < 640 ? 24 : 48;

      for (let bi = 0; bi < bands.length; bi++) {
        const b = bands[bi]!;
        // scroll pushes bands upward and lifts their intensity as you go down the page
        const anchor = (b.base - progress * 0.22) * h;
        const flow = t * b.speed + b.phase;
        const bandAlpha = b.alpha * (0.55 + progress * 0.6);

        // build the top edge of the ribbon
        ctx.beginPath();
        ctx.moveTo(0, anchor);
        for (let i = 0; i <= steps; i++) {
          const x = (i / steps) * w;
          const wave =
            Math.sin(i * b.freq * 0.5 + flow) * b.amp * h * 0.5 +
            Math.sin(i * b.freq * 0.17 - flow * 1.3) * b.amp * h * 0.25;
          ctx.lineTo(x, anchor + wave);
        }
        // close down the ribbon thickness
        const thickness = b.thickness * h;
        for (let i = steps; i >= 0; i--) {
          const x = (i / steps) * w;
          const wave =
            Math.sin(i * b.freq * 0.5 + flow) * b.amp * h * 0.5 +
            Math.sin(i * b.freq * 0.17 - flow * 1.3) * b.amp * h * 0.25;
          ctx.lineTo(x, anchor + wave + thickness);
        }
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, anchor - thickness * 0.3, 0, anchor + thickness * 1.2);
        grad.addColorStop(0, tint(b.color, 0));
        grad.addColorStop(0.5, tint(b.color, bandAlpha));
        grad.addColorStop(1, tint(b.color, 0));
        ctx.fillStyle = grad;
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
      <canvas ref={canvasRef} className="absolute inset-0 size-full opacity-90 blur-2xl" />
      <div className="absolute left-1/2 top-1/2 size-[55vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
    </div>
  );
}
