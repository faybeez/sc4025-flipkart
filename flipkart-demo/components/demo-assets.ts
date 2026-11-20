// Shared asset mapping. Keep screen components independent of asset folder names.
const asset = (folder: string, filename: string) =>
  `/assets/${folder}/${filename}`.split("/").map(encodeURIComponent).join("/");
const confirmed = "Order/01 Order Confirmed";
const shipping = "Order/02 Shipping Journey and Updates";
const inspection = "Order/07 Arrived and Open Box Inspection";
const driver = "Delivery Partner App/02 Home - Standard Delivery";

export const demoAssets = {
  customerProduct: asset(confirmed, "asus-tuf-gaming-laptop-customer.png"),
  customerHelp: asset(confirmed, "support-agent-female-with-laptop.png"),
  deliveryInstructions: asset(confirmed, "delivery-instructions-door-parcel-checklist.png"),
  confirmed: asset(confirmed, "order-confirmed-check.png"),
  sealedPackage: asset(confirmed, "sealed-package-navy.png"),
  inspectionMagnifier: asset(confirmed, "inspection-magnifier-navy.png"),
  otpConfirmation: asset(confirmed, "otp-confirmation-shield-navy.png"),
  shippingStatus: asset(shipping, "parcel-in-transit.png"),
  pickup: asset(shipping, "pickup-truck-completed.png"),
  facility: asset(shipping, "flipkart-facility-pending.png"),
  hub: asset(shipping, "nearest-hub-pending.png"),
  inspectionHero: asset(inspection, "open-parcel-inspection.png"),
  otpWarning: asset(inspection, "otp-warning-shield.png"),
  damageCheck: asset(inspection, "tamper-damage-shield.png"),
  productCheck: asset(inspection, "correct-product-tag.png"),
  contentsCheck: asset(inspection, "box-contents.png"),
  functionalityCheck: asset(inspection, "functionality-check-clipboard.png"),
  inspectionHelp: asset("Delivery Partner App/16 Help - Hub Support AI Chat", "support-agent-male-with-laptop.png"),
  deliveryPartner: asset("Order/09 Delivery Partner Chat", "delivery-partner-rahul-portrait.png"),
  driverProduct: asset(driver, "asus-tuf-gaming-laptop-partner.png"),
  assigned: asset(driver, "assigned-parcel.png"),
  delivered: asset(driver, "delivered-parcel.png"),
  remaining: asset(driver, "remaining-parcel.png"),
  arrival: asset(driver, "eta-flipkart-parcel.png"),
};
