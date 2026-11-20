"use client";
import { useCallback, useEffect, useRef, useState } from "react";
export type PlaybackStep = { id: string; label: string; seconds: number };
export function useDemoPlayback<T extends PlaybackStep>(steps: readonly T[], initialStep: string, beforeAdvance?: (nextIndex: number, signal: AbortSignal) => Promise<void>) {
  const beforeAdvanceRef = useRef(beforeAdvance);
  useEffect(() => { beforeAdvanceRef.current = beforeAdvance; }, [beforeAdvance]);
  const initial = Math.max(0, steps.findIndex(step => step.id === initialStep));
  const [index, setIndex] = useState(initial);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef(0);
  const step = steps[index];
  const go = useCallback((next: number, pause = false) => {
    elapsedRef.current = 0; setElapsed(0);
    setIndex(Math.min(steps.length - 1, Math.max(0, next)));
    if (pause) setPlaying(false);
  }, [steps.length]);
  const jump = useCallback((id: string) => { const next = steps.findIndex(item => item.id === id); if (next >= 0) go(next); }, [go, steps]);
  useEffect(() => {
    if (!playing) return;
    let disposed = false;
    let advancing = false;
    const controller = new AbortController();
    let last = performance.now();
    const timer = window.setInterval(async () => {
      if (advancing) return;
      const now = performance.now();
      elapsedRef.current += (now - last) / 1000 * speed; last = now;
      setElapsed(elapsedRef.current);
      if (elapsedRef.current >= step.seconds) {
        advancing = true;
        if (index < steps.length - 1) await beforeAdvanceRef.current?.(index + 1, controller.signal);
        if (disposed) return;
        elapsedRef.current = 0; setElapsed(0);
        if (index >= steps.length - 1) { elapsedRef.current = step.seconds; setElapsed(step.seconds); setPlaying(false); }
        else setIndex(current => current + 1);
      }
    }, 100);
    return () => { disposed = true; controller.abort(); window.clearInterval(timer); };
  }, [index, playing, speed, step.seconds, steps.length]);
  return { index, step, playing, setPlaying, speed, setSpeed, elapsed, go, jump, restart: () => { go(0); setPlaying(true); } };
}

