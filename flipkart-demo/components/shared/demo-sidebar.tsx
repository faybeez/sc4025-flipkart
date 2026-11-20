"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { connectDemo, getOrders, updateOrder, useSharedDemo, useDemoOrder } from "@/lib/demo/store";
export function DatabaseStatus() {
  const state = useSharedDemo();
  const text = {connecting:"Connecting to local Supabase…",synced:"Saved to local Supabase",saving:"Saving changes…",offline:"Offline · changes queued", "not-configured":"Local database not configured"}[state.status];
  return <section className={`database-status database-${state.status}`} aria-label="Database connection"><p role="status"><span aria-hidden="true" />{text}</p>{state.pending > 0 && <small>{state.pending} pending {state.pending === 1 ? "change" : "changes"}</small>}{state.error && <p className="database-error">{state.error}</p>}{["offline","not-configured"].includes(state.status) && <button onClick={() => { void connectDemo(); }}>Retry connection</button>}</section>;
}
export default function DemoSidebar({ audience, children, onReset }: { audience: string; children: ReactNode; onReset: () => void }) {
  return <aside className="demo-director manual-controls" aria-label={`${audience} demo state controls`}><p className="demo-director-eyebrow">{audience.toUpperCase()} MVP · STATE CONTROLS</p><h1>{audience === "Customer" ? "Customer experience" : "Delivery partner experience"}</h1><p className="manual-hint">Click through the app. Change delivery states here.</p><DatabaseStatus />{children}<button className="director-clean" onClick={onReset}>Reset view</button><nav className="demo-role-links"><Link href="/orders/details">Customer</Link><Link href="/drivers">Driver</Link></nav></aside>;
}
export function OrderPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const orders = getOrders(useSharedDemo());
  return <label className="state-field">Order / customer<select value={value} onChange={event => onChange(event.target.value)}>{orders.map(order => <option key={order.id} value={order.id}>{order.recipient} · {order.id.slice(-4)}</option>)}</select></label>;
}
export function OrderEditor({ orderId }: { orderId: string }) {
  const order = useDemoOrder(orderId);
  return <details className="order-data-editor"><summary>Edit shared order details</summary><label className="state-field">Customer<input value={order.recipient} onChange={event => updateOrder(orderId,{recipient:event.target.value})} /></label><label className="state-field">Address<textarea value={order.address} onChange={event => updateOrder(orderId,{address:event.target.value})} /></label><label className="state-field">Product<input value={order.product} onChange={event => updateOrder(orderId,{product:event.target.value})} /></label><label className="state-field">Price<input value={order.price} onChange={event => updateOrder(orderId,{price:event.target.value})} /></label><label className="state-field">Expected delivery<input value={order.expectedDelivery} onChange={event => updateOrder(orderId,{expectedDelivery:event.target.value})} /></label><label className="state-field">Arrival time<input value={order.arrival} onChange={event => updateOrder(orderId,{arrival:event.target.value})} /></label><label className="state-field">Delivery instructions<textarea value={order.instructions} onChange={event => updateOrder(orderId,{instructions:event.target.value})} /></label></details>;
}
