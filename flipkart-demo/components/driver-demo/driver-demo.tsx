"use client";
import { useState } from "react";
import DemoSidebar, { OrderEditor, OrderPicker } from "@/components/shared/demo-sidebar";
import { DemoOrderScope, getOrders, openAttachment, sendMessage, setDeliveryStatus, startDelivery, updateDriver, useDemoDriver, useSharedDemo } from "@/lib/demo/store";
import type { DemoRoute } from "@/lib/demo/types";
import ParcelsPage from "@/components/drivers/parcels-page";
import { type Parcel } from "@/components/drivers/parcels-data";
import ChatScreen from "@/components/chat/chat-screen";
import { driverDemoAssets } from "./driver-demo-data";
import { DriverHeader, DriverBottomNav, DriverHome, DriverInstructions } from "./driver-home";
import { DriverCancelled, DriverStartConfirmation } from "./driver-overlays";
import DriverRouteMap from "./driver-route-map";

type View = "home" | "parcels" | "map" | "chat" | "instructions";
export default function DriverDemo({ initialView = "home", showIssues = false }: { initialView?: View; showIssues?: boolean }) {
  const [view,setView] = useState<View>(initialView);
  const [selectedId,setSelectedId] = useState("FMPP4197078643");
  const [overlay,setOverlay] = useState<"start" | "help" | null>(null);
  const [error,setError] = useState("");
  const state = useSharedDemo(), driver = useDemoDriver();
  const orders = getOrders(state);
  const recommended = orders.find(order => order.status !== "cancelled" && order.status !== "delivered") || orders[0];
  const selected = orders.find(order => order.id === (driver.activeOrderId || selectedId)) || recommended;
  const homeOrder = driver.activeOrderId ? selected : selected.status !== "cancelled" && selected.status !== "delivered" ? selected : recommended;
  const displayOrder = view === "home" && !overlay ? homeOrder : selected;
  const asParcel = (order: typeof selected): Parcel => ({id:order.id,name:order.recipient,address:order.address,distance:order.distance,minutes:order.minutes});
  const parcel = asParcel(displayOrder);
  const messages = state.messages.filter(message => message.order_id === selected.id).map(message => ({id:message.id,sender:message.sender === "driver" ? "self" as const : "contact" as const,text:message.body,time:new Intl.DateTimeFormat("en",{hour:"numeric",minute:"2-digit"}).format(new Date(message.created_at)),attachmentName:message.attachment_name || undefined,attachmentPath:message.attachment_path || undefined}));
  function selectParcel(chosen: Parcel) {setSelectedId(chosen.id);setOverlay("start");setError("");}
  const route = driver.route;
  function changeRoute(next: DemoRoute) {updateDriver({route:next});if (next === "arrived") setDeliveryStatus(selected.id,"arrived");if (next === "blocked") setDeliveryStatus(selected.id,"cancelled");setView("map");}
  const cancelled = route === "blocked" && selected.status === "cancelled";
  return <div className="customer-player manual-demo driver-player"><DemoSidebar audience="Driver" onReset={() => {setView("home");setOverlay(null);setError("");}}><OrderPicker value={selected.id} onChange={id => {setSelectedId(id);if (!driver.activeOrderId) setView("home");}} /><p className="active-delivery-label">Active delivery: <strong>{driver.activeOrderId ? orders.find(order => order.id === driver.activeOrderId)?.recipient : "None"}</strong></p><label className="state-field">Route state<select value={route} onChange={event => changeRoute(event.target.value as DemoRoute)}>{([ ["standard","Standard route"],["updated","Route updated"],["flood","Flood · reroute available"],["expanding","Flood expanding"],["blocked","No safe route · cancel attempt"],["arrived","Arrived at destination"] ] as [DemoRoute,string][]).map(([id,label]) => <option key={id} value={id}>{label}</option>)}</select></label><div className="state-view-buttons">{([ ["home","Home"],["parcels","Parcels"],["map","Full navigation"],["chat","Customer chat"],["instructions","Delivery instructions"] ] as [View,string][]).map(([id,label]) => <button key={id} aria-pressed={view === id} onClick={() => setView(id)}>{label}</button>)}</div>{driver.activeOrderId && <button className="director-clean" onClick={() => {setDeliveryStatus(selected.id,"delivered");setView("home");}}>Mark current delivery delivered</button>}<OrderEditor orderId={selected.id} /></DemoSidebar>
  <DemoOrderScope id={displayOrder.id}><div className="customer-phone manual-phone driver-demo-phone" aria-label="Driver application preview"><div className="customer-phone-viewport">
  {(view === "home" || view === "parcels") && <div className="mobile-shell driver-shell driver-demo-app manual-screen"><DriverHeader title={view === "parcels" ? "Parcels" : "Home"} />{view === "home" ? <DriverHome parcel={parcel} active={!!driver.activeOrderId} cancelled={driver.cancelledOrderIds.length > 0} onStart={() => selectParcel(asParcel(homeOrder))} onParcels={() => setView("parcels")} onMap={() => setView("map")} onChat={() => setView("chat")} onInstructions={() => setView("instructions")} /> : <main className="driver-main driver-parcels-main"><ParcelsPage initialScenario={showIssues ? "cancelled" : "ready"} hideDemoControls counts={{pending:driver.assigned-driver.delivered-driver.cancelledOrderIds.length,delivered:driver.delivered}} activeParcel={driver.activeOrderId ? asParcel(selected) : null} onSelectParcel={selectParcel} onStart={selectParcel} onReset={() => setView("parcels")} onContinue={() => setView("home")} /></main>}</div>}
  {view === "map" && <div className="driver-map-scene manual-screen"><DriverRouteMap route={route} progress={route === "expanding" ? .8 : 0} onBack={() => setView("home")} onChat={() => setView("chat")} onInstructions={() => setView("instructions")} /></div>}
  {view === "chat" && <div className="demo-chat-layer manual-screen"><ChatScreen key={selected.id} open embedded contact={{name:selected.recipient,role:"Delivery recipient",portrait:driverDemoAssets.recipient}} onClose={() => setView("home")} messages={messages} quickMessages={["I’m on my way","I’m 15 minutes away","I’ve arrived"]} privacyNote="This conversation is linked to your current delivery." onSend={(message,file) => sendMessage(selected.id,"driver",message.text,file)} onAttachmentClick={openAttachment} /></div>}
  {view === "instructions" && <DriverInstructions parcel={asParcel(selected)} onBack={() => setView("home")} />}
  </div>{(view === "home" || view === "parcels") && <DriverBottomNav active={view === "parcels" ? "Parcels" : "Home"} onHome={() => setView("home")} onParcels={() => setView("parcels")} onHelp={() => setOverlay("help")} />}
  {overlay === "start" && <DriverStartConfirmation parcel={asParcel(selected)} onCancel={() => setOverlay(null)} onConfirm={() => {try {startDelivery(selected.id);setOverlay(null);setView("home");setError("");} catch (cause) {setError(cause instanceof Error ? cause.message : "Could not start delivery.");}}} />}
  {cancelled && view === "map" && <DriverCancelled onClose={() => {updateDriver({route:"standard"});setView("home");}} />}
  {overlay === "help" && <div className="scene-overlay"><section className="scene-dialog"><h2>Driver support</h2><p>Keep the parcel secure and return to the hub when it is safe.</p><button className="primary-button" onClick={() => setOverlay(null)}>Back</button></section></div>}{error && <p className="driver-action-error" role="alert">{error}</p>}
  </div></DemoOrderScope></div>;
}

