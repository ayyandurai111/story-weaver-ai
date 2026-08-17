import { useEffect, useRef } from "react";

/**
 * Fixed 3D perspective background: a receding grid plane plus floating
 * depth cards that rotate and translate as the page scrolls.
 */
export function ScrollBackground() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const shapesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;

      if (gridRef.current) {
        gridRef.current.style.transform = `rotateX(72deg) translate3d(0, ${p * 1200}px, 0)`;
      }
      if (shapesRef.current) {
        shapesRef.current.style.transform = `translate3d(0, ${-p * 240}px, ${p * 420}px) rotateX(${p * 24}deg) rotateY(${p * 36}deg)`;
      }
      if (sceneRef.current) {
        sceneRef.current.style.opacity = String(0.55 + p * 0.25);
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      ref={sceneRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden [perspective:900px]"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/40" />

      {/* Receding grid plane */}
      <div
        ref={gridRef}
        className="absolute left-1/2 top-1/2 h-[220vh] w-[300vw] -translate-x-1/2 origin-top will-change-transform opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage: "linear-gradient(to bottom, transparent, black 30%, transparent 85%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black 30%, transparent 85%)",
        }}
      />

      {/* Floating depth shapes */}
      <div
        ref={shapesRef}
        className="absolute inset-0 [transform-style:preserve-3d] will-change-transform"
      >
        <div className="absolute left-[8%] top-[18%] size-40 rounded-3xl border border-primary/20 bg-primary/5 [transform:translateZ(-160px)_rotate(12deg)]" />
        <div className="absolute right-[10%] top-[30%] size-56 rounded-full border border-muted-foreground/20 bg-muted/30 [transform:translateZ(-320px)]" />
        <div className="absolute left-[20%] bottom-[16%] size-32 rounded-2xl border border-accent/25 bg-accent/5 [transform:translateZ(-80px)_rotate(-18deg)]" />
        <div className="absolute right-[22%] bottom-[24%] size-24 rounded-xl border border-primary/20 bg-card/60 [transform:translateZ(-40px)_rotate(24deg)]" />
      </div>

      {/* Soft glow */}
      <div className="absolute left-1/2 top-1/3 size-[60vw] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
    </div>
  );
}
