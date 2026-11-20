"use client";
import Link from "next/link";
import { useDemoOrder } from "@/lib/demo/store";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { Icon } from "./icon";
import { ImageSlot } from "./image-slot";
import { orderImages } from "./order-data";
import { demoAssets } from "@/components/demo-assets";
export function OrderHeader({ title = "Order Details", onBack }: { title?: string; onBack?: () => void }) {
  return <header className="order-header">{onBack ? <button className="icon-button" aria-label="Back" onClick={onBack}><Icon name="back" /></button> : <Link href="/" className="icon-button" aria-label="Back to demos"><Icon name="back" /></Link>}<h1>{title}</h1><span className="icon-button" aria-hidden="true"><Icon name="search" /></span><span className="icon-button" aria-hidden="true"><Icon name="cart" /><span className="cart-count">26</span></span></header>;
}
export function ProductSummary({ compact = false }: { compact?: boolean }) {
  const order = useDemoOrder();
  return <>{!compact && <p className="order-id">Order ID - {order.orderNumber}</p>}<section className="product-summary" aria-label="Ordered product"><div className="product-copy"><h2>{order.product}</h2><p>{order.color}</p>{!compact && <p>Seller: {order.seller}</p>}<div className="price-row"><strong>{order.price}</strong>{!compact && <span className="offers">{order.offers} offers</span>}</div></div><ImageSlot src={orderImages.product} className="product-image" /></section></>;
}
export function OpenBoxCard({ onChecks }: { onChecks?: () => void }) {
  return <section className="order-card"><div className="card-heading"><h2>Open Box Delivery</h2>{onChecks ? <button data-demo-tap="checks" className="text-button" onClick={onChecks}>View Checks</button> : <Link className="text-button" href="/orders/details/checks">View Checks</Link>}</div><div className="checks">{[{ image: demoAssets.sealedPackage, text: "Sealed package will be opened" }, { image: demoAssets.inspectionMagnifier, text: "Checks will be performed" }, { image: demoAssets.otpConfirmation, text: "Share OTP to confirm delivery" }].map(item => <div className="check-item" key={item.image}><ImageSlot src={item.image} className="open-box-step-image" /><p>{item.text}</p></div>)}</div></section>;
}
export function OrderModal({ title, onClose, children, className = "" }: { title: string; onClose: () => void; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog className={`order-modal ${className}`} ref={ref} aria-labelledby={titleId} onCancel={event => { event.preventDefault(); onClose(); }}><div className="card-heading"><h2 id={titleId}>{title}</h2><button className="icon-button" aria-label="Close" onClick={onClose}><Icon name="close" /></button></div>{children}</dialog>;
}

