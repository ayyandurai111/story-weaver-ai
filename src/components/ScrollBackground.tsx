import { useEffect, useRef } from "react";

/**
 * One continuous, scroll-driven cinematic animation:
 * documents -> chunks -> embeddings -> neural network -> query -> retrieval -> LLM -> answer.
 */

type Node = {
  doc: number;
  // keyframe positions (normalized, centered)
  docX: number;
  docY: number;
  chunkX: number;
  chunkY: number;
  gridX: number;
  gridY: number;
  netX: number;
  netY: number;
  relevant: boolean;
  seed: number;
  size: number;
};

const DOCS = 6;
const PER_DOC = 7;

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const seg = (p: number, a: number, b: number) => smooth(clamp01((p - a) / (b - a)));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

function readColor(varName: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const el = document.createElement("div");
  el.style.color = `var(${varName})`;
  el.style.display = "none";
  document.body.appendChild(el);
  const c = getComputedStyle(el).color;
  el.remove();
  return c || fallback;
}

function rgba(color: string, alpha: number) {
  const m = color.match(/-?[\d.]+/g);
  if (!m) return color;
  const [r, g, b] = m;
  return `rgba(${r}, ${g}, ${b}, ${clamp01(alpha)})`;
}

export function ScrollBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const cyan = readColor("--primary", "rgb(34, 211, 238)");
    const violet = readColor("--chart-4", "rgb(167, 139, 250)");
    const ink = readColor("--foreground", "rgb(232, 244, 255)");

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // deterministic pseudo random
    let s = 1337;
    const rnd = () => {
      s = (s * 1664525 + 1013904223) % 4294967296;
      return s / 4294967296;
    };

    const nodes: Node[] = [];
    for (let d = 0; d < DOCS; d++) {
      const docX = (d - (DOCS - 1) / 2) * 0.26;
      const docY = -0.05 + (d % 2) * 0.04;
      for (let c = 0; c < PER_DOC; c++) {
        const col = c % 3;
        const row = Math.floor(c / 3);
        const idx = nodes.length;
        const total = DOCS * PER_DOC;
        const a = (idx / total) * Math.PI * 2;
        const rr = 0.22 + rnd() * 0.26;
        nodes.push({
          doc: d,
          docX,
          docY,
          chunkX: docX + (col - 1) * 0.055,
          chunkY: docY + (row - 1) * 0.05,
          gridX: ((idx % 9) - 4) * 0.1,
          gridY: (Math.floor(idx / 9) - 2) * 0.09,
          netX: Math.cos(a) * rr + (rnd() - 0.5) * 0.12,
          netY: Math.sin(a) * rr * 0.72 + (rnd() - 0.5) * 0.1,
          relevant: rnd() < 0.22,
          seed: rnd() * Math.PI * 2,
          size: 2.2 + rnd() * 2.2,
        });
      }
    }
    // guarantee some relevant nodes
    nodes.slice(0, 8).forEach((n, i) => {
      if (i % 2 === 0) n.relevant = true;
    });

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
      t += 0.008;
      progress += (target - progress) * 0.07;
      const p = progress;
      const S = Math.min(w, h);
      const cx = w * 0.5;
      const cy = h * 0.5;
      const X = (nx: number) => cx + nx * S;
      const Y = (ny: number) => cy + ny * S;

      // stage envelopes
      const enter = seg(p, 0.0, 0.1); // documents arrive
      const split = seg(p, 0.12, 0.24); // chunks
      const embed = seg(p, 0.26, 0.4); // glowing dots grid
      const network = seg(p, 0.42, 0.56); // network form + links
      const query = seg(p, 0.58, 0.68); // query pulse
      const retrieve = seg(p, 0.68, 0.8); // relevant light up
      const toBrain = seg(p, 0.8, 0.9); // flow to brain
      const answer = seg(p, 0.9, 1.0); // answer

      ctx.clearRect(0, 0, w, h);

      // ---------- documents ----------
      const docAlpha = enter * (1 - split);
      if (docAlpha > 0.01) {
        for (let d = 0; d < DOCS; d++) {
          const base = nodes[d * PER_DOC]!;
          const dy = mix(0.55, 0, enter) + (reduced ? 0 : Math.sin(t + d) * 0.006);
          const x = X(base.docX);
          const y = Y(base.docY + dy);
          const pw = S * 0.11;
          const ph = S * 0.145;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(Math.sin(d * 1.7) * 0.06);
          ctx.strokeStyle = rgba(cyan, 0.5 * docAlpha);
          ctx.fillStyle = rgba(cyan, 0.05 * docAlpha);
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.roundRect(-pw / 2, -ph / 2, pw, ph, 6);
          ctx.fill();
          ctx.stroke();
          ctx.strokeStyle = rgba(ink, 0.22 * docAlpha);
          for (let l = 0; l < 5; l++) {
            const ly = -ph / 2 + 14 + l * (ph - 24) / 5;
            ctx.beginPath();
            ctx.moveTo(-pw / 2 + 9, ly);
            ctx.lineTo(pw / 2 - 9 - (l % 2) * pw * 0.25, ly);
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      // ---------- node positions ----------
      const brainX = 0;
      const brainY = 0.02;
      const pts = nodes.map((n) => {
        let nx = n.docX;
        let ny = n.docY;
        nx = mix(nx, n.chunkX, split);
        ny = mix(ny, n.chunkY, split);
        nx = mix(nx, n.gridX, embed);
        ny = mix(ny, n.gridY, embed);
        nx = mix(nx, n.netX, network);
        ny = mix(ny, n.netY, network);
        const pull = n.relevant ? toBrain : toBrain * 0.12;
        nx = mix(nx, brainX, pull);
        ny = mix(ny, brainY, pull);
        const drift = reduced ? 0 : Math.sin(t * 1.2 + n.seed) * 0.004 * (embed + network);
        return { x: X(nx + drift), y: Y(ny + drift), n };
      });

      // ---------- chunk squares (between split and embed) ----------
      const chunkAlpha = split * (1 - embed);
      if (chunkAlpha > 0.01) {
        ctx.strokeStyle = rgba(cyan, 0.45 * chunkAlpha);
        ctx.lineWidth = 1;
        for (const pt of pts) {
          const sz = S * 0.026 * (1 - embed * 0.6);
          ctx.beginPath();
          ctx.roundRect(pt.x - sz / 2, pt.y - sz / 2, sz, sz, 3);
          ctx.stroke();
        }
      }

      // ---------- links ----------
      const linkAlpha = network * (1 - answer * 0.9);
      if (linkAlpha > 0.01) {
        const threshold = S * 0.17;
        for (let i = 0; i < pts.length; i++) {
          const a = pts[i]!;
          for (let j = i + 1; j < pts.length; j++) {
            const b = pts[j]!;
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.hypot(dx, dy);
            if (dist > threshold) continue;
            const hot = a.n.relevant && b.n.relevant ? retrieve : 0;
            const strength = (1 - dist / threshold) * linkAlpha;
            ctx.strokeStyle = hot > 0.05 ? rgba(cyan, strength * (0.45 + hot)) : rgba(violet, strength * 0.5);
            ctx.lineWidth = hot > 0.05 ? 1.6 : 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // ---------- nodes ----------
      const nodeAlpha = Math.max(embed, network) * (1 - answer * 0.7);
      if (nodeAlpha > 0.01) {
        for (const pt of pts) {
          const hot = pt.n.relevant ? retrieve : 0;
          const pulse = reduced ? 0 : (Math.sin(t * 2 + pt.n.seed) + 1) * 0.5;
          const r = pt.n.size * 1.6 * (1 + hot * 1.4) * (0.8 + pulse * 0.25);
          const color = hot > 0.05 ? cyan : violet;
          ctx.fillStyle = rgba(color, nodeAlpha * (0.85 + hot * 0.15));
          ctx.shadowBlur = 18 * (0.6 + hot);
          ctx.shadowColor = rgba(color, nodeAlpha);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // ---------- query pulse ----------
      if (query > 0.01 && retrieve < 0.98) {
        const qy = mix(0.62, brainY, query);
        const qx = brainX;
        const rings = 3;
        for (let i = 0; i < rings; i++) {
          const rp = ((t * 0.6 + i / rings) % 1);
          ctx.strokeStyle = rgba(cyan, (1 - rp) * 0.4 * query * (1 - retrieve * 0.6));
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(X(qx), Y(qy), S * (0.03 + rp * 0.35), 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = rgba(cyan, 0.9 * query);
        ctx.shadowBlur = 24;
        ctx.shadowColor = rgba(cyan, 0.9);
        ctx.beginPath();
        ctx.arc(X(qx), Y(qy), S * 0.012, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ---------- particles flowing into the brain ----------
      if (toBrain > 0.01) {
        for (const pt of pts) {
          if (!pt.n.relevant) continue;
          const flow = ((t * 0.8 + pt.n.seed) % 1);
          const fx = mix(pt.x, X(brainX), flow);
          const fy = mix(pt.y, Y(brainY), flow);
          ctx.fillStyle = rgba(cyan, (1 - flow) * toBrain * 0.9);
          ctx.beginPath();
          ctx.arc(fx, fy, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ---------- the brain ----------
      if (toBrain > 0.01) {
        const R = S * (0.09 + toBrain * 0.03);
        ctx.save();
        ctx.translate(X(brainX), Y(brainY));
        ctx.shadowBlur = 40 * toBrain;
        ctx.shadowColor = rgba(cyan, 0.7 * toBrain);
        ctx.strokeStyle = rgba(cyan, 0.7 * toBrain);
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = rgba(violet, 0.55 * toBrain);
        ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
          const a0 = (i / 6) * Math.PI * 2 + (reduced ? 0 : t * 0.3);
          ctx.beginPath();
          ctx.ellipse(0, 0, R * 0.85, R * (0.25 + (i % 3) * 0.22), a0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = rgba(cyan, 0.1 * toBrain);
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ---------- the answer ----------
      if (answer > 0.01) {
        const ax = X(brainX);
        const ay = Y(brainY + mix(0, 0.24, answer));
        for (let i = 0; i < 3; i++) {
          const rp = (t * 0.5 + i / 3) % 1;
          ctx.strokeStyle = rgba(cyan, (1 - rp) * 0.3 * answer);
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(ax, ay, S * (0.05 + rp * 0.25), 0, Math.PI * 2);
          ctx.stroke();
        }
        const bw = S * 0.34;
        const bh = S * 0.12;
        ctx.save();
        ctx.globalAlpha = answer;
        ctx.shadowBlur = 30;
        ctx.shadowColor = rgba(cyan, 0.5);
        ctx.strokeStyle = rgba(cyan, 0.75);
        ctx.fillStyle = rgba(cyan, 0.07);
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.roundRect(ax - bw / 2, ay - bh / 2, bw, bh, 14);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = rgba(ink, 0.35);
        for (let l = 0; l < 3; l++) {
          const ly = ay - bh / 2 + 22 + l * 18;
          ctx.beginPath();
          ctx.moveTo(ax - bw / 2 + 20, ly);
          ctx.lineTo(ax + bw / 2 - 20 - l * bw * 0.2, ly);
          ctx.stroke();
        }
        ctx.restore();
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
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_60%)]" />
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,color-mix(in_oklab,var(--background)_70%,transparent))]" />
    </div>
  );
}
