"use client";
import { useEffect, type ReactNode } from "react";
import { initializeDemo } from "@/lib/demo/store";
export default function SharedDemoProvider({ children }: { children: ReactNode }) {
  useEffect(() => { initializeDemo(); },[]);
  return children;
}
