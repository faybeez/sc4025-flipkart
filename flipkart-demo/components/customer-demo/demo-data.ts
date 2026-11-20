import type { DeliveryStatus } from "@/components/orders/delivery-data";
export type DemoScreen = "order" | "checks" | "chat" | "return" | "review" | "refund";
export type DemoStep = { id: string; label: string; seconds: number; status: DeliveryStatus; journey?: number; screen?: DemoScreen; overlay?: "flood" | "cancelReason" | "otp"; };
// Edit durations here to change the recording's pacing. No real clock or backend is used.
export const customerDemoSteps: DemoStep[] = [
  { id: "confirmed", label: "Order confirmed", seconds: 5, status: "confirmed" },
  { id: "checks", label: "View Open Box Delivery checks", seconds: 7, status: "confirmed", screen: "checks" },
  { id: "shipped", label: "Order shipped", seconds: 5, status: "shipped", journey: 0 },
  { id: "pickup", label: "Item picked up from seller", seconds: 7, status: "shipped", journey: 0 },
  { id: "facility", label: "Arrived at Flipkart facility", seconds: 8, status: "shipped", journey: 1 },
  { id: "hub", label: "Arrived at nearest delivery hub", seconds: 8, status: "shipped", journey: 2 },
  { id: "hubDelay", label: "Expected hub departure time passes", seconds: 8, status: "shipped", journey: 3 },
  { id: "outForDelivery", label: "On its way to your location", seconds: 7, status: "outForDelivery" },
  { id: "chat", label: "Open delivery partner chat", seconds: 4, status: "outForDelivery", screen: "chat" },
  { id: "chatTyping", label: "Write a message to Rahul", seconds: 4, status: "outForDelivery", screen: "chat" },
  { id: "chatSent", label: "Message sent", seconds: 5, status: "outForDelivery", screen: "chat" },
  { id: "flood", label: "What happens if there is a flood?", seconds: 6, status: "outForDelivery", overlay: "flood" },
  { id: "cancelled", label: "Delivery attempt cancelled · Flood", seconds: 8, status: "cancelled" },
  { id: "cancelReason", label: "Why was delivery cancelled?", seconds: 7, status: "cancelled", overlay: "cancelReason" },
  { id: "cancelReviewed", label: "Reschedule the delivery", seconds: 4, status: "cancelled" },
  { id: "rescheduled", label: "Delivery rescheduled", seconds: 6, status: "rescheduled" },
  { id: "arrived", label: "Arrived at your destination", seconds: 7, status: "arrived" },
  { id: "otp", label: "Inspect before sharing OTP", seconds: 9, status: "arrived", overlay: "otp" },
  { id: "delivered", label: "Order delivered", seconds: 6, status: "delivered" },
  { id: "rating", label: "Rate the product and delivery", seconds: 7, status: "delivered" },
  { id: "rated", label: "Rating submitted", seconds: 5, status: "delivered" },
  { id: "return", label: "Request a return", seconds: 6, status: "delivered", screen: "return" },
  { id: "returnFilled", label: "Describe the product problem", seconds: 7, status: "delivered", screen: "return" },
  { id: "review", label: "Review return details", seconds: 8, status: "delivered", screen: "review" },
  { id: "refund", label: "Return request submitted · Refund steps", seconds: 12, status: "delivered", screen: "refund" },
];
export const demoMessage = "Hi Rahul, please call when you arrive. I'm at the delivery address.";
export const demoReturnDescription = "There is a crack on the laptop screen.";
export const customerAsset = (folder: string, file: string) => `/assets/Order/${folder}/${file}`.split("/").map(encodeURIComponent).join("/");
export const customerFlowAssets = {
  floodMap: customerAsset("05 Delivery Attempt Cancelled - Flood", "customer-flood-last-map.png"),
  cancelled: customerAsset("05 Delivery Attempt Cancelled - Flood", "eta-flipkart-parcel.png"),
  arrived: customerAsset("07 Arrived and Open Box Inspection", "arrived-status-card.png"),
  facilityComplete: customerAsset("02 Shipping Journey and Updates", "flipkart-facility-completed.png"),
  hubComplete: customerAsset("02 Shipping Journey and Updates", "nearest-hub-completed.png"),
  delay: customerAsset("02 Shipping Journey and Updates", "delay-clock-orange.png"),
  star: customerAsset("11 Delivered and Ratings", "rating-star-outline.png"),
  starFilled: customerAsset("11 Delivered and Ratings", "rating-star-filled.png"),
  riderFeedback: customerAsset("11 Delivered and Ratings", "delivery-rider-feedback.png"),
  returns: customerAsset("12 Return Request and Product Problem", "returns-parcel-and-arrow.png"),
  proof: customerAsset("12 Return Request and Product Problem", "damaged-laptop-proof-example.png"),
  refund: customerAsset("13 Refund and Return Status", "refund-parcel-and-arrow.png"),
  returnConfirmed: customerAsset("13 Refund and Return Status", "return-request-submitted-check.png"),
  packaging: customerAsset("13 Refund and Return Status", "parcel-keep-packaging-ready.png"),
  assurance: customerAsset("13 Refund and Return Status", "refund-assurance-shield.png"),
};
