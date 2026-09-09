import { hashString, utcDateKey } from "@/lib/hash";
import { tracks, type CatalogTrack } from "@/lib/catalog";

export function getDailyTrack(date = new Date()): CatalogTrack {
  const key = utcDateKey(date);
  const index = hashString(`tablet:${key}`) % tracks.length;
  return tracks[index];
}

export function isDailyTrack(track: CatalogTrack, date = new Date()) {
  return getDailyTrack(date).id === track.id;
}
