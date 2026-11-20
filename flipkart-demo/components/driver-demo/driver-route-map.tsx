"use client";
import { useState } from "react";
import { useDemoOrder } from "@/lib/demo/store";
import { Icon } from "@/components/orders/icon";
import { ImageSlot } from "@/components/orders/image-slot";
import { driverDemoAssets as assets, type DriverStep } from "./driver-demo-data";

export default function DriverRouteMap({ route = "standard", progress = 0, onBack, onChat, onInstructions, compact = false, onExpand }: { route?: DriverStep["route"]; progress?: number; onBack: () => void; onChat: () => void; onInstructions: () => void; compact?: boolean; onExpand?: () => void }) {
  const order = useDemoOrder();
  const [zoom, setZoom] = useState(1);
  const [muted, setMuted] = useState(false);
  const flooded = route === "flood" || route === "expanding" || route === "blocked";
  const arrived = route === "arrived";
  return <section className={`driver-route-map ${compact ? "map-compact" : ""} driver-route-${route}`} aria-label={flooded ? "Flood affected delivery route" : arrived ? "Delivery destination reached" : "Current delivery route"}>
    <div className="driver-map-camera" style={{ transform: `scale(${zoom})` }}><div className={`driver-map-image ${!flooded ? "is-active" : ""}`} style={{ backgroundImage: `url("${assets.normalMap}")` }} /><div className={`driver-map-image ${flooded ? "is-active" : ""}`} style={{ backgroundImage: `url("${assets.floodMap}")` }} /><div className="driver-map-image driver-blocked-map" style={{ backgroundImage: `url("${assets.blockedMap}")`, opacity: route === "blocked" ? 1 : route === "expanding" ? Math.max(0,(progress - .5) * 2) : 0 }} />{(route === "expanding" || route === "blocked") && <div className="driver-growing-flood" style={{ transform: `translate(-50%,-50%) scale(${route === "blocked" ? 1.5 : .7 + Math.min(1,progress) * .8})` }} />}</div>
    {!compact && <><div className="driver-turn-card">{arrived ? <div className="driver-arrival-banner"><Icon name="pin" /><div><h2>You have arrived</h2><p>Check the customer delivery instructions.</p></div></div> : <ImageSlot src={flooded ? assets.turnFlood : assets.turnNormal} className="driver-turn-image" />}</div><button data-demo-tap="driver-map-back" className="driver-map-back" aria-label="Back to delivery" onClick={onBack}><Icon name="back" /></button><div className="driver-map-controls"><button aria-label="Zoom in" onClick={() => setZoom(value => Math.min(1.8,value + .2))}>+</button><button aria-label="Zoom out" onClick={() => setZoom(value => Math.max(1,value - .2))}>−</button><button aria-label="Recenter map" onClick={() => setZoom(1)}><ImageSlot src={assets.recenter} className="map-control-icon" /></button></div></>}
    {route === "updated" && <span className="driver-map-toast" role="status">Route refreshed · following the best route</span>}
    {route === "flood" && <span className="driver-map-toast flood-toast" role="status">Flood ahead · safer route found</span>}
    {(route === "expanding" || route === "blocked") && <span className="driver-map-toast blocked-toast" role="status">Flood expanding · no safe route available</span>}
    {compact ? <button data-demo-tap="driver-map" className="driver-expand-map" onClick={onExpand}><Icon name="inspect" />View full map and navigation</button> : <div className="driver-route-bottom"><div className={`driver-journey-time ${arrived ? "driver-arrival-time" : ""}`}><div><strong>{arrived ? "Arrived" : flooded ? "45 min" : "15 min"}</strong>{flooded && <span className="route-optimised">Route optimised</span>}<p>{arrived ? "You’ve reached the delivery address" : flooded ? "Arrival 3:15 PM · Previously 2:45 PM" : `${order.distance} km · Arrival ${order.arrival}`}</p></div><button aria-label={muted ? "Enable voice guidance" : "Mute voice guidance"} aria-pressed={!muted} onClick={() => setMuted(value => !value)}><ImageSlot src={assets.voice} className="route-voice-icon" /></button></div><div className="driver-map-shortcuts"><button data-demo-tap="driver-map-chat" onClick={onChat}>Customer chat</button><button data-demo-tap="driver-map-instructions" onClick={onInstructions}>Delivery instructions <Icon name="chevron" /></button></div></div>}
  </section>;
}



