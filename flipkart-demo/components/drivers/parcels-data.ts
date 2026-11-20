const parcelAsset = (screen: string, file: string) => `/assets/Delivery Partner App/${screen}/${file}`.split("/").map(encodeURIComponent).join("/");
const list = "09 Parcels - No Delivery Started";
const issues = "15 Issues and Next Steps";
export const parcelAssets = {
  calendar: parcelAsset(list, "calendar.png"),
  pin: parcelAsset(list, "address-pin-outline.png"),
  clock: parcelAsset(list, "clock-estimate.png"),
  info: parcelAsset(list, "icon-info-blue.svg"),
  warning: parcelAsset("13 Parcels - Cancelled Deliveries and Issues", "warning-shield.png"),
  overview: parcelAsset(issues, "issues-overview.png"),
  safe: parcelAsset(issues, "stay-safe-partner.png"),
  secure: parcelAsset(issues, "secure-parcel.png"),
  return: parcelAsset(issues, "return-to-hub.png"),
};
export type Parcel = { id: string; name: string; address: string; distance: number; minutes: number };
export const parcels: Parcel[] = [
  { id: "FMPP4197078643", name: "Ananya S.", address: "12th Main Road, Indiranagar", distance: 0.6, minutes: 5 },
  { id: "FMPP4197078661", name: "Rahul K.", address: "CMH Road, Indiranagar", distance: 1.2, minutes: 10 },
  { id: "FMPP4197078698", name: "Priya M.", address: "8th Main Road, Indiranagar", distance: 1.8, minutes: 15 },
];
export const parcelDay = { date: "2026-10-25", pending: 14, delivered: 18 };
export const cancelledParcels = [
  { ...parcels[0], reason: "No safe route · Flood" },
  { ...parcels[1], reason: "No safe route · Earthquake" },
];
export const issueSteps = [
  { title: "Stay safe", description: "Do not continue the cancelled delivery attempt. Stay in a safe location.", image: parcelAssets.safe },
  { title: "Keep the parcel secure", description: "Keep the parcel with you and protect it from damage.", image: parcelAssets.secure },
  { title: "Return to hub", description: "Return the parcel to your hub when it is safe to travel.", image: parcelAssets.return },
];
