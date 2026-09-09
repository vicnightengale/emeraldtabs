#!/usr/bin/env node

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ARTIST_ID = "6a639b7d6c94d11b17259208";
const ARTIST_URL = `https://api.elevenmusic.io/v1/artists/${ARTIST_ID}`;
const TRACKS_URL = `https://api.elevenmusic.io/v1/tracks?artist_id=${ARTIST_ID}&limit=100`;

function scoreTrack(track) {
  const album = track.album_title ? 4 : 0;
  const plays = Math.log10((track.play_count ?? 0) + 1);
  const likes = Math.log10((track.like_count ?? 0) + 1);
  const duration = track.duration_ms >= 60_000 ? 1 : 0;
  return album + plays + likes + duration;
}

function pickCanonical(tracks) {
  const byTitle = new Map();
  for (const track of tracks) {
    const key = String(track.title ?? "untitled").trim().toLowerCase();
    const existing = byTitle.get(key);
    if (!existing || scoreTrack(track) > scoreTrack(existing)) {
      byTitle.set(key, track);
    }
  }
  return [...byTitle.values()].sort((a, b) => {
    const albumCmp = String(a.album_title ?? "ø").localeCompare(String(b.album_title ?? "ø"));
    if (albumCmp !== 0) return albumCmp;
    return String(a.title).localeCompare(String(b.title));
  });
}

function normalize(artist, track) {
  return {
    id: track.id,
    shareId: track.share_id,
    title: track.title,
    albumTitle: track.album_title ?? null,
    durationMs: track.duration_ms,
    bpm: track.bpm,
    coverUrl: track.cover_url ?? null,
    playCount: track.play_count ?? 0,
    likeCount: track.like_count ?? 0,
    listenUrl: `https://elevenmusic.io/track/${track.share_id}`,
  };
}

const [artistRes, tracksRes] = await Promise.all([fetch(ARTIST_URL), fetch(TRACKS_URL)]);

if (!artistRes.ok) {
  throw new Error(`Artist request failed: ${artistRes.status} ${await artistRes.text()}`);
}
if (!tracksRes.ok) {
  throw new Error(`Tracks request failed: ${tracksRes.status} ${await tracksRes.text()}`);
}

const artist = await artistRes.json();
const tracksPayload = await tracksRes.json();
const unique = pickCanonical(tracksPayload.tracks ?? []);

const catalog = {
  fetchedAt: new Date().toISOString(),
  artist: {
    id: artist.id,
    name: artist.name,
    handle: artist.handle,
    bio: artist.bio ?? "",
    avatarUrl: artist.avatar_url ?? null,
    elevenUrl: `https://elevenmusic.io/artist/${artist.handle}`,
  },
  tracks: unique.map((track) => normalize(artist, track)),
};

const out = resolve(process.cwd(), "data/catalog.json");
writeFileSync(out, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Wrote ${catalog.tracks.length} unique tracks to ${out}`);
