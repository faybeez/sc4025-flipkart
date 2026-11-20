import { demoAssets } from "@/components/demo-assets";
// Edit the copy or change the shared asset mappings.
export const openBoxContent = {
  title: "Open Box Delivery",
  introduction: "Inspect before sharing OTP",
  description: "Your delivery partner will open the package in front of you.",
  reminder: "Share the delivery OTP only after completing the checks.",
  heroImage: demoAssets.inspectionHero,
  reminderImage: demoAssets.otpWarning,
  supportImage: demoAssets.inspectionHelp,
  supportPhone: "", // Set a support number to enable the Call link.
  checks: [
    { id: "damage", title: "Tamper & damage check", description: "Look for broken seals, dents, cracks or scratches on the package and item.", image: demoAssets.damageCheck, note: "" },
    { id: "product", title: "Correct product", description: "Match the model, colour and specifications with your order.", image: demoAssets.productCheck, note: "" },
    { id: "contents", title: "Box contents", description: "Check that the charger, accessories and other listed parts are included.", image: demoAssets.contentsCheck, note: "" },
    { id: "functionality", title: "Functionality check", description: "Where supported, check that the item works as expected before sharing the OTP.", image: demoAssets.functionalityCheck, note: "Available checks vary by product." },
  ],
};


