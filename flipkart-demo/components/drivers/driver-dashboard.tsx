"use client";
import Link from "next/link";
import ParcelsPage, { type ParcelScenario } from "./parcels-page";
import type { Parcel } from "./parcels-data";
import { useState } from "react";
import { Icon } from "@/components/orders/icon";
import { ImageSlot } from "@/components/orders/image-slot";
import { useDemoDriver, useDemoOrder } from "@/lib/demo/store";
import DeliveryMap from "./delivery-map";
import { driverData as data, driverImages } from "./driver-data";

type Tab = "Home" | "Parcels" | "Help";
export function DeliverySummary({ delivered = data.delivered, cancelled = 0 }: { delivered?: number; cancelled?: number }) {
  const driver = useDemoDriver();
  const remaining = Math.max(0, driver.assigned - delivered - cancelled);
  return <section className="driver-card delivery-summary" aria-labelledby="today-heading"><h2 id="today-heading">Today’s deliveries</h2><div className="delivery-stats">{[{ label: "Assigned", value: driver.assigned, image: driverImages.assigned }, { label: "Delivered", value: delivered, image: driverImages.delivered }, { label: "Remaining", value: remaining, image: driverImages.remaining }].map(stat => <div className="delivery-stat" key={stat.label}><ImageSlot src={stat.image} className="stat-image" /><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</div><div className="delivery-progress"><progress value={delivered} max={Math.max(1, driver.assigned)} aria-label="Completed deliveries" /><span>{delivered} of {driver.assigned}</span></div></section>;
}
export function CurrentDelivery() {
  const order = useDemoOrder();
  return <section className="driver-card current-delivery" aria-labelledby="current-heading"><h2 id="current-heading">Current delivery</h2><p className="driver-order-id">Order ID - {order.orderNumber}</p><div className="driver-product"><div className="driver-product-copy"><h3>{order.product}</h3><p>{order.color}</p><p>Seller: {order.seller}</p><strong>{order.price}</strong></div><ImageSlot src={driverImages.product} className="driver-product-image" /></div></section>;
}
export function RecipientCard({ parcel }: { parcel?: Parcel | null }) {
  return <section className="driver-card recipient-card" aria-label="Delivery recipient and address"><p className="recipient-name"><Icon name="pin" /><span>Delivering to <strong>{parcel?.name.toUpperCase() ?? data.recipient}</strong></span></p><h2>Address</h2><p>{parcel?.address ?? data.address}</p></section>;
}
function DeliveryNavigation() {
  return <section className="delivery-navigation" aria-label="Delivery route and arrival"><DeliveryMap /><div className="arrival-card"><ImageSlot src={driverImages.arrival} className="arrival-image" /><div><h2>Estimated arrival time</h2><p className="arrival-time">{data.arrival}</p><p className="arrival-distance">{data.remainingDistance} remaining</p></div></div></section>;
}
export default function DriverDashboard({ initialTab = "Home", initialParcelScenario = "ready" }: { initialTab?: Tab; initialParcelScenario?: ParcelScenario }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [activeParcel, setActiveParcel] = useState<Parcel | null>(null);
  return <div className="mobile-shell driver-shell"><header className="order-header driver-header"><details className="driver-menu"><summary className="icon-button" aria-label="Open navigation menu"><Icon name="menu" /></summary><nav className="driver-popover" aria-label="Demo navigation"><Link href="/">Choose demo</Link><Link href="/orders/details">Customer demo</Link></nav></details><h1>{tab}</h1><details className="driver-notifications"><summary className="icon-button" aria-label="View notifications"><Icon name="bell" /></summary><div className="driver-popover"><p>No new notifications.</p></div></details></header><main className={`driver-main ${tab === "Parcels" ? "driver-parcels-main" : ""}`}>{tab === "Home" && <><DeliverySummary /><CurrentDelivery /><RecipientCard parcel={activeParcel} /><DeliveryNavigation /></>}{tab === "Parcels" && <ParcelsPage initialScenario={initialParcelScenario} activeParcel={activeParcel} onStart={setActiveParcel} onReset={() => setActiveParcel(null)} onContinue={() => setTab("Home")} />}{tab === "Help" && <section className="driver-card driver-help"><h2>Driver support</h2><p>Need help with your delivery?</p><p>Support contact details can be added here.</p><Link href="/">Back to demo chooser</Link></section>}</main><nav className="driver-bottom-nav" aria-label="Driver navigation">{([{ label: "Home", icon: "home" }, { label: "Parcels", icon: "parcel" }, { label: "Help", icon: "headset" }] as const).map(item => <button key={item.label} aria-current={tab === item.label ? "page" : undefined} onClick={() => setTab(item.label)}><Icon name={item.icon} /><span>{item.label}</span></button>)}</nav></div>;
}






