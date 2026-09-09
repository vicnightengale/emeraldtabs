import type { CatalogTrack } from "@/lib/catalog";

export type ShareResult = {
  track: CatalogTrack;
  score: number;
  accuracy: number;
  combo: number;
  shattered: boolean;
  sigil: string;
};

export function buildSharePath(result: ShareResult) {
  const params = new URLSearchParams({
    track: result.track.shareId,
    score: String(result.score),
    accuracy: String(Math.round(result.accuracy * 1000) / 1000),
    combo: String(result.combo),
    sigil: result.sigil,
    shatter: result.shattered ? "1" : "0",
  });
  return `/?${params.toString()}`;
}

export function buildShareUrl(result: ShareResult, origin?: string) {
  const base =
    origin ||
    (typeof window !== "undefined" ? window.location.origin : "https://emeraldtabs.com");
  return `${base}${buildSharePath(result)}`;
}

export function shareCopy(result: ShareResult) {
  const acc = Math.round(result.accuracy * 100);
  const verb = result.shattered ? "cracked the tablet" : "tapped the tablet";
  return `I ${verb} on “${result.track.title}” — ${acc}% · Shatter Sync\n${buildShareUrl(result)}\nListen: ${result.track.listenUrl}`;
}

export async function shareOrCopy(result: ShareResult, file?: File) {
  const url = buildShareUrl(result);
  const text = shareCopy(result);

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      const data: ShareData = { title: "emerald tabs · Shatter Sync", text, url };
      if (file && navigator.canShare?.({ files: [file] })) {
        data.files = [file];
      }
      await navigator.share(data);
      return "shared" as const;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return "cancelled" as const;
      }
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return "copied" as const;
  }

  return "failed" as const;
}

export function downloadBlob(blob: Blob, filename: string) {
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
}
