"use client";
import { useId, useState } from "react";
import { useDemoOrder } from "@/lib/demo/store";
import { ImageSlot } from "./image-slot";
import { Icon } from "./icon";
import { lastMileDelivery as delivery, deliveryStates } from "./delivery-data";
// Intentionally empty: replace with your map integration later.
export function CustomerDeliveryMap() { return <div className="customer-delivery-map" role="region" aria-label="Current delivery location map" />; }
export function DeliveryPartnerCard({ onChat }: { onChat: () => void }) {
  return <section className="order-card delivery-partner" aria-label="Your delivery partner"><div className="partner-profile"><ImageSlot src={delivery.portrait} className="partner-portrait" /><div className="partner-copy"><h3>{delivery.partner} <span className="partner-rating"><span aria-label="Rating">★</span> {delivery.rating}</span></h3><p>Delivery partner</p></div>{delivery.phone ? <a className="partner-call" href={`tel:${delivery.phone}`}>Call</a> : <button className="partner-call" disabled title="Add a delivery partner phone number to enable calling">Call</button>}</div><button data-demo-tap="chat" className="partner-chat" onClick={onChat}>Send a chat to driver <Icon name="chevron" /></button></section>;
}
export default function LastMileDelivery({ visible, onChat }: { visible: boolean; onChat: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const mapId = useId(); const order = useDemoOrder();
  return <div className={`journey-reveal last-mile-reveal ${visible ? "is-open" : ""}`} inert={!visible} aria-hidden={!visible}><div className="journey-reveal-inner"><section className="last-mile-delivery" aria-label="Delivery to your location"><div className="last-mile-heading"><h2>{deliveryStates.outForDelivery.title}</h2><p>{deliveryStates.outForDelivery.message}</p></div><DeliveryPartnerCard onChat={onChat} /><section className="order-card customer-location"><button className="location-toggle" aria-expanded={expanded} aria-controls={mapId} onClick={() => setExpanded(value => !value)}><span><strong>View delivery current location and estimated delivery time</strong><span className="location-eta">Estimated arrival <b>{order.arrival}</b></span></span><span className={`location-chevron ${expanded ? "expanded" : ""}`}><Icon name="chevron" /></span></button><div id={mapId} className={`location-map-reveal ${expanded ? "is-open" : ""}`} inert={!expanded} aria-hidden={!expanded}><div className="location-map-inner"><CustomerDeliveryMap /></div></div></section></section></div></div>;
}

