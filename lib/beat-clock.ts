export type BeatClockOptions = {
  bpm: number;
  muted?: boolean;
  onPulse?: (pulse: number, beatPhase: number, audioTime: number) => void;
  onBeat?: (beatIndex: number) => void;
};

export type BeatClock = {
  start: () => Promise<void>;
  stop: () => void;
  setMuted: (muted: boolean) => void;
  getTimeMs: () => number;
  running: () => boolean;
};

function createKick(ctx: AudioContext, time: number, gain: GainNode) {
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(78, time);
  osc.frequency.exponentialRampToValueAtTime(38, time + 0.12);
  env.gain.setValueAtTime(0.0001, time);
  env.gain.exponentialRampToValueAtTime(0.22, time + 0.008);
  env.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);
  osc.connect(env);
  env.connect(gain);
  osc.start(time);
  osc.stop(time + 0.18);
}

function createClick(ctx: AudioContext, time: number, gain: GainNode) {
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(740, time);
  env.gain.setValueAtTime(0.0001, time);
  env.gain.exponentialRampToValueAtTime(0.05, time + 0.004);
  env.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);
  osc.connect(env);
  env.connect(gain);
  osc.start(time);
  osc.stop(time + 0.05);
}

function createPad(ctx: AudioContext, time: number, gain: GainNode) {
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(196, time);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(420, time);
  env.gain.setValueAtTime(0.0001, time);
  env.gain.exponentialRampToValueAtTime(0.035, time + 0.04);
  env.gain.exponentialRampToValueAtTime(0.0001, time + 0.42);
  osc.connect(filter);
  filter.connect(env);
  env.connect(gain);
  osc.start(time);
  osc.stop(time + 0.45);
}

export function createBeatClock(options: BeatClockOptions): BeatClock {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let timer: number | null = null;
  let raf = 0;
  let nextBeat = 0;
  let beatIndex = 0;
  let startPerf = 0;
  let started = false;
  let muted = Boolean(options.muted);
  let alive = true;

  const beatSec = 60 / Math.max(options.bpm, 40);

  const pulseFrame = () => {
    if (!alive) return;
    const now = started && ctx ? ctx.currentTime : performance.now() / 1000;
    const origin = started && ctx ? 0 : startPerf / 1000;
    const elapsed = started ? ctx!.currentTime : performance.now() / 1000 - origin;
    const phase = ((elapsed % beatSec) + beatSec) % beatSec;
    const normalized = phase / beatSec;
    const pulse = Math.pow(1 - normalized, 2.6);
    options.onPulse?.(pulse, normalized, now);
    raf = window.requestAnimationFrame(pulseFrame);
  };

  const schedule = () => {
    if (!ctx || !master || !started) return;
    const horizon = ctx.currentTime + 0.12;
    while (nextBeat < horizon) {
      if (!muted) {
        createKick(ctx, nextBeat, master);
        createClick(ctx, nextBeat, master);
        if (beatIndex % 4 === 0) createPad(ctx, nextBeat, master);
      }
      options.onBeat?.(beatIndex);
      beatIndex += 1;
      nextBeat += beatSec;
    }
  };

  return {
    async start() {
      if (started) return;
      startPerf = performance.now();
      alive = true;
      try {
        ctx = new AudioContext();
        master = ctx.createGain();
        master.gain.value = 0.55;
        master.connect(ctx.destination);
        if (ctx.state === "suspended") await ctx.resume();
        nextBeat = ctx.currentTime + 0.08;
        started = true;
        schedule();
        timer = window.setInterval(schedule, 25);
      } catch {
        started = false;
      }
      raf = window.requestAnimationFrame(pulseFrame);
    },
    stop() {
      alive = false;
      started = false;
      if (timer) window.clearInterval(timer);
      timer = null;
      if (raf) window.cancelAnimationFrame(raf);
      void ctx?.close();
      ctx = null;
      master = null;
    },
    setMuted(next) {
      muted = next;
      if (master) master.gain.value = next ? 0 : 0.55;
    },
    getTimeMs() {
      if (ctx && started) return ctx.currentTime * 1000;
      return performance.now() - startPerf;
    },
    running() {
      return started;
    },
  };
}
