import type { Metadata } from "next";
import "./globals.css";
import SharedDemoProvider from "@/components/shared/shared-demo-provider";
export const metadata: Metadata = { title: "Flipkart Demo", description: "Your orders and deliveries." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><SharedDemoProvider>{children}</SharedDemoProvider></body></html>;
}
