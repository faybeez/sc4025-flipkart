"use client";
import { useDemoPlayback } from "@/components/demo/use-demo-playback";
import { customerDemoSteps } from "./demo-data";
export function useCustomerPlayback(initialStep: string, beforeAdvance?: (nextIndex: number, signal: AbortSignal) => Promise<void>) {
  return useDemoPlayback(customerDemoSteps, initialStep, beforeAdvance);
}
