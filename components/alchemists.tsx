"use client";

import type { AlchemistEntry } from "@/lib/leaderboard";

export function Alchemists({ entries }: { entries: AlchemistEntry[] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-8 md:px-6">
      <div className="rounded-[1.6rem] border border-emerald-300/10 bg-black/30 px-5 py-6 md:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.28em] text-gold uppercase">Local rite</p>
            <h3 className="font-display mt-1 text-2xl text-emerald-50">Alchemists</h3>
          </div>
          <p className="text-xs text-emerald-100/40">Kept on this device</p>
        </div>
        {entries.length === 0 ? (
          <p className="mt-5 text-sm text-emerald-100/50">No alchemists yet. Crack the tablet.</p>
        ) : (
          <ol className="mt-5 divide-y divide-emerald-300/10">
            {entries.map((entry, index) => (
              <li key={entry.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-gold">{index + 1}</span>
                  <div>
                    <p className="text-emerald-50">
                      {entry.initials}{" "}
                      <span className="text-emerald-100/45">· {entry.trackTitle}</span>
                    </p>
                    <p className="text-xs text-emerald-100/35">
                      {entry.date}
                      {entry.shattered ? " · shattered" : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-emerald-50">{entry.score}</p>
                  <p className="text-xs text-emerald-100/40">{Math.round(entry.accuracy * 100)}%</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
