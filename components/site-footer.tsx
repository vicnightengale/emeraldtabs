import { artist } from "@/lib/catalog";

export function SiteFooter() {
  return (
    <footer className="border-t border-emerald-300/10 bg-black/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-emerald-100/50 md:flex-row md:items-end md:justify-between md:px-6">
        <div>
          <p className="font-display text-xl tracking-[0.16em] text-emerald-50 lowercase">
            emerald tabs
          </p>
          <p className="mt-2 max-w-sm text-xs leading-6">
            The Tablet keeps time. Full listens live on ElevenMusic — every play of 30 seconds
            or more counts. Album: {artist.album}.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs tracking-[0.18em] uppercase">
          <a className="hover:text-gold" href={artist.profileUrl} target="_blank" rel="noreferrer">
            Profile
          </a>
          <a className="hover:text-gold" href={artist.artistsUrl} target="_blank" rel="noreferrer">
            Artists
          </a>
          <a className="hover:text-gold" href="https://elevenmusic.io" target="_blank" rel="noreferrer">
            ElevenMusic
          </a>
          <a className="hover:text-gold" href="#shatter">
            Shatter Sync
          </a>
        </div>
      </div>
    </footer>
  );
}
