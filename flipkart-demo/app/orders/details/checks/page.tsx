import type { Metadata } from "next";
import OpenBoxDetails from "@/components/orders/open-box-details";
export const metadata: Metadata = { title: "Open Box Delivery | Flipkart", description: "What to check before sharing your delivery OTP." };
export default function OpenBoxPage() { return <OpenBoxDetails />; }
