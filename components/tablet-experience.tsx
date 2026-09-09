"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { AboutSection } from "@/components/about-section";
import { HardLink } from "@/components/hard-link";
import { Alchemists } from "@/components/alchemists";
import { CatalogGrid } from "@/components/catalog-grid";
import { LivingEmerald } from "@/components/living-emerald";
import { ResultOverlay } from "@/components/result-overlay";
import { ShatterSync } from "@/components/shatter-sync";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { artist, formatBpm, formatDuration, getTrackByShareId, tracks } from "@/lib/catalog";
import { getDailyTrack, isDailyTrack } from "@/lib/daily";
import { useBeatClock } from "@/hooks/use-beat-clock";
import { loadAlchemists, type AlchemistEntry } from "@/lib/leaderboard";
import type { ShareResult } from "@/lib/share";

function parseSharedResult(params: URLSearchParams): ShareResult | null {
  const shareId = params.get("track");
  const sigil = params.get("sigil");
  const score = Number(params.get("score"));
  if (!shareId || !sigil || Number.isNaN(score)) return null;
  const track = getTrackByShareId(shareId);
  if (!track) return null;
  return {
    track,
    score,
    accuracy: Number(params.get("accuracy") || 0),
    combo: Number(params.get("combo") || 0),
    shattered: params.get("shatter") === "1",
    sigil,
  };
}

export function TabletExperience() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const daily = useMemo(() => getDailyTrack(), []);
  const selected = getTrackByShareId(searchParams.get("track")) ?? daily;
  const autoStart = searchParams.get("play") === "1";
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [muted, setMuted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [result, setResult] = useState<ShareResult | null>(null);
  const [alchemists, setAlchemists] = useState<AlchemistEntry[]>([]);

  useEffect(() => {
    setAlchemists(loadAlchemists());
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    const shared = parseSharedResult(searchParams);
    if (shared) setResult(shared);
    return () => media.removeEventListener("change", sync);
  }, [searchParams]);

  useBeatClock(selected.bpm, muted, audioEnabled && !reducedMotion);

  return (
    <div className="relative z-10 flex min-h-full flex-col">
      <SiteHeader
        track={selected}
        muted={muted || !audioEnabled}
        onToggleMute={() => {
          setAudioEnabled(true);
          setMuted((value) => (audioEnabled ? !value : false));
        }}
      />

      <main className="flex-1">
        <section id="tablet" className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(16,185,129,0.16),transparent_36%),radial-gradient(circle_at_80%_20%,rgba(212,175,122,0.08),transparent_32%)]" />
          <div className="mx-auto grid max-w-6xl items-center gap-6 px-4 pt-10 pb-16 md:grid-cols-[1.05fr_0.95fr] md:px-6 md:pt-16 md:pb-24">
            <div className="relative mx-auto aspect-square w-full max-w-[560px]">
              <LivingEmerald
                key={selected.id}
                bpm={selected.bpm}
                trackId={selected.id}
                reducedMotion={reducedMotion}
              />
            </div>
            <div>
              <p className="text-xs tracking-[0.34em] text-gold uppercase">The Tablet · Tenderloin · SF</p>
              <h1 className="font-display mt-4 text-5xl leading-[0.95] text-emerald-50 lowercase md:text-7xl">
                emerald tabs
              </h1>
              <p className="mt-5 max-w-md text-base leading-8 text-emerald-50/72">{artist.bio}</p>

              <div
                id="now-playing"
                className="mt-8 rounded-3xl border border-emerald-300/25 bg-black/35 p-4 ring-1 ring-emerald-300/10"
              >
                <p className="text-[10px] tracking-[0.28em] text-emerald-200/50 uppercase">Now on the tablet</p>
                <div className="mt-3 flex items-center gap-3">
                  {selected.coverUrl ? (
                    <Image
                      src={selected.coverUrl}
                      alt=""
                      width={72}
                      height={72}
                      className="size-[72px] rounded-2xl object-cover"
                    />
                  ) : null}
                  <div>
                    <p className="font-display text-2xl text-emerald-50">{selected.title}</p>
                    <p className="text-xs tracking-[0.16em] text-emerald-100/50 uppercase">
                      {formatBpm(selected.bpm)} · {formatDuration(selected.durationMs)}
                      {selected.album ? ` · ${selected.album}` : ""}
                      {isDailyTrack(selected) ? " · daily" : ""}
                    </p>
                  </div>
                </div>
                {selected.description ? (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-emerald-100/55">
                    {selected.description}
                  </p>
                ) : null}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <HardLink
                  href={`/?track=${selected.shareId}&play=1#shatter`}
                  className="inline-flex h-12 items-center rounded-full bg-emerald-400 px-6 text-sm font-medium text-emerald-950 hover:bg-emerald-300"
                >
                  Crack the tablet
                </HardLink>
                <a
                  href={selected.listenUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center rounded-full border border-gold/40 px-6 text-sm font-medium text-gold hover:bg-gold/10"
                >
                  Listen on ElevenMusic
                </a>
                <button
                  type="button"
                  className="inline-flex h-12 items-center px-3 text-sm text-emerald-100/70 hover:text-emerald-50"
                  onClick={() => setAudioEnabled(true)}
                >
                  {audioEnabled ? `Keeping ${selected.bpm} BPM` : "Wake the pulse"}
                </button>
              </div>
              <p className="mt-4 text-xs leading-6 text-emerald-100/40">
                {tracks.length} unique postcards. Today&apos;s challenge is{" "}
                <HardLink href={`/?track=${daily.shareId}#now-playing`} className="text-gold underline-offset-2 hover:underline">
                  {daily.title}
                </HardLink>
                .
              </p>
            </div>
          </div>
        </section>

        <ShatterSync
          track={selected}
          audioEnabled={audioEnabled}
          onEnableAudio={() => setAudioEnabled(true)}
          reducedMotion={reducedMotion}
          daily={isDailyTrack(selected)}
          autoStart={autoStart}
          onResult={setResult}
        />

        <CatalogGrid selectedId={selected.id} />
        <Alchemists entries={alchemists} />
        <AboutSection />
      </main>

      <SiteFooter />

      {result ? (
        <ResultOverlay
          result={result}
          onSaved={setAlchemists}
          onClose={() => {
            setResult(null);
            router.replace("/", { scroll: false });
          }}
        />
      ) : null}
    </div>
  );
}
