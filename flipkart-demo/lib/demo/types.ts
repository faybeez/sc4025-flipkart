import type { DeliveryStatus } from "@/components/orders/delivery-data";
export type DemoOrder = {
  id: string; orderNumber: string; product: string; color: string; seller: string; price: string; offers: number;
  recipient: string; address: string; distance: number; minutes: number; status: DeliveryStatus; journeyStage: number;
  expectedDelivery: string; confirmedOn: string; arrival: string; instructions: string;
  productRating: number; deliveryRating: number; ratingSubmitted: boolean;
  returnReason: string; returnDescription: string; returnAttachment: string; returnAddress: string; returnSubmitted: boolean;
};
export type DemoRoute = "standard" | "updated" | "flood" | "expanding" | "blocked" | "arrived";
export type DemoDriver = { activeOrderId: string | null; route: DemoRoute; cancelledOrderIds: string[]; assigned: number; delivered: number; arrival: string; date: string };
export type Entity = { id: string; data: Record<string, unknown>; revision: number; updated_at: string };
export type SharedMessage = { id: string; order_id: string; sender: "customer" | "driver"; body: string; attachment_name: string | null; attachment_path: string | null; created_at: string; user_id?: string };
export type SyncStatus = "connecting" | "synced" | "saving" | "offline" | "not-configured";
