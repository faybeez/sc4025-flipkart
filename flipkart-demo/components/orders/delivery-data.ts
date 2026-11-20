import { demoAssets } from "@/components/demo-assets";
export type DeliveryStatus = "confirmed" | "shipped" | "outForDelivery" | "cancelled" | "rescheduled" | "arrived" | "delivered";
export const initialDeliveryStatus: DeliveryStatus = "confirmed";
export const deliveryStates = {
  cancelled: { title: "Today’s delivery attempt was cancelled", message: "Your parcel will be shipped out again soon. We’ll notify you once a new delivery date is confirmed.", step: 2 },
  rescheduled: { title: "Your delivery has been rescheduled", message: "A new delivery attempt is confirmed. Your delivery partner is on the way.", step: 2 },
  arrived: { title: "Your delivery partner has arrived!", message: "Rahul has reached your location. Inspect your item before sharing the delivery OTP.", step: 2 },
  delivered: { title: "Your order has been delivered", message: "Thank you for shopping with Flipkart.", step: 3 },
  outForDelivery: { title: "Your delivery is on the way!", message: "Your delivery partner is heading towards your location.", step: 2 },
  confirmed: { title: "Your order is confirmed", message: "We'll update you once the seller ships your item.", step: 0 },
  shipped: { title: "Your order is on its way", message: "Your parcel is moving through our delivery network.", step: 1 },
};
export const shippingJourney = {
  shippedOn: "Tue, 18 Jul",
  event: "Item picked up from seller",
  location: "Bengaluru",
  timestamp: "Tue, 18 Jul, 10:00 AM",
  steps: [
    { id: "pickup", label: "Item picked up", date: "18 Jul", image: demoAssets.pickup },
    { id: "facility", label: "Flipkart facility", date: "Pending", image: demoAssets.facility },
    { id: "hub", label: "Nearest delivery hub", date: "Pending", image: demoAssets.hub },
  ],
};
// Shipping state illustration.
export const shippingStatusImage = demoAssets.shippingStatus;

export const lastMileDelivery = {
  date: "Today, 21 Jul",
  arrival: "2:45 PM",
  partner: "Rahul",
  rating: "4.8",
  phone: "", // Add the delivery partner phone number to enable calling.
  portrait: demoAssets.deliveryPartner,
};

