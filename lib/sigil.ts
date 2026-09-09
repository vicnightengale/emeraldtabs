import { hashString, mulberry32 } from "@/lib/hash";

export type SigilPayload = {
  seed: string;
  trackTitle: string;
  score: number;
  accuracy: number;
  date: string;
  shattered: boolean;
};

function hex(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export function drawSigil(
  canvas: HTMLCanvasElement,
  payload: SigilPayload,
  size = 1080,
) {
  const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const rng = mulberry32(hashString(payload.seed));
  const cx = size / 2;
  const cy = size / 2;

  const bg = ctx.createRadialGradient(cx, cy, size * 0.08, cx, cy, size * 0.7);
  bg.addColorStop(0, "#0d2a22");
  bg.addColorStop(0.45, "#071410");
  bg.addColorStop(1, "#030303");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  ctx.save();
  ctx.strokeStyle = "rgba(212, 175, 122, 0.18)";
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 8; i += 1) {
    ctx.beginPath();
    ctx.arc(cx, cy, size * (0.16 + i * 0.045), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = "rgba(16, 185, 129, 0.55)";
  ctx.lineWidth = 3;
  hex(ctx, cx, cy, size * 0.36);
  ctx.stroke();
  ctx.strokeStyle = "rgba(212, 175, 122, 0.7)";
  ctx.lineWidth = 1.5;
  hex(ctx, cx, cy, size * 0.4);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rng() * Math.PI);
  ctx.strokeStyle = "rgba(110, 231, 183, 0.8)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    const x = Math.cos(a) * size * 0.28;
    const y = Math.sin(a) * size * 0.28;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const a = (Math.PI / 3) * i - Math.PI / 2 + Math.PI / 6;
    const x = Math.cos(a) * size * 0.28;
    const y = Math.sin(a) * size * 0.28;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  const spokes = 8 + Math.floor(rng() * 8);
  ctx.save();
  ctx.strokeStyle = "rgba(212, 175, 122, 0.45)";
  ctx.lineWidth = 1.4;
  for (let i = 0; i < spokes; i += 1) {
    const a = (Math.PI * 2 * i) / spokes + rng() * 0.08;
    const inner = size * (0.08 + rng() * 0.04);
    const outer = size * (0.3 + rng() * 0.08);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
    ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
    ctx.stroke();
  }
  ctx.restore();

  const marks = 10 + Math.floor(rng() * 8);
  ctx.save();
  ctx.fillStyle = "rgba(167, 243, 208, 0.85)";
  for (let i = 0; i < marks; i += 1) {
    const a = rng() * Math.PI * 2;
    const r = size * (0.18 + rng() * 0.2);
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    ctx.fillRect(-1.5, -8, 3, 16);
    ctx.restore();
  }
  ctx.restore();

  const gem = ctx.createRadialGradient(cx - 18, cy - 22, 8, cx, cy, size * 0.1);
  gem.addColorStop(0, "#6ee7b7");
  gem.addColorStop(0.45, "#10b981");
  gem.addColorStop(1, "#064e3b");
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.07, 0, Math.PI * 2);
  ctx.fillStyle = gem;
  ctx.fill();
  ctx.strokeStyle = "rgba(253, 230, 138, 0.7)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "rgba(236, 253, 245, 0.92)";
  ctx.textAlign = "center";
  ctx.font = "600 28px 'Cinzel', serif";
  ctx.fillText("emerald tabs", cx, size * 0.12);
  ctx.fillStyle = "rgba(212, 175, 122, 0.9)";
  ctx.font = "500 20px 'Outfit', sans-serif";
  ctx.fillText(payload.date, cx, size * 0.155);

  ctx.fillStyle = "#ecfdf5";
  ctx.font = "600 36px 'Cinzel', serif";
  ctx.fillText(payload.trackTitle, cx, size * 0.86);
  ctx.fillStyle = payload.shattered ? "#fbbf24" : "#6ee7b7";
  ctx.font = "500 26px 'Outfit', sans-serif";
  const rank = payload.shattered ? "TABLET SHATTERED" : "THE TABLET HELD";
  ctx.fillText(
    `${rank}  ·  ${payload.score}  ·  ${Math.round(payload.accuracy * 100)}%`,
    cx,
    size * 0.905,
  );
}

export function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("Could not export sigil"));
      else resolve(blob);
    }, "image/png");
  });
}
