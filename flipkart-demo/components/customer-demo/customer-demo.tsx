"use client";
import { useEffect, useState } from "react";
import DemoSidebar, { OrderEditor, OrderPicker } from "@/components/shared/demo-sidebar";
import OrderDetails, { type CustomerAction } from "@/components/orders/order-details";
import OpenBoxDetails from "@/components/orders/open-box-details";
import ChatScreen from "@/components/chat/chat-screen";
import { customerQuickMessages } from "@/components/chat/chat-data";
import { lastMileDelivery, type DeliveryStatus } from "@/components/orders/delivery-data";
import { DemoOrderScope, openAttachment, sendMessage, setDeliveryStatus, updateOrder, useDemoOrder, useSharedDemo } from "@/lib/demo/store";
import { FloodReason, OtpWarning } from "./lifecycle-cards";
import ReturnFlow from "./return-flow";

type View = "order" | "checks" | "chat" | "rating" | "return" | "review" | "refund";
const statuses: [DeliveryStatus,string][] = [["confirmed","Order confirmed"],["shipped","Shipped"],["outForDelivery","Out for delivery"],["cancelled","Cancelled · flood"],["rescheduled","Rescheduled"],["arrived","Arrived at destination"],["delivered","Delivered"]];
export default function CustomerDemo({ initialStep = "confirmed" }: { initialStep?: string }) {
  const [orderId,setOrderId] = useState("FMPP4197078643");
  const [view,setView] = useState<View>("order");
  const [overlay,setOverlay] = useState<"cancelReason" | "otp" | null>(null);
  const order = useDemoOrder(orderId);
  const state = useSharedDemo();
  useEffect(() => {
    if (initialStep === "arrived" || initialStep === "cancelled") setDeliveryStatus("FMPP4197078643",initialStep);
  },[initialStep]);
  function action(value: CustomerAction) {
    if (value === "checks") setView("checks");
    else if (value === "chat") setView("chat");
    else if (value === "cancelReason" || value === "otp") setOverlay(value);
    else if (value === "reschedule") setDeliveryStatus(orderId,"rescheduled");
    else if (value === "arrived") setDeliveryStatus(orderId,"arrived");
    else if (value === "rated") { updateOrder(orderId,{ratingSubmitted:true}); setView("rating"); }
    else setView(value);
  }
  const messages = state.messages.filter(message => message.order_id === orderId).map(message => ({ id:message.id,sender:message.sender === "customer" ? "self" as const : "contact" as const,text:message.body,time:new Intl.DateTimeFormat("en",{hour:"numeric",minute:"2-digit"}).format(new Date(message.created_at)),attachmentName:message.attachment_name || undefined,attachmentPath:message.attachment_path || undefined }));
  const returnDetails = {reason:order.returnReason,description:order.returnDescription,attachment:order.returnAttachment,address:order.returnAddress};
  return <div className="customer-player manual-demo"><DemoSidebar audience="Customer" onReset={() => {setView("order");setOverlay(null);}}><OrderPicker value={orderId} onChange={id => {setOrderId(id);setView("order");setOverlay(null);}} /><label className="state-field">Delivery state<select aria-label="Delivery state" value={order.status} onChange={event => {setDeliveryStatus(orderId,event.target.value as DeliveryStatus);setView("order");}}>{statuses.map(([id,label]) => <option key={id} value={id}>{label}</option>)}</select></label>{order.status === "shipped" && <label className="state-field">Shipping progress<select aria-label="Shipping progress" value={order.journeyStage} onChange={event => updateOrder(orderId,{journeyStage:Number(event.target.value)})}>{["Item picked up","Flipkart facility","Nearest delivery hub","Hub departure delayed"].map((label,index) => <option key={label} value={index}>{label}</option>)}</select></label>}<div className="state-view-buttons">{([ ["order","Order details"],["checks","Open Box checks"],["chat","Delivery partner chat"],["rating","Ratings"],["return","Request a return"],["refund","Return status"] ] as [View,string][]).map(([id,label]) => <button key={id} aria-pressed={view === id} disabled={id === "refund" && !order.returnSubmitted} onClick={() => setView(id)}>{label}</button>)}</div><OrderEditor orderId={orderId} /></DemoSidebar>
  <DemoOrderScope id={orderId}><div className="customer-phone manual-phone" aria-label="Customer application preview"><div className="customer-phone-viewport">
    {(view === "order" || view === "rating") && <div className="manual-screen" key={`order-${order.status}`}><OrderDetails status={order.status} journeyStage={order.journeyStage} onAction={action} ratingVisible={view === "rating"} rated={order.ratingSubmitted} productRating={order.productRating} deliveryRating={order.deliveryRating} onRateProduct={productRating => updateOrder(orderId,{productRating,ratingSubmitted:false})} onRateDelivery={deliveryRating => updateOrder(orderId,{deliveryRating,ratingSubmitted:false})} /></div>}
    {view === "checks" && <div className="manual-screen"><OpenBoxDetails onBack={() => setView("order")} /></div>}
    {view === "chat" && <div className="demo-chat-layer manual-screen"><ChatScreen key={orderId} open embedded onClose={() => setView("order")} contact={{name:lastMileDelivery.partner,role:"Delivery partner",portrait:lastMileDelivery.portrait,phone:lastMileDelivery.phone}} messages={messages} quickMessages={customerQuickMessages} onSend={(message,file) => sendMessage(orderId,"customer",message.text,file)} onAttachmentClick={openAttachment} /></div>}
    {(view === "return" || view === "review" || view === "refund") && <div className="manual-screen"><ReturnFlow screen={view} filled={false} details={returnDetails} onChange={details => updateOrder(orderId,{returnReason:details.reason,returnDescription:details.description || "",returnAttachment:details.attachment,returnAddress:details.address})} onEdit={() => setView("return")} onNext={() => {if (view === "return") setView("review"); else {updateOrder(orderId,{returnSubmitted:true});setView("refund");}}} onBack={() => setView(view === "review" ? "return" : "order")} /></div>}
  </div>{overlay === "cancelReason" && <FloodReason onClose={() => setOverlay(null)} />}{overlay === "otp" && <OtpWarning onClose={() => setOverlay(null)} />}</div></DemoOrderScope></div>;
}

