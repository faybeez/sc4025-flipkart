import Link from "next/link";
import { Icon } from "@/components/orders/icon";
import { ImageSlot } from "@/components/orders/image-slot";
import { issueSteps, parcelAssets } from "./parcels-data";
export default function ParcelIssues() {
  return <div className="mobile-shell parcel-issues-page"><header className="order-header"><Link href="/drivers/parcels/cancelled" className="icon-button" aria-label="Back to parcels"><Icon name="back" /></Link><h1>Issues &amp; next steps</h1></header><main className="parcel-issues-main"><section className="issues-intro"><div><h2>Why is a parcel in Issues?</h2><p>Issues contains parcels that could not be delivered and need a hub update.</p></div><ImageSlot src={parcelAssets.overview} className="issues-hero" /></section><p className="parcel-info"><ImageSlot src={parcelAssets.info} className="parcel-small-icon" /><span>An attempt may be cancelled automatically when no safe route is available. The order itself is not cancelled. The parcel stays in Issues until the hub updates its status.</span></p><h2>What to do next</h2><ol className="issue-next-steps">{issueSteps.map((step,index) => <li key={step.title}><ImageSlot src={step.image} className="issue-step-image" /><div><h3>{index + 1}. {step.title}</h3><p>{step.description}</p></div></li>)}</ol></main></div>;
}

