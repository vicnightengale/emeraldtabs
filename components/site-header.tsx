"use client";

import Image from "next/image";
import { artist, type CatalogTrack } from "@/lib/catalog";

type SiteHeaderProps = {
  track: CatalogTrack;
  muted: boolean;
  onToggleMute: () => void;
};

const links = [
  { href: "#tablet", label: "Tablet" },
  { href: "#shatter", label: "Shatter Sync" },
  { href: "#catalog", label: "Postcards" },
  { href: "#about", label: "About" },
];

export function SiteHeader({ track, muted, onToggleMute }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-emerald-300/10 bg-[#050807]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <a href="#tablet" className="flex items-center gap-3">
          <Image
            src={artist.avatarUrl}
            alt=""
            width={36}
            height={36}
            className="size-9 rounded-full border border-gold/40 object-cover"
          />
          <span className="font-display text-lg tracking-[0.18em] text-emerald-50 lowercase">
            emerald tabs
          </span>
        </a>
        <nav className="hidden items-center gap-6 text-xs tracking-[0.22em] text-emerald-100/60 uppercase md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-gold">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden px-2 py-1 text-xs text-emerald-100/70 hover:text-emerald-50 sm:inline-flex"
            onClick={onToggleMute}
            aria-pressed={!muted}
          >
            {muted ? "Pulse only" : "Lo-fi bed"}
          </button>
          <a
            href={track.listenUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center rounded-full bg-emerald-400 px-3 text-sm text-emerald-950 hover:bg-emerald-300"
          >
            Listen
          </a>
        </div>
      </div>
      <nav className="flex gap-4 overflow-x-auto border-t border-emerald-300/8 px-4 py-2 text-[11px] tracking-[0.2em] text-emerald-100/55 uppercase md:hidden">
        {links.map((link) => (
          <a key={link.href} href={link.href} className="shrink-0 hover:text-gold">
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
