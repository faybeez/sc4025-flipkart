"use client";
import { useCallback, useEffect, useRef, type RefObject } from "react";

type Motion = { animation: Animation; element: HTMLElement };
export function usePhonePresentation(phone: RefObject<HTMLDivElement | null>, viewport: RefObject<HTMLDivElement | null>) {
  const motions = useRef(new Set<Motion>());
  const scrolling = useRef(0);
  const lastManualScroll = useRef(0);
  const outgoing = useRef<HTMLElement | null>(null);
  const scrollJob = useRef(0);
  const reduced = useCallback(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  const play = useCallback(async (element: HTMLElement, frames: Keyframe[], duration: number) => {
    const animation = element.animate(frames, { duration, easing: "cubic-bezier(.22,1,.36,1)", fill: "forwards" });
    const motion = { element, animation };
    motions.current.add(motion);
    try { await animation.finished; } catch { /* Interrupted by replay or unmount. */ }
    motions.current.delete(motion); element.remove();
  }, []);
  const tapAt = useCallback(async (x: number, y: number) => {
    if (!phone.current || reduced()) return;
    const marker = document.createElement("span");
    marker.className = "phone-touch phone-touch-tap"; marker.setAttribute("aria-hidden", "true");
    marker.style.left = `${x}px`; marker.style.top = `${y}px`;
    phone.current.appendChild(marker);
    await play(marker, [{ opacity: 0, transform: "translate(-50%,-50%) scale(.6)" }, { opacity: .9, transform: "translate(-50%,-50%) scale(1)", offset: .22 }, { opacity: .65, transform: "translate(-50%,-50%) scale(.85)", offset: .48 }, { opacity: 0, transform: "translate(-50%,-50%) scale(1.65)" }], 560);
  }, [phone, play, reduced]);
  const swipe = useCallback(async (down: boolean, duration = 850) => {
    const root = phone.current;
    if (!root || reduced()) return;
    const marker = document.createElement("span");
    marker.className = "phone-touch phone-touch-swipe"; marker.setAttribute("aria-hidden", "true");
    marker.style.left = "74%"; marker.style.top = down ? "76%" : "32%";
    root.appendChild(marker);
    const travel = root.clientHeight * .4 * (down ? -1 : 1);
    await play(marker, [{ opacity: 0, transform: "translate(-50%,-50%) scale(.85)" }, { opacity: .85, transform: "translate(-50%,-50%) scale(1)", offset: .15 }, { opacity: .7, transform: `translate(-50%,calc(-50% + ${travel}px)) scale(.9)`, offset: .85 }, { opacity: 0, transform: `translate(-50%,calc(-50% + ${travel}px)) scale(.75)` }], duration);
  }, [phone, play, reduced]);
  const scrollTo = useCallback(async (destination: number) => {
    const root = viewport.current;
    if (!root) return;
    const end = Math.max(0, Math.min(destination, root.scrollHeight - root.clientHeight));
    const start = root.scrollTop;
    if (Math.abs(end - start) < 8) return;
    const job = ++scrollJob.current;
    if (reduced()) { root.scrollTo({ top: end, behavior: "instant" }); return; }
    scrolling.current++;
    const finger = swipe(end > start);
    await new Promise<void>(resolve => {
      let began: number | null = null;
      const frame = (now: number) => {
        if (job !== scrollJob.current || !root.isConnected) { resolve(); return; }
        began ??= now;
        const progress = Math.min(1, (now - began) / 850);
        root.scrollTo({ top: start + (end - start) * (1 - Math.pow(1 - progress, 3)), behavior: "instant" });
        if (progress < 1) window.requestAnimationFrame(frame); else resolve();
      };
      window.requestAnimationFrame(frame);
    });
    await finger;
    scrolling.current = Math.max(0, scrolling.current - 1);
    lastManualScroll.current = performance.now();
  }, [viewport, reduced, swipe]);
  const find = useCallback((name: string) => {
    const root = phone.current;
    if (!root) return null;
    return [...root.querySelectorAll<HTMLElement>(`[data-demo-tap="${name}"]`)].find(element => element.getClientRects().length && !element.closest("[hidden], [inert], .phone-outgoing-screen")) || null;
  }, [phone]);
  const tap = useCallback(async (name: string) => {
    const element = find(name), root = viewport.current, frame = phone.current;
    if (!element || !root || !frame) return;
    const rect = element.getBoundingClientRect(), box = frame.getBoundingClientRect();
    if (root.contains(element) && (rect.top < box.top + 35 || rect.bottom > box.bottom - 35)) {
      await scrollTo(root.scrollTop + rect.top - box.top - frame.clientHeight * .48);
    }
    const dialog = element.closest<HTMLElement>(".scene-dialog");
    if (dialog) {
      const bounds = dialog.getBoundingClientRect();
      const target = element.getBoundingClientRect();
      if (target.top < bounds.top + 12 || target.bottom > bounds.bottom - 12) {
        const destination = dialog.scrollTop + target.top - bounds.top - dialog.clientHeight * .5;
        dialog.scrollTo({ top: destination, behavior: reduced() ? "instant" : "smooth" });
        await swipe(destination > dialog.scrollTop);
      }
    }
    const current = element.getBoundingClientRect();
    await tapAt(current.left - box.left + current.width / 2, current.top - box.top + current.height / 2);
  }, [find, phone, viewport, scrollTo, tapAt, reduced, swipe]);
  const capture = useCallback(() => {
    outgoing.current?.remove(); outgoing.current = null;
    const root = viewport.current, frame = phone.current;
    if (!root || !frame || reduced()) return;
    const clone = document.createElement("div");
    clone.className = "phone-outgoing-screen"; clone.setAttribute("aria-hidden", "true"); clone.inert = true;
    const content = root.cloneNode(true) as HTMLElement;
    content.className = "phone-outgoing-content";
    clone.appendChild(content);
    for (const element of [...frame.children]) {
      if (element.matches(".scene-overlay, .flood-question-backdrop, .driver-bottom-nav")) clone.appendChild(element.cloneNode(true));
    }
    clone.querySelectorAll("[id]").forEach(element => element.removeAttribute("id"));
    frame.appendChild(clone); content.scrollTop = root.scrollTop;
    // Nested chat transcripts have their own scroll position.
    const sources = root.querySelectorAll(".chat-transcript, .scene-dialog");
    const copies = content.querySelectorAll(".chat-transcript, .scene-dialog");
    sources.forEach((source,index) => { if (copies[index]) copies[index].scrollTop = source.scrollTop; });
    outgoing.current = clone;
    // Selecting the current scene need not change React's scene key.
    // Fade its snapshot anyway so it cannot remain over a paused preview.
    window.setTimeout(() => {
      if (outgoing.current === clone) {
        outgoing.current = null;
        void play(clone, [{ opacity: 1 }, { opacity: 0 }], 520);
      }
    }, 100);
  }, [phone, viewport, reduced, play]);
  const enter = useCallback(() => {
    const clone = outgoing.current;
    outgoing.current = null;
    if (clone) void play(clone, [{ opacity: 1, transform: "translateX(0)" }, { opacity: 0, transform: "translateX(-22px)" }], 520);
    const root = viewport.current;
    if (root && !reduced()) root.animate([{ opacity: .3, transform: "translateX(22px)" }, { opacity: 1, transform: "translateX(0)" }], { duration: 560, easing: "cubic-bezier(.22,1,.36,1)" });
  }, [viewport, play, reduced]);
  const cancel = useCallback(() => {
    scrollJob.current++; outgoing.current?.remove(); outgoing.current = null;
    for (const motion of motions.current) { motion.animation.cancel(); motion.element.remove(); }
    motions.current.clear();
  }, []);
  useEffect(() => cancel, [cancel]);
  const manualScroll = useCallback((down: boolean) => {
    if (scrolling.current || performance.now() - lastManualScroll.current < 650) return;
    lastManualScroll.current = performance.now(); void swipe(down, 700);
  }, [swipe]);
  return { tap, tapAt, scrollTo, capture, enter, cancel, manualScroll };
}


