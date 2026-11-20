const asset = (screen: string, file: string) => `/assets/Delivery Partner App/${screen}/${file}`.split("/").map(encodeURIComponent).join("/");
const standard = "06 Full Navigation - Standard";
const flood = "06 Full Navigation - Flood";
const cancelled = "14 Cancelled Delivery Popup - Flood";
export const driverDemoAssets = {
  normalMap: asset(standard,"full-screen-map.png"),
  floodMap: asset(flood,"full-screen-map.png"),
  blockedMap: asset(cancelled,"map-cancelled-flood-source-HD.png"),
  smallMap: asset("02 Home - Standard Delivery","small-map.png"),
  turnNormal: asset(standard,"turn-card.png"),
  turnFlood: asset(flood,"turn-card.png"),
  zoom: asset(standard,"map-zoom-control.svg"),
  recenter: asset(standard,"map-recenter-control.svg"),
  voice: asset(standard,"icon-voice-blue.svg"),
  recipient: asset("07 Customer Chat","recipient-avatar-placeholder.png"),
  finish: asset("01 Home - No Delivery Started","delivery-partner-illustration.png"),
  startHero: asset("11 Home - Start Delivery Confirmation","hero-flipkart-parcel.png"),
  checkParcel: asset("11 Home - Start Delivery Confirmation","check-parcel.png"),
  handleCare: asset("11 Home - Start Delivery Confirmation","handle-with-care.png"),
  staySafe: asset("11 Home - Start Delivery Confirmation","stay-safe.png"),
  warning: asset(cancelled,"warning-shield.png"),
  notified: asset(cancelled,"notification-completed-green.png"),
  safeCancelled: asset(cancelled,"stay-safe--cancelled-variant.png"),
  secureCancelled: asset(cancelled,"secure-parcel--cancelled-variant.png"),
  returnCancelled: asset(cancelled,"return-to-hub--cancelled-variant.png"),
};
export type DriverScreen = "home" | "parcels" | "map" | "chat" | "instructions";
export type DriverStep = { id: string; label: string; seconds: number; screen: DriverScreen; job: 1 | 2; active?: boolean; route?: "standard" | "updated" | "flood" | "expanding" | "blocked" | "arrived"; overlay?: "start" | "flood" | "cancelled"; cancelled?: boolean };
export const driverDemoSteps: DriverStep[] = [
  { id: "home", label: "Home · ready for today’s deliveries", seconds: 6, screen: "home", job: 1 },
  { id: "parcels", label: "Choose a parcel", seconds: 6, screen: "parcels", job: 1 },
  { id: "start", label: "Confirm the first delivery", seconds: 6, screen: "parcels", job: 1, overlay: "start" },
  { id: "started", label: "Delivery started", seconds: 4, screen: "parcels", job: 1, active: true },
  { id: "standardHome", label: "Home · standard delivery", seconds: 8, screen: "home", job: 1, active: true },
  { id: "standardMap", label: "Full navigation", seconds: 7, screen: "map", job: 1, active: true, route: "standard" },
  { id: "updatedMap", label: "Route updated", seconds: 7, screen: "map", job: 1, active: true, route: "updated" },
  { id: "floodQuestion", label: "What if there was a flood?", seconds: 5, screen: "map", job: 1, active: true, route: "updated", overlay: "flood" },
  { id: "floodRoute", label: "Flood detected · safer route found", seconds: 9, screen: "map", job: 1, active: true, route: "flood" },
  { id: "floodExpands", label: "Flood expands · no safe route", seconds: 8, screen: "map", job: 1, active: true, route: "expanding" },
  { id: "cancelled", label: "Delivery attempt cancelled for safety", seconds: 10, screen: "map", job: 1, route: "blocked", overlay: "cancelled", cancelled: true },
  { id: "nextHome", label: "Home · next recommended delivery", seconds: 8, screen: "home", job: 2, cancelled: true },
  { id: "nextStart", label: "Confirm the next delivery", seconds: 6, screen: "home", job: 2, cancelled: true, overlay: "start" },
  { id: "secondHome", label: "Next delivery in progress", seconds: 7, screen: "home", job: 2, active: true, cancelled: true },
  { id: "secondMap", label: "Navigation · clear route", seconds: 8, screen: "map", job: 2, active: true, route: "standard", cancelled: true },
  { id: "secondContact", label: "Contact the customer", seconds: 5, screen: "home", job: 2, active: true, cancelled: true },
  { id: "chat", label: "Open customer chat", seconds: 4, screen: "chat", job: 2, active: true, cancelled: true },
  { id: "chatTyping", label: "Let the customer know your arrival time", seconds: 5, screen: "chat", job: 2, active: true, cancelled: true },
  { id: "chatSent", label: "Message sent · 15 minutes away", seconds: 5, screen: "chat", job: 2, active: true, cancelled: true },
  { id: "arrivalMap", label: "Arrived at the customer’s location", seconds: 8, screen: "map", job: 2, active: true, route: "arrived", cancelled: true },
  { id: "instructions", label: "Read the customer’s delivery instructions", seconds: 12, screen: "instructions", job: 2, active: true, cancelled: true },
];
export const driverDemoMessage = "Hi, I’m 15 minutes away. Please keep your phone nearby.";
export const deliveryInstructions = "Use the side gate and call when you arrive.";
