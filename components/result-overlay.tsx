"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { artist } from "@/lib/catalog";
import { normalizeInitials, saveAlchemist, type AlchemistEntry } from "@/lib/leaderboard";
import { utcDateKey } from "@/lib/hash";
import { canvasToBlob, drawSigil } from "@/lib/sigil";
import { downloadBlob, shareOrCopy, type ShareResult } from "@/lib/share";

type ResultOverlayProps = {
  result: ShareResult;
  onClose: () => void;
  onSaved: (entries: AlchemistEntry[]) => void;
};

export function ResultOverlay({ result, onClose, onSaved }: ResultOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [initials, setInitials] = useState("ET");
  const [status, setStatus] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    drawSigil(canvasRef.current, {
      seed: result.sigil,
      trackTitle: result.track.title,
      score: result.score,
      accuracy: result.accuracy,
      date: utcDateKey(),
      shattered: result.shattered,
    });
  }, [result]);

  const exportFile = async () => {
    if (!canvasRef.current) return null;
    const blob = await canvasToBlob(canvasRef.current);
    return new File([blob], `emerald-tabs-${result.track.shareId}.png`, { type: "image/png" });
  };

  const onShare = async () => {
    try {
      const file = await exportFile();
      const outcome = await shareOrCopy(result, file ?? undefined);
      if (outcome === "shared") setStatus("Shared to your sheet.");
      if (outcome === "copied") setStatus("Link copied. Drop it on Stories or TikTok.");
      if (outcome === "failed") setStatus("Could not share. Download the sigil instead.");
    } catch {
      setStatus("Could not share. Download the sigil instead.");
    }
  };

  const onDownload = async () => {
    try {
      const file = await exportFile();
      if (!file) return;
      downloadBlob(file, file.name);
      setStatus("Sigil saved.");
    } catch {
      setStatus("Download failed.");
    }
  };

  const onSaveBoard = () => {
    const entries = saveAlchemist({
      initials: normalizeInitials(initials),
      trackTitle: result.track.title,
      shareId: result.track.shareId,
      score: result.score,
      accuracy: result.accuracy,
      combo: result.combo,
      shattered: result.shattered,
      date: utcDateKey(),
    });
    onSaved(entries);
    setSaved(true);
    setStatus("Carved into Alchemists on this device.");
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-3 backdrop-blur-md">
      <div className="max-h-[96vh] w-full max-w-[420px] overflow-auto rounded-[2rem] border border-gold/30 bg-[#050807] shadow-[0_0_80px_rgba(16,185,129,0.16)]">
        <div className="aspect-9/16 bg-[radial-gradient(circle_at_50%_30%,rgba(16,185,129,0.16),transparent_55%),#030303] px-5 py-6">
          <p className="text-center text-[10px] tracking-[0.34em] text-gold uppercase">
            {result.shattered ? "The tablet cracked" : "The tablet held"}
          </p>
          <h2 className="font-display mt-2 text-center text-3xl text-emerald-50">
            {result.track.title}
          </h2>
          <p className="mt-1 text-center text-xs tracking-[0.2em] text-emerald-100/50 uppercase">
            {artist.stageName} · Shatter Sync
          </p>
          <div className="mx-auto mt-5 w-[78%]">
            <canvas ref={canvasRef} className="h-auto w-full rounded-[1.2rem] border border-emerald-300/20" />
          </div>
          <dl className="mt-6 grid grid-cols-3 gap-2 text-center">
            <div>
              <dt className="text-[10px] tracking-[0.16em] text-emerald-100/40 uppercase">Score</dt>
              <dd className="font-display text-2xl text-emerald-50">{result.score}</dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-[0.16em] text-emerald-100/40 uppercase">Accuracy</dt>
              <dd className="font-display text-2xl text-emerald-50">{Math.round(result.accuracy * 100)}%</dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-[0.16em] text-emerald-100/40 uppercase">Streak</dt>
              <dd className="font-display text-2xl text-emerald-50">{result.combo}×</dd>
            </div>
          </dl>
          <p className="mt-4 text-center text-xs leading-5 text-emerald-100/50">
            {result.shattered
              ? "A clean strike. Take the sigil, then let the real track ride for thirty seconds."
              : "Close. Run it again, or hear the postcard the crystal was keeping."}
          </p>
        </div>
        <div className="space-y-3 border-t border-emerald-300/10 px-5 py-5">
          <label className="block text-xs tracking-[0.16em] text-emerald-100/45 uppercase">
            Initials
            <input
              value={initials}
              maxLength={3}
              onChange={(event) => setInitials(event.target.value)}
              className="mt-1 w-full rounded-xl border border-emerald-300/15 bg-black/40 px-3 py-2 font-display tracking-[0.3em] text-emerald-50 uppercase outline-none focus:border-gold/50"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Button className="h-10 bg-emerald-400 text-emerald-950 hover:bg-emerald-300" onClick={onShare}>
              Share sigil
            </Button>
            <Button variant="outline" className="h-10 border-gold/40 text-gold" onClick={onDownload}>
              Download
            </Button>
          </div>
          <Button
            className="h-10 w-full rounded-full bg-emerald-400 text-emerald-950 hover:bg-emerald-300"
            render={<a href={result.track.listenUrl} target="_blank" rel="noreferrer" />}
          >
            Listen on ElevenMusic
          </Button>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="h-10 flex-1"
              onClick={onSaveBoard}
              disabled={saved}
            >
              {saved ? "On the board" : "Save to Alchemists"}
            </Button>
            <Button variant="ghost" className="h-10" onClick={onClose}>
              Close
            </Button>
          </div>
          {status ? <p className="text-center text-xs text-gold/80">{status}</p> : null}
        </div>
      </div>
    </div>
  );
}
