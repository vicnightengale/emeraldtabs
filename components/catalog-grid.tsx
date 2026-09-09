"use client";

import Image from "next/image";
import { HardLink } from "@/components/hard-link";
import { formatBpm, formatDuration, tracks } from "@/lib/catalog";
import { isDailyTrack } from "@/lib/daily";
import { tabletHref } from "@/lib/routes";
import { cn } from "@/lib/utils";

type CatalogGridProps = {
  selectedId: string;
};

export function CatalogGrid({ selectedId }: CatalogGridProps) {
  if (tracks.length === 0) {
    return (
      <section id="catalog" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 md:px-6">
        <h2 className="font-display text-3xl text-emerald-50">Postcards</h2>
        <p className="mt-4 text-emerald-100/60">The shelf is empty. Check back after the next shift.</p>
      </section>
    );
  }

  return (
    <section id="catalog" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 md:px-6">
      <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs tracking-[0.32em] text-gold uppercase">Tenderloin Lemonaide</p>
          <h2 className="font-display mt-2 text-4xl text-emerald-50">Postcards from the last shift</h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-emerald-100/55">
          Tap a card to set the living emerald. Full listens open on ElevenMusic — the crystal
          here only keeps the BPM.
        </p>
      </div>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tracks.map((track) => {
          const active = track.id === selectedId;
          const daily = isDailyTrack(track);
          const href = tabletHref(track, { hash: "now-playing" });
          return (
            <li key={track.id}>
              <article
                className={cn(
                  "group overflow-hidden rounded-[1.4rem] border bg-[#070d0b] shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition",
                  active ? "border-emerald-300/50 ring-1 ring-emerald-300/30" : "border-emerald-300/10 hover:border-gold/30",
                )}
              >
                <HardLink href={href} className="relative block w-full overflow-hidden text-left">
                  <div className="relative aspect-square">
                    {track.coverUrl ? (
                      <Image
                        src={track.coverUrl}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-emerald-950 text-emerald-200/40">
                        no cover
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />
                    <div className="absolute right-3 bottom-3 left-3">
                      <p className="font-display text-xl text-white">{track.title}</p>
                      <p className="mt-1 text-[11px] tracking-[0.16em] text-emerald-100/80 uppercase">
                        {formatBpm(track.bpm)} · {formatDuration(track.durationMs)}
                      </p>
                    </div>
                    {daily ? (
                      <span className="absolute top-3 left-3 rounded-full border border-gold/50 bg-black/50 px-2 py-1 text-[10px] tracking-[0.2em] text-gold uppercase">
                        Today&apos;s tablet
                      </span>
                    ) : null}
                    {active ? (
                      <span className="absolute top-3 right-3 rounded-full bg-emerald-400 px-2 py-1 text-[10px] tracking-[0.18em] text-emerald-950 uppercase">
                        Now
                      </span>
                    ) : null}
                  </div>
                </HardLink>
                <div className="space-y-3 px-4 py-4">
                  <p className="line-clamp-3 text-xs leading-5 text-emerald-100/55">
                    {track.description || "A postcard without a caption — press play and let it ride."}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(track.genres.length ? track.genres : ["unlabeled"]).map((genre) => (
                      <span
                        key={genre}
                        className="rounded-full border border-emerald-300/15 px-2 py-0.5 text-[10px] tracking-[0.14em] text-emerald-100/50 uppercase"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <HardLink
                      id={`set-crystal-${track.shareId}`}
                      href={href}
                      className="rounded-full bg-emerald-400/15 px-3 py-2 text-xs tracking-[0.14em] text-emerald-50 uppercase hover:bg-emerald-400/25"
                    >
                      Set crystal
                    </HardLink>
                    <a
                      href={track.listenUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-gold/35 px-3 py-2 text-xs tracking-[0.14em] text-gold uppercase hover:bg-gold/10"
                    >
                      Listen
                    </a>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
