"use client";

import { useEffect, useRef } from "react";
import { createBeatClock, type BeatClock } from "@/lib/beat-clock";

export function useBeatClock(bpm: number, muted: boolean, enabled: boolean) {
  const clockRef = useRef<BeatClock | null>(null);

  useEffect(() => {
    clockRef.current?.setMuted(muted);
  }, [muted]);

  useEffect(() => {
    if (!enabled) {
      clockRef.current?.stop();
      clockRef.current = null;
      return;
    }

    const clock = createBeatClock({ bpm, muted });
    clockRef.current = clock;
    void clock.start();

    return () => {
      clock.stop();
      if (clockRef.current === clock) clockRef.current = null;
    };
  }, [bpm, enabled, muted]);

  return { clock: clockRef.current };
}
