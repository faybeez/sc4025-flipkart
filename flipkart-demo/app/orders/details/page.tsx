import type { Metadata } from "next";
import CustomerDemo from "@/components/customer-demo/customer-demo";
export const metadata: Metadata = { title: "Customer Demo | Flipkart", description: "Explore customer deliveries with manual controls and shared local data." };
export default function OrderDetailsPage() { return <CustomerDemo />; }

