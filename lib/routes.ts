import type { CatalogTrack } from "@/lib/catalog";

export function tabletHref(track: CatalogTrack, options?: { play?: boolean; hash?: string }) {
  const params = new URLSearchParams({ track: track.shareId });
  if (options?.play) params.set("play", "1");
  const hash = options?.hash ? `#${options.hash}` : "";
  return `/?${params.toString()}${hash}`;
}
