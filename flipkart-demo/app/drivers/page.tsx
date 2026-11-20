import type { Metadata } from "next";
import DriverDemo from "@/components/driver-demo/driver-demo";
export const metadata: Metadata = { title: "Driver Demo | Flipkart", description: "Play through the delivery partner’s route, flood cancellation, next delivery, chat, and arrival." };
export default function DriversPage() { return <DriverDemo />; }
