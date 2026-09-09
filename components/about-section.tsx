import Image from "next/image";
import { artist, tracks } from "@/lib/catalog";

export function AboutSection() {
  return (
    <section id="about" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 md:px-6">
      <div className="grid items-center gap-10 rounded-[2rem] border border-emerald-300/10 bg-[#070d0b] p-6 md:grid-cols-[0.8fr_1.2fr] md:p-10">
        <Image
          src={artist.avatarUrl}
          alt="emerald tabs"
          width={520}
          height={520}
          className="aspect-square w-full rounded-[1.4rem] object-cover"
        />
        <div>
          <p className="text-xs tracking-[0.32em] text-gold uppercase">From the last shift</p>
          <h2 className="font-display mt-3 text-4xl text-emerald-50">About emerald tabs</h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-emerald-50/75">{artist.bio}</p>
          <p className="mt-5 max-w-xl text-sm leading-7 text-emerald-100/50">
            {tracks.length} published postcards, often filed under {artist.album}. The Tablet is
            the public face — a jewel-toned listening room and a thirty-second rite. The songs
            themselves live on ElevenMusic, where a play of thirty seconds or more is the one
            that counts.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <a
              href={artist.profileUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-emerald-400 px-4 py-2 text-emerald-950"
            >
              ElevenMusic profile
            </a>
            <a
              href={artist.artistsUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-gold/40 px-4 py-2 text-gold"
            >
              Artist page
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
