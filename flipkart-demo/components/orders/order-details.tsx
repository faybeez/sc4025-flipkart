"use client";
import { useState } from "react";
import { updateOrder, useDemoOrder } from "@/lib/demo/store";
import { ImageSlot } from "./image-slot";
import { Icon } from "./icon";
import { orderImages } from "./order-data";
import { deliveryStates, type DeliveryStatus } from "./delivery-data";
import { OrderHeader, ProductSummary, OpenBoxCard, OrderModal } from "./order-ui";
import { DeliveryStatusCard, DeliveryTimeline, ShippingJourney } from "./delivery-progress";
import LastMileDelivery from "./last-mile-delivery";
import { ArrivedDelivery, CancelledDelivery, DeliveredCards } from "@/components/customer-demo/lifecycle-cards";

export type CustomerAction = "checks" | "chat" | "cancelReason" | "reschedule" | "otp" | "arrived" | "rating" | "rated" | "return";
export type OrderDetailsProps = {
  status?: DeliveryStatus; journeyStage?: number; delayProgress?: number; onAction: (action: CustomerAction) => void;
  ratingVisible?: boolean; rated?: boolean; productRating?: number; deliveryRating?: number;
  onRateProduct?: (value: number) => void; onRateDelivery?: (value: number) => void;
};
export default function OrderDetails({ status = "confirmed", journeyStage = 0, delayProgress = 1, onAction, ratingVisible = false, rated = false, productRating = 0, deliveryRating = 0, onRateProduct = () => {}, onRateDelivery = () => {} }: OrderDetailsProps) {
  const order = useDemoOrder();
  const [panel, setPanel] = useState<"updates" | "help" | "instructions" | null>(null);
  const [instructions, setInstructions] = useState(order.instructions);
  const [saved, setSaved] = useState(false);
  const lateStage = ["outForDelivery", "cancelled", "rescheduled", "arrived"].includes(status);
  return <div className="mobile-shell customer-order-page"><OrderHeader /><main><ProductSummary /><div className={`order-content customer-state-${status}`}>
    <div className={`journey-reveal status-card-reveal ${!lateStage ? "is-open" : ""}`} inert={lateStage} aria-hidden={lateStage}><div className="journey-reveal-inner"><DeliveryStatusCard status={status} /></div></div>
    <DeliveryTimeline status={status} onUpdates={() => setPanel("updates")} />
    <ShippingJourney visible={status === "shipped"} journeyStage={journeyStage} delayProgress={delayProgress} />
    {status !== "delivered" && <div className="customer-open-box"><OpenBoxCard onChecks={() => onAction("checks")} /></div>}
    <LastMileDelivery visible={status === "outForDelivery"} onChat={() => onAction("chat")} />
    {status === "cancelled" && <CancelledDelivery onReason={() => onAction("cancelReason")} onReschedule={() => onAction("reschedule")} />}
    {status === "rescheduled" && <section className="order-card rescheduled-card"><span className="success-mark"><Icon name="check" /></span><h2>Your delivery has been rescheduled</h2><p>A new delivery attempt is confirmed for <strong>Fri, 21 Jul</strong>.</p><p>Rahul is on the way to your location.</p><button className="primary-button" onClick={() => onAction("arrived")}>View delivery status</button><button className="text-button" onClick={() => onAction("chat")}>Chat with your delivery partner <Icon name="chevron" /></button></section>}
    {status === "arrived" && <ArrivedDelivery onChat={() => onAction("chat")} onInspect={() => onAction("otp")} />}
    {status === "delivered" && <DeliveredCards ratingVisible={ratingVisible} rated={rated} productRating={productRating} deliveryRating={deliveryRating} onRateProduct={value => { onRateProduct(value); if (!ratingVisible) onAction("rating"); }} onRateDelivery={onRateDelivery} onSubmitRating={() => onAction("rated")} onReturn={() => onAction("return")} />}
    {status !== "delivered" && <><section className="order-card action-card"><div className="action-copy"><h2>Need help?</h2><p>We’re here to help with your order.</p><button className="primary-button" onClick={() => setPanel("help")}>Get help</button></div><ImageSlot src={orderImages.help} className="action-image" /></section><section className="order-card action-card"><div className="action-copy"><h2>Delivery instructions</h2><p>Leave instructions for your delivery.</p><button className="primary-button" onClick={() => { setInstructions(order.instructions); setPanel("instructions"); }}>{saved ? "Edit instructions" : "Add instructions"}</button></div><ImageSlot src={orderImages.instructions} className="action-image" /></section></>}
  </div></main>{panel && <OrderModal title={panel === "updates" ? "Delivery updates" : panel === "help" ? "How can we help?" : "Delivery instructions"} onClose={() => setPanel(null)}>{panel === "updates" && <><p><strong>{deliveryStates[status].title}</strong></p><p>{deliveryStates[status].message}</p><ol className="order-update-list"><li>Order confirmed · Sun, 16 Jul</li>{status !== "confirmed" && <li>Shipped · Tue, 18 Jul</li>}{status === "shipped" && <li>{["Item picked up from seller", "Reached Flipkart facility", "Reached nearest delivery hub", "Waiting to leave the delivery hub"][journeyStage]}</li>}{lateStage && <li>Out for delivery · Fri, 21 Jul</li>}{status === "cancelled" && <li>Delivery attempt cancelled · Flood</li>}{status === "arrived" && <li>Delivery partner arrived at your location</li>}{status === "delivered" && <li>Delivered · Fri, 21 Jul</li>}</ol></>}{panel === "help" && <><p>{deliveryStates[status].message}</p><button className="text-button" onClick={() => setPanel("updates")}>Track my delivery <Icon name="chevron" /></button></>}{panel === "instructions" && <form onSubmit={event => { event.preventDefault(); updateOrder(order.id,{instructions}); setSaved(true); setPanel(null); }}><label htmlFor="instructions">What should your delivery partner know?</label><textarea id="instructions" maxLength={300} value={instructions} onChange={event => setInstructions(event.target.value)} /><button className="primary-button" type="submit">Save instructions</button></form>}</OrderModal>}{saved && <p className="saved-note" role="status">Delivery instructions updated.</p>}</div>;
}


