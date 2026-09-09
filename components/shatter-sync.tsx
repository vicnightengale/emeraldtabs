"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LivingEmerald } from "@/components/living-emerald";
import { formatBpm, type CatalogTrack } from "@/lib/catalog";
import {
  FACET_COUNT,
  GAME_DURATION_MS,
  GOOD_WINDOW_MS,
  generateChart,
  judgeHit,
  type ChartNote,
} from "@/lib/chart";
import { toSigilSeed, utcDateKey } from "@/lib/hash";
import type { ShareResult } from "@/lib/share";
import { cn } from "@/lib/utils";

type Judgement = "perfect" | "good" | "miss";

type LiveStats = {
  score: number;
  combo: number;
  maxCombo: number;
  perfect: number;
  good: number;
  miss: number;
};

const emptyStats: LiveStats = {
  score: 0,
  combo: 0,
  maxCombo: 0,
  perfect: 0,
  good: 0,
  miss: 0,
};

type ShatterSyncProps = {
  track: CatalogTrack;
  audioEnabled: boolean;
  onEnableAudio: () => void;
  reducedMotion: boolean;
  onResult: (result: ShareResult) => void;
  daily: boolean;
  autoStart?: boolean;
};

export function ShatterSync({
  track,
  audioEnabled,
  onEnableAudio,
  reducedMotion,
  onResult,
  daily,
  autoStart = false,
}: ShatterSyncProps) {
  const [running, setRunning] = useState(false);
  const [countdown, setCountdown] = useState<string | null>(null);
  const [stats, setStats] = useState<LiveStats>(emptyStats);
  const [judgement, setJudgement] = useState<Judgement | null>(null);
  const [shatterProgress, setShatterProgress] = useState(0);
  const [remaining, setRemaining] = useState(GAME_DURATION_MS);
  const [glowing, setGlowing] = useState<number[]>([]);
  const startRef = useRef(0);
  const notesRef = useRef<ChartNote[]>([]);
  const hitRef = useRef<Set<number>>(new Set());
  const statsRef = useRef<LiveStats>(emptyStats);
  const rafRef = useRef(0);
  const endedRef = useRef(false);
  const lastRemainRef = useRef(GAME_DURATION_MS);
  const timersRef = useRef<number[]>([]);
  const launchedRef = useRef(false);
  const consumedPlay = useRef(false);

  const chart = useMemo(() => generateChart(track.id, track.bpm), [track.id, track.bpm]);

  const finish = useCallback(
    (finalStats: LiveStats) => {
      if (endedRef.current) return;
      endedRef.current = true;
      launchedRef.current = false;
      setRunning(false);
      const judged = finalStats.perfect + finalStats.good + finalStats.miss;
      const accuracy = judged === 0 ? 0 : (finalStats.perfect + finalStats.good * 0.65) / judged;
      const shattered = accuracy >= 0.8 || finalStats.maxCombo >= 12;
      if (shattered) {
        const origin = performance.now();
        const tick = () => {
          const p = Math.min(1, (performance.now() - origin) / 900);
          setShatterProgress(p);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
      const result: ShareResult = {
        track,
        score: finalStats.score,
        accuracy,
        combo: finalStats.maxCombo,
        shattered,
        sigil: toSigilSeed([track.id, finalStats.score, utcDateKey(), accuracy.toFixed(3)]),
      };
      window.setTimeout(() => onResult(result), shattered ? 980 : 240);
    },
    [onResult, track],
  );

  const missNote = useCallback((note: ChartNote) => {
    if (hitRef.current.has(note.id)) return;
    hitRef.current.add(note.id);
    const next = {
      ...statsRef.current,
      miss: statsRef.current.miss + 1,
      combo: 0,
    };
    statsRef.current = next;
    setStats(next);
    setJudgement("miss");
  }, []);

  useEffect(() => {
    if (!running) return;
    const loop = () => {
      const elapsed = performance.now() - startRef.current;
      const left = Math.max(0, GAME_DURATION_MS - elapsed);
      if (Math.abs(left - lastRemainRef.current) > 80) {
        lastRemainRef.current = left;
        setRemaining(left);
      }
      const nextGlow = notesRef.current
        .filter((note) => !hitRef.current.has(note.id) && Math.abs(note.timeMs - elapsed) < 160)
        .map((note) => note.facet);
      setGlowing((prev) => (prev.join() === nextGlow.join() ? prev : nextGlow));
      for (const note of notesRef.current) {
        if (!hitRef.current.has(note.id) && elapsed - note.timeMs > GOOD_WINDOW_MS) {
          missNote(note);
        }
      }
      if (elapsed >= GAME_DURATION_MS) {
        finish(statsRef.current);
        return;
      }
      rafRef.current = window.requestAnimationFrame(loop);
    };
    rafRef.current = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(rafRef.current);
  }, [finish, missNote, running]);

  const tapFacet = useCallback(
    (facet: number) => {
      if (!running) return;
      const elapsed = performance.now() - startRef.current;
      const candidate = notesRef.current
        .filter((note) => !hitRef.current.has(note.id) && note.facet === facet)
        .sort((a, b) => Math.abs(a.timeMs - elapsed) - Math.abs(b.timeMs - elapsed))[0];

      if (!candidate || Math.abs(candidate.timeMs - elapsed) > GOOD_WINDOW_MS + 40) {
        const next = { ...statsRef.current, miss: statsRef.current.miss + 1, combo: 0 };
        statsRef.current = next;
        setStats(next);
        setJudgement("miss");
        return;
      }

      const verdict = judgeHit(elapsed - candidate.timeMs);
      hitRef.current.add(candidate.id);
      if (verdict === "miss") {
        missNote(candidate);
        return;
      }

      const combo = statsRef.current.combo + 1;
      const add = verdict === "perfect" ? 100 : 60;
      const next: LiveStats = {
        ...statsRef.current,
        [verdict]: statsRef.current[verdict] + 1,
        combo,
        maxCombo: Math.max(statsRef.current.maxCombo, combo),
        score: statsRef.current.score + add + combo * 4,
      };
      statsRef.current = next;
      setStats(next);
      setJudgement(verdict);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(verdict === "perfect" ? 12 : 8);
      }
    },
    [missNote, running],
  );

  const startRun = useCallback(() => {
    if (launchedRef.current) return;
    launchedRef.current = true;
    onEnableAudio();
    endedRef.current = false;
    notesRef.current = chart;
    hitRef.current = new Set();
    statsRef.current = emptyStats;
    setStats(emptyStats);
    setJudgement(null);
    setShatterProgress(0);
    lastRemainRef.current = GAME_DURATION_MS;
    setRemaining(GAME_DURATION_MS);

    const beatMs = 60_000 / track.bpm;
    setCountdown("3");
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [
      window.setTimeout(() => setCountdown("2"), beatMs),
      window.setTimeout(() => setCountdown("1"), beatMs * 2),
      window.setTimeout(() => setCountdown("SYNC"), beatMs * 3),
      window.setTimeout(() => {
        setCountdown(null);
        startRef.current = performance.now();
        setRunning(true);
      }, beatMs * 4),
    ];
  }, [chart, onEnableAudio, track.bpm]);

  useEffect(() => {
    if (!autoStart || consumedPlay.current) return;
    consumedPlay.current = true;
    startRun();
  }, [autoStart, startRun]);

  useEffect(() => () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!running) return;
      const map: Record<string, number> = {
        "1": 0,
        "2": 1,
        "3": 2,
        "4": 3,
        "5": 4,
        "6": 5,
      };
      if (event.key in map) {
        event.preventDefault();
        tapFacet(map[event.key]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, tapFacet]);

  const judged = stats.perfect + stats.good + stats.miss;
  const accuracy = judged ? Math.round(((stats.perfect + stats.good * 0.65) / judged) * 100) : 100;

  return (
    <section
      id="shatter"
      className="relative scroll-mt-24 border-y border-emerald-400/10 bg-[linear-gradient(180deg,rgba(16,185,129,0.05),transparent_28%,transparent_72%,rgba(212,175,122,0.04))]"
    >
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-[1.05fr_0.95fr] md:px-6 md:py-24">
        <div className="relative mx-auto aspect-square w-full max-w-[520px] overflow-hidden rounded-[2rem] border border-emerald-300/15 bg-black/40 shadow-[0_0_80px_rgba(16,185,129,0.08)]">
          <LivingEmerald
            bpm={track.bpm}
            trackId={track.id}
            glowingFacets={glowing}
            shatterProgress={shatterProgress}
            interactive
            idleGlow={!running}
            reducedMotion={reducedMotion}
            onFacetTap={tapFacet}
          />
          {countdown ? (
            <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/25">
              <p className="font-display text-6xl tracking-[0.3em] text-gold uppercase">{countdown}</p>
            </div>
          ) : null}
          {judgement ? (
            <p
              className={cn(
                "pointer-events-none absolute top-6 left-1/2 -translate-x-1/2 font-display text-2xl tracking-[0.22em] uppercase",
                judgement === "perfect" && "text-gold",
                judgement === "good" && "text-emerald-200",
                judgement === "miss" && "text-rose-300/80",
              )}
            >
              {judgement}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-xs tracking-[0.32em] text-gold uppercase">
            {daily ? "Daily tablet · UTC" : "Viral rite"}
          </p>
          <h2 className="font-display mt-3 text-4xl text-emerald-50 md:text-5xl">Shatter Sync</h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-emerald-100/70 md:text-base">
            Facets flare on the beat of <span className="text-emerald-50">{track.title}</span>{" "}
            ({formatBpm(track.bpm)}). Tap the glowing face in time. A strong run — 80% or a
            twelve-hit streak — cracks the tablet and stamps your sigil.
          </p>

          <dl className="mt-8 grid grid-cols-3 gap-3 text-center">
            <Stat label="Score" value={String(stats.score)} />
            <Stat label="Combo" value={`${stats.combo}×`} />
            <Stat label="Accuracy" value={`${accuracy}%`} />
          </dl>

          <div className="mt-4 h-1 overflow-hidden rounded-full bg-emerald-950">
            <div
              className="h-full bg-linear-to-r from-emerald-400 to-gold transition-[width] duration-100"
              style={{ width: `${Math.max(0, (remaining / GAME_DURATION_MS) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs tracking-[0.18em] text-emerald-200/50 uppercase">
            {running ? `${(remaining / 1000).toFixed(1)}s remaining` : "Thirty seconds on the tablet"}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              id="start-shatter"
              href={`/?track=${track.shareId}&play=1#shatter`}
              className={`inline-flex h-12 items-center rounded-full bg-emerald-400 px-6 text-sm font-medium text-emerald-950 hover:bg-emerald-300 ${running || countdown ? "pointer-events-none opacity-50" : ""}`}
              onClick={(event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey) return;
                event.preventDefault();
                startRun();
              }}
            >
              {running || countdown ? "In motion" : "Crack the tablet"}
            </a>
            <a
              href={track.listenUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center rounded-full border border-gold/40 px-6 text-sm font-medium text-gold hover:bg-gold/10"
            >
              Listen on ElevenMusic
            </a>
          </div>
          <p className="mt-4 text-xs leading-6 text-emerald-100/45">
            No stream from ElevenMusic here — the crystal keeps time from BPM
            {audioEnabled ? " with a soft lo-fi bed." : ". Tap to wake the click if you want it."}{" "}
            Keys 1–6 map to the six facets.
          </p>
          <p className="sr-only">
            {FACET_COUNT} facets. Perfect window fifty-five milliseconds. Good window one hundred
            twenty milliseconds.
          </p>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-emerald-300/10 bg-emerald-950/40 px-3 py-4">
      <dt className="text-[10px] tracking-[0.22em] text-emerald-200/50 uppercase">{label}</dt>
      <dd className="font-display mt-1 text-2xl text-emerald-50">{value}</dd>
    </div>
  );
}
