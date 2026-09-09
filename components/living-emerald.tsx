"use client";

import { useEffect, useRef } from "react";
import { FACET_COUNT } from "@/lib/chart";
import { hashString } from "@/lib/hash";
import { cn } from "@/lib/utils";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
};

type LivingEmeraldProps = {
  bpm: number;
  trackId?: string;
  pulse?: number;
  activeFacet?: number | null;
  glowingFacets?: number[];
  shatterProgress?: number;
  interactive?: boolean;
  idleGlow?: boolean;
  reducedMotion?: boolean;
  className?: string;
  onFacetTap?: (facet: number, clientX: number, clientY: number) => void;
};

function hexPoint(cx: number, cy: number, radius: number, index: number) {
  const angle = (Math.PI / 3) * index - Math.PI / 2;
  return {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius,
  };
}

function pointInTriangle(
  px: number,
  py: number,
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number },
) {
  const area = (p1: { x: number; y: number }, p2: { x: number; y: number }, p3: { x: number; y: number }) =>
    (p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2;
  const full = Math.abs(area(a, b, c));
  const sum =
    Math.abs(area({ x: px, y: py }, b, c)) +
    Math.abs(area(a, { x: px, y: py }, c)) +
    Math.abs(area(a, b, { x: px, y: py }));
  return Math.abs(full - sum) < 1.2;
}

export function LivingEmerald({
  bpm,
  trackId,
  pulse,
  activeFacet = null,
  glowingFacets = [],
  shatterProgress = 0,
  interactive = false,
  idleGlow = true,
  reducedMotion = false,
  className,
  onFacetTap,
}: LivingEmeraldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef(pulse);
  const glowRef = useRef(glowingFacets);
  const activeRef = useRef(activeFacet);
  const shatterRef = useRef(shatterProgress);
  const bpmRef = useRef(bpm);
  const hueRef = useRef(trackId ? hashString(trackId) % 36 : 12);
  const tapRef = useRef(onFacetTap);
  const reducedRef = useRef(reducedMotion);
  const idleRef = useRef(idleGlow);
  const particles = useRef<Particle[]>([]);

  pulseRef.current = pulse;
  glowRef.current = glowingFacets;
  activeRef.current = activeFacet;
  shatterRef.current = shatterProgress;
  bpmRef.current = bpm;
  hueRef.current = trackId ? hashString(trackId) % 36 : 12;
  tapRef.current = onFacetTap;
  reducedRef.current = reducedMotion;
  idleRef.current = idleGlow;

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let running = true;
    const time0 = performance.now();

    const measure = () => {
      const rect = wrap.getBoundingClientRect();
      return {
        w: Math.max(rect.width, wrap.clientWidth, 320),
        h: Math.max(rect.height, wrap.clientHeight, 320),
      };
    };

    const resize = () => {
      const { w, h } = measure();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      if (!running) return;
      const { w, h } = measure();
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h * 0.5;
      const beatSec = 60 / Math.max(bpmRef.current, 40);
      const phase = ((now / 1000) % beatSec) / beatSec;
      const computed = Math.pow(1 - phase, 2.6);
      const pulseAmt = reducedRef.current ? 0.12 : (pulseRef.current ?? computed);
      const radius = Math.min(w, h) * (0.38 + pulseAmt * 0.03);
      const t = (now - time0) / 1000;
      const shatter = shatterRef.current;
      const hueShift = hueRef.current;

      const vignette = ctx.createRadialGradient(cx, cy, radius * 0.15, cx, cy, Math.max(w, h) * 0.55);
      vignette.addColorStop(0, `hsla(${150 + hueShift}, 70%, 28%, 0.42)`);
      vignette.addColorStop(0.55, "rgba(6, 20, 16, 0.12)");
      vignette.addColorStop(1, "rgba(3, 3, 3, 0)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.translate(cx, cy + radius * 0.78);
      ctx.scale(1, 0.28);
      const shadow = ctx.createRadialGradient(0, 0, 4, 0, 0, radius * 1.2);
      shadow.addColorStop(0, "rgba(16, 185, 129, 0.4)");
      shadow.addColorStop(1, "rgba(16, 185, 129, 0)");
      ctx.fillStyle = shadow;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const settingR = radius * 1.14;
      ctx.beginPath();
      for (let i = 0; i < 6; i += 1) {
        const p = hexPoint(cx, cy, settingR, i);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(212, 175, 122, ${0.7 + pulseAmt * 0.28})`;
      ctx.lineWidth = 3;
      ctx.stroke();

      for (let i = 0; i < FACET_COUNT; i += 1) {
        const a = hexPoint(cx, cy, radius, i);
        const b = hexPoint(cx, cy, radius, i + 1);
        const outward = ((i + 0.5) * Math.PI) / 3 - Math.PI / 2;
        const drift = shatter * (42 + i * 10);
        const rot = shatter * (0.4 + i * 0.12);
        const ox = Math.cos(outward) * drift;
        const oy = Math.sin(outward) * drift + shatter * 16;

        ctx.save();
        ctx.translate(cx + ox, cy + oy);
        ctx.rotate(rot);
        ctx.translate(-cx, -cy);

        const lite = 0.35 + ((i + 2) % 3) * 0.14 + pulseAmt * 0.28;
        const idleFacet = Math.floor((now / (beatSec * 1000)) % FACET_COUNT);
        const isGlow =
          glowRef.current.includes(i) ||
          activeRef.current === i ||
          (idleRef.current && glowRef.current.length === 0 && i === idleFacet);
        const g = 110 + i * 14 + hueShift;
        const fill = isGlow
          ? `rgba(${150 + Math.round(pulseAmt * 70)}, 250, ${200 + Math.round(pulseAmt * 30)}, 0.96)`
          : `rgba(${12 + i * 8}, ${g}, ${78 + i * 10}, ${Math.min(1, 0.88 + lite * 0.2)})`;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = isGlow ? "rgba(253, 230, 138, 0.95)" : "rgba(190, 242, 216, 0.45)";
        ctx.lineWidth = isGlow ? 2.6 : 1.2;
        ctx.stroke();

        const mx = (cx + a.x + b.x) / 3;
        const my = (cy + a.y + b.y) / 3;
        const glint = ctx.createRadialGradient(mx, my, 2, mx, my, radius * 0.3);
        glint.addColorStop(0, `rgba(236, 253, 245, ${0.28 + pulseAmt * 0.3})`);
        glint.addColorStop(1, "rgba(236, 253, 245, 0)");
        ctx.fillStyle = glint;
        ctx.fill();
        ctx.restore();
      }

      const tableR = radius * (0.36 + pulseAmt * 0.04);
      const table = ctx.createRadialGradient(cx - tableR * 0.25, cy - tableR * 0.3, 4, cx, cy, tableR);
      table.addColorStop(0, "rgba(209, 250, 229, 0.98)");
      table.addColorStop(0.4, "rgba(52, 211, 153, 0.95)");
      table.addColorStop(1, "rgba(6, 78, 59, 0.98)");
      ctx.beginPath();
      for (let i = 0; i < 6; i += 1) {
        const p = hexPoint(cx, cy, tableR, i);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.fillStyle = table;
      ctx.globalAlpha = 1 - shatter * 0.7;
      ctx.fill();
      ctx.strokeStyle = "rgba(253, 224, 71, 0.65)";
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.globalAlpha = 1;

      ctx.save();
      ctx.translate(cx - tableR * 0.2, cy - tableR * 0.35);
      ctx.rotate(-0.6);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.28 + pulseAmt * 0.25})`;
      ctx.fillRect(-tableR * 0.08, -2, tableR * 0.55, 3);
      ctx.restore();

      if (!reducedRef.current) {
        if (particles.current.length < 28 && Math.random() < 0.22) {
          particles.current.push({
            x: cx + (Math.random() - 0.5) * radius * 2.2,
            y: cy + (Math.random() - 0.5) * radius * 2.2,
            vx: (Math.random() - 0.5) * 0.18,
            vy: -0.08 - Math.random() * 0.12,
            life: 1,
            size: 0.8 + Math.random() * 1.6,
          });
        }
        ctx.fillStyle = "rgba(212, 175, 122, 0.65)";
        particles.current = particles.current.filter((p) => p.life > 0);
        for (const p of particles.current) {
          p.x += p.vx;
          p.y += p.vy + Math.sin(t + p.x) * 0.03;
          p.life -= 0.006;
          ctx.globalAlpha = p.life * 0.7;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      raf = window.requestAnimationFrame(draw);
    };

    const onPointer = (event: PointerEvent) => {
      if (!tapRef.current) return;
      const bounds = canvas.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const cx = bounds.width / 2;
      const cy = bounds.height * 0.5;
      const radius = Math.min(bounds.width, bounds.height) * 0.38;
      for (let i = 0; i < FACET_COUNT; i += 1) {
        const a = hexPoint(cx, cy, radius, i);
        const b = hexPoint(cx, cy, radius, i + 1);
        if (pointInTriangle(x, y, { x: cx, y: cy }, a, b)) {
          tapRef.current(i, event.clientX, event.clientY);
          return;
        }
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    canvas.addEventListener("pointerdown", onPointer);
    raf = window.requestAnimationFrame(draw);

    return () => {
      running = false;
      window.cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  return (
    <div ref={wrapRef} className={cn("relative h-full min-h-[280px] w-full", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[12%] bg-linear-to-br from-emerald-300 via-emerald-600 to-emerald-950 opacity-80 blur-[0.5px]"
        style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
      />
      <canvas
        ref={canvasRef}
        className="relative z-10 h-full w-full touch-none"
        role={interactive ? "application" : "img"}
        aria-label={
          interactive ? "Shatter Sync tablet. Tap a glowing facet on the beat." : "Living emerald tablet"
        }
      />
      {interactive
        ? Array.from({ length: FACET_COUNT }, (_, index) => {
            const angle = (Math.PI / 3) * index - Math.PI / 2;
            const lit = glowingFacets.includes(index);
            return (
              <button
                key={index}
                type="button"
                aria-label={`Facet ${index + 1}`}
                className={cn(
                  "absolute z-20 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-100/10 md:size-[4.5rem]",
                  lit ? "bg-emerald-200/25 ring-2 ring-gold" : "bg-transparent",
                )}
                style={{
                  left: `${50 + Math.cos(angle) * 28}%`,
                  top: `${50 + Math.sin(angle) * 28}%`,
                }}
                onClick={(event) => onFacetTap?.(index, event.clientX, event.clientY)}
              />
            );
          })
        : null}
    </div>
  );
}
