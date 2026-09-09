import { mkdir, writeFile } from "node:fs/promises";

const ARTIST_ID = "6a639b7d6c94d11b17259208";
const TRACKS_URL = `https://api.elevenmusic.io/v1/tracks?artist_id=${ARTIST_ID}&limit=100`;

const artist = {
  id: ARTIST_ID,
  stageName: "emerald tabs",
  slug: "emerald-tabs-z2I-l1",
  bio: "lo-fi postcards from the Tenderloin. tape-warm beats, golden-hour chords, and stories from the last shift. new tracks weekly - every play of 30 seconds or more counts, so press play and let it ride.",
  avatarUrl: "https://cdn.elevenmusic.io/artists/6a639b7d6c94d11b17259208/avatar_9403d084.webp",
  profileUrl: "https://elevenmusic.io/artist/6a639b7d6c94d11b17259208",
  artistsUrl: "https://elevenmusic.io/artists/emerald-tabs-z2I-l1",
  album: "Tenderloin Lemonaide",
  siteUrl: "https://emeraldtabs.com",
};

const response = await fetch(TRACKS_URL);
if (!response.ok) {
  throw new Error(`Tracks API failed: ${response.status}`);
}

const payload = await response.json();
const published = (payload.data ?? []).filter((track) => track.state === "published");
const byTitle = new Map();

for (const track of published) {
  const key = String(track.title ?? "").trim().toLowerCase();
  const score = (track.album ? 100 : 0) + (track.engagement_count || 0) * 10 + (track.heart_count || 0) * 5;
  const current = byTitle.get(key);
  if (!current || score > current.score || (score === current.score && track.updated_at > current.track.updated_at)) {
    byTitle.set(key, { track, score });
  }
}

const tracks = [...byTitle.values()]
  .map(({ track }) => ({
    id: track.id,
    shareId: track.share_id,
    title: track.title,
    bpm: track.bpm,
    durationMs: track.duration_ms,
    genres: track.genres ?? [],
    coverUrl: track.cover?.static?.url ?? "",
    description: track.description ?? "",
    album: track.album?.title ?? null,
    listenUrl: `https://elevenmusic.io/track/${track.share_id}`,
    createdAt: track.created_at,
  }))
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  .map(({ createdAt, ...track }) => track);

await mkdir(new URL("../data/", import.meta.url), { recursive: true });
await writeFile(
  new URL("../data/catalog.json", import.meta.url),
  `${JSON.stringify({ artist, fetchedAt: new Date().toISOString(), tracks }, null, 2)}\n`,
);

console.log(`Wrote ${tracks.length} unique published tracks to data/catalog.json`);
