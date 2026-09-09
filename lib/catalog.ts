import catalogData from "@/data/catalog.json";

export type CatalogTrack = {
  id: string;
  shareId: string;
  title: string;
  bpm: number;
  durationMs: number;
  genres: string[];
  coverUrl: string;
  description: string;
  album: string | null;
  listenUrl: string;
};

export type Artist = {
  id: string;
  stageName: string;
  slug: string;
  bio: string;
  avatarUrl: string;
  profileUrl: string;
  artistsUrl: string;
  album: string;
  siteUrl: string;
};

export const catalog = catalogData as {
  artist: Artist;
  fetchedAt: string;
  tracks: CatalogTrack[];
};

export const artist = catalog.artist;
export const tracks: CatalogTrack[] = catalog.tracks;

export function getTrackByShareId(shareId: string | null | undefined) {
  if (!shareId) return undefined;
  return tracks.find((track) => track.shareId === shareId);
}

export function formatDuration(ms: number) {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatBpm(bpm: number) {
  return `${bpm} BPM`;
}
