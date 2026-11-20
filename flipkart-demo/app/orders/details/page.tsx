import type { Metadata } from "next";
import CustomerDemo from "@/components/customer-demo/customer-demo";
export const metadata: Metadata = { title: "Customer Demo | Flipkart", description: "Play through the complete customer delivery, flood cancellation, arrival, and return experience." };
export default function OrderDetailsPage() { return <CustomerDemo />; }
