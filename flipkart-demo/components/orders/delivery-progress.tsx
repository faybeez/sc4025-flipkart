import { demoAssets } from "@/components/demo-assets";
import { customerFlowAssets } from "@/components/customer-demo/demo-data";
import { Icon } from "./icon";
import { ImageSlot } from "./image-slot";
import { useDemoOrder } from "@/lib/demo/store";
import { deliveryStates, lastMileDelivery, shippingJourney, shippingStatusImage, type DeliveryStatus } from "./delivery-data";

export function DeliveryStatusCard({ status }: { status: DeliveryStatus }) {
  const order = useDemoOrder();
  return <section className="order-card delivery-status-card" aria-label="Order status"><div className="status-visual"><span className={`status-layer ${status === "confirmed" || status === "delivered" ? "is-visible" : ""}`} aria-hidden="true"><ImageSlot src={demoAssets.confirmed} className="confirmed-status-image" /></span><span className={`status-layer ${status !== "confirmed" && status !== "delivered" ? "is-visible" : ""}`} aria-hidden="true"><ImageSlot src={shippingStatusImage} className="shipping-status-image" /></span></div><div className="status-copy-stack">{(Object.keys(deliveryStates) as DeliveryStatus[]).map(state => <div key={state} className={`status-copy ${state === status ? "is-visible" : ""}`} aria-hidden={state !== status}><h2>{deliveryStates[state].title}</h2><p>{state === "delivered" ? "Delivered on Fri, 21 July" : <>Expected delivery: <time>{order.expectedDelivery}</time></>}</p><p>{deliveryStates[state].message}</p></div>)}</div><span className="sr-only" role="status">{deliveryStates[status].title}</span></section>;
}
export function DeliveryTimeline({ status, onUpdates }: { status: DeliveryStatus; onUpdates: () => void }) {
  const order = useDemoOrder();
  const active = deliveryStates[status].step;
  return <section className="order-card"><div className="card-heading"><h2>Delivery progress</h2><button className="text-button" onClick={onUpdates}>See all updates <Icon name="chevron" /></button></div><ol className={`timeline state-timeline ${status === "delivered" ? "timeline-delivered" : ""}`} aria-label="Delivery progress">{["Order confirmed", "Shipped", "Out for delivery", "Delivered"].map((step, index) => <li key={step} className={`${index <= active ? "complete" : ""} ${index === active ? "current" : ""}`} aria-current={index === active ? "step" : undefined}><span className="step-dot">{(index === 0 || index < active || status === "delivered") && <Icon name="check" />}</span><span className="step-label">{step}</span><time className={index === 1 && active < 1 ? "step-date-hidden" : ""}>{index === 0 ? order.confirmedOn : index === 1 ? shippingJourney.shippedOn : index === 2 && active >= 2 ? lastMileDelivery.date : index === 3 && active >= 3 ? "Fri, 21 Jul" : index === 3 && active >= 2 ? "Pending" : ""}</time></li>)}</ol></section>;
}
const journeyEvents = [
  { title: "Item picked up from seller", time: "Tue, 18 Jul, 10:00 AM" },
  { title: "Your item has reached the Flipkart facility", time: "Wed, 19 Jul, 8:30 AM" },
  { title: "Your item has reached the nearest delivery hub", time: "Fri, 21 Jul, 8:00 AM" },
  { title: "Taking longer than expected to leave the hub", time: "Fri, 21 Jul, 11:15 AM" },
];
export function ShippingJourney({ visible, journeyStage = 0, delayProgress = 1 }: { visible: boolean; journeyStage?: number; delayProgress?: number }) {
  const active = Math.min(2, journeyStage);
  const clockMinutes = 595 + Math.round(Math.min(1, Math.max(0, delayProgress)) * 80);
  const clock = `${Math.floor(clockMinutes / 60)}:${String(clockMinutes % 60).padStart(2, "0")} AM`;
  const event = journeyEvents[Math.min(3, journeyStage)];
  return <div className={`journey-reveal ${visible ? "is-open" : ""}`} inert={!visible} aria-hidden={!visible}><div className="journey-reveal-inner"><section className="order-card shipping-journey" data-demo-target="journey"><h2>Shipping journey</h2><ol className="journey-stops">{shippingJourney.steps.map((step, index) => <li key={step.id} className={`${index === active ? "picked-up" : ""} ${index < active ? "journey-completed" : ""}`}><ImageSlot src={index === 1 && active >= 1 ? customerFlowAssets.facilityComplete : index === 2 && active >= 2 ? customerFlowAssets.hubComplete : step.image} className="journey-image" /><span className="journey-dot">{index < active && <Icon name="check" />}</span><span className="journey-label">{step.label}</span><span className="journey-date">{index > active ? "Pending" : ["18 Jul", "19 Jul", "21 Jul"][index]}</span></li>)}</ol><div className="shipping-event" key={event.title}><span className="event-dot" /><div><h3>{event.title}</h3><p>Bengaluru · {event.time}</p></div></div>{journeyStage === 3 && <aside className="hub-delay"><ImageSlot src={customerFlowAssets.delay} className="delay-image" /><div><strong>We’re running a little late</strong><p>Expected departure: 10:00 AM<br /><span className="demo-clock">Current time: {clock}</span></p><p>Your parcel is safe at the hub. We’ll update you when it leaves.</p></div></aside>}</section></div></div>;
}


