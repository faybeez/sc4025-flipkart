import Link from "next/link";
import { Icon } from "./icon";
import { ImageSlot } from "./image-slot";
import { openBoxContent as content } from "./open-box-data";
export function InspectionChecklist() {
  return <section className="inspection-section" aria-labelledby="checks-heading"><h2 id="checks-heading">What to check</h2><ol className="inspection-list">{content.checks.map((check,index) => <li className="inspection-card" key={check.id}><ImageSlot src={check.image} className="inspection-image" /><div><h3>{index + 1}. {check.title}</h3><p>{check.description}</p>{check.note && <p className="inspection-note">{check.note}</p>}</div></li>)}</ol></section>;
}
function DeliverySupport() {
  return <section className="delivery-support" aria-labelledby="support-heading"><div className="support-copy"><h2 id="support-heading">Need help?</h2><p>Something wrong with your item?<br />Call support before sharing your OTP.</p>{content.supportPhone ? <a className="primary-button call-button" href={`tel:${content.supportPhone}`}>Call</a> : <><button className="primary-button call-button" disabled aria-describedby="support-unavailable">Call</button><span className="support-unavailable" id="support-unavailable">Support number not added yet.</span></>}</div><ImageSlot src={content.supportImage} className="support-image" /></section>;
}
export default function OpenBoxDetails({ onBack }: { onBack?: () => void }) {
  return <div className="mobile-shell open-box-page"><header className="order-header">{onBack ? <button data-demo-tap="checks-back" className="icon-button" aria-label="Back to order details" onClick={onBack}><Icon name="back" /></button> : <Link href="/orders/details" className="icon-button" aria-label="Back to order details"><Icon name="back" /></Link>}<h1>{content.title}</h1></header><main className="open-box-main"><section className="inspection-intro" aria-labelledby="inspection-title"><ImageSlot src={content.heroImage} className="inspection-hero-image" /><div><h2 id="inspection-title">{content.introduction}</h2><p>{content.description}</p></div></section><aside className="otp-reminder"><ImageSlot src={content.reminderImage} className="reminder-image" /><p>{content.reminder}</p></aside><InspectionChecklist /><DeliverySupport /></main></div>;
}
