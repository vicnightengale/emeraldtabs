import { hashString, mulberry32 } from "@/lib/hash";

export const GAME_DURATION_MS = 30_000;
export const FACET_COUNT = 6;
export const PERFECT_WINDOW_MS = 55;
export const GOOD_WINDOW_MS = 120;

export type ChartNote = {
  id: number;
  timeMs: number;
  facet: number;
};

export function generateChart(trackId: string, bpm: number): ChartNote[] {
  const rng = mulberry32(hashString(`shatter:${trackId}:${bpm}`));
  const beatMs = 60_000 / Math.max(bpm, 60);
  const approxNotes = GAME_DURATION_MS / beatMs;

  let stepBeats = 1;
  if (approxNotes > 58) stepBeats = 2;
  else if (approxNotes < 30) stepBeats = 0.5;

  const stepMs = beatMs * stepBeats;
  const countInMs = beatMs * 4;
  const notes: ChartNote[] = [];
  let t = countInMs;
  let lastFacet = -1;
  let id = 0;

  while (t < GAME_DURATION_MS - 350) {
    if (notes.length > 3 && rng() < 0.1) {
      t += stepMs;
      continue;
    }

    let facet = Math.floor(rng() * FACET_COUNT);
    if (facet === lastFacet) {
      facet = (facet + 1 + Math.floor(rng() * (FACET_COUNT - 1))) % FACET_COUNT;
    }

    notes.push({ id, timeMs: t, facet });
    lastFacet = facet;
    id += 1;
    t += stepMs;
  }

  return notes;
}

export function judgeHit(deltaMs: number) {
  const abs = Math.abs(deltaMs);
  if (abs <= PERFECT_WINDOW_MS) return "perfect" as const;
  if (abs <= GOOD_WINDOW_MS) return "good" as const;
  return "miss" as const;
}
