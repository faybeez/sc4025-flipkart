import { demoAssets } from "@/components/demo-assets";
// Editable demo values and supplied illustration mappings.
export const driverData = {
  assigned: 32,
  delivered: 18,
  recipient: "ANANYA S.",
  address: "No. 24, 12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038",
  arrival: "2:45 PM",
  remainingDistance: "1.8 km",
};
export const driverImages: { assigned?: string; delivered?: string; remaining?: string; arrival?: string; product?: string } = { assigned: demoAssets.assigned, delivered: demoAssets.delivered, remaining: demoAssets.remaining, arrival: demoAssets.arrival, product: demoAssets.driverProduct };


