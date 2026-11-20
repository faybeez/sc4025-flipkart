"use client";
import Link from "next/link";
import { getOrders, useSharedDemo, updateDriver, useDemoDriver } from "@/lib/demo/store";
import { useEffect, useRef, useState } from "react";
import { ImageSlot } from "@/components/orders/image-slot";
import { Icon } from "@/components/orders/icon";
import { parcelAssets, parcelDay, type Parcel } from "./parcels-data";

type Filter = "pending" | "delivered" | "issues";
export type ParcelScenario = "ready" | "inProgress" | "cancelled";
function StartDeliverySheet({ parcel, onCancel, onConfirm }: { parcel: Parcel | null; onCancel: () => void; onConfirm: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (parcel && !ref.current?.open) ref.current?.showModal(); else if (!parcel) ref.current?.close(); }, [parcel]);
  return <dialog ref={ref} className="parcel-start-sheet" aria-labelledby="start-delivery-heading" onCancel={event => { event.preventDefault(); onCancel(); }}><div className="sheet-handle" /><h2 id="start-delivery-heading">Start this delivery?</h2>{parcel && <><strong>{parcel.name}</strong><p><ImageSlot src={parcelAssets.pin} className="parcel-small-icon" />{parcel.address}</p><p><ImageSlot src={parcelAssets.clock} className="parcel-small-icon" />{parcel.minutes} min away · {parcel.distance < 1 ? `${parcel.distance * 1000} m` : `${parcel.distance} km`}</p></>}<p className="sheet-explanation">This parcel becomes your current delivery.</p><div className="sheet-actions"><button onClick={onCancel}>Cancel</button><button className="parcel-primary" onClick={onConfirm}>Start delivery</button></div></dialog>;
}
function ParcelCard({ parcel, active, locked, nearest, onStart, onContinue }: { parcel: Parcel; active: boolean; locked: boolean; nearest: boolean; onStart: () => void; onContinue: () => void }) {
  return <article className={`parcel-card ${active ? "parcel-active" : ""}`}><div className="parcel-card-top"><h3>{parcel.name}</h3><div className="parcel-badges">{nearest && <span>Nearest</span>}{active && <span>In progress</span>}</div></div><p>{parcel.id}</p><p>{parcel.address}</p><p className="parcel-distance"><ImageSlot src={parcelAssets.pin} className="parcel-small-icon" />{parcel.distance < 1 ? `${parcel.distance * 1000} m` : `${parcel.distance} km`} away</p><footer><strong><ImageSlot src={parcelAssets.clock} className="parcel-small-icon" />{parcel.minutes} min away</strong>{active ? <button className="parcel-continue" onClick={onContinue}>Continue delivery <Icon name="chevron" /></button> : <button data-demo-tap={`parcel-start-${parcel.id}`} className="parcel-primary" disabled={locked} onClick={onStart}>{locked && <Icon name="lock" />}Start delivery</button>}</footer></article>;
}
export default function ParcelsPage({ activeParcel, onStart, onContinue, onReset, onSelectParcel, hideDemoControls = false, counts, initialScenario = "ready" }: { counts?: { pending: number; delivered: number }; onSelectParcel?: (parcel: Parcel) => void; hideDemoControls?: boolean; initialScenario?: ParcelScenario; activeParcel: Parcel | null; onStart: (parcel: Parcel) => void; onContinue: () => void; onReset: () => void }) {
  const shared = useSharedDemo(); const driver = useDemoDriver();
  const parcels = getOrders(shared).filter(order => order.status !== "delivered").map(order => ({id:order.id,name:order.recipient,address:order.address,distance:order.distance,minutes:order.minutes}));
  const cancelledParcels = parcels.filter(parcel => driver.cancelledOrderIds.includes(parcel.id)).map(parcel => ({...parcel,reason:"No safe route · Flood"}));
  const [filter, setFilter] = useState<Filter>(initialScenario === "cancelled" ? "issues" : "pending");
  const [scenario, setScenario] = useState<ParcelScenario>(initialScenario);
  const [selected, setSelected] = useState<Parcel | null>(null);
  const [sort, setSort] = useState("nearest");
  const date = driver.date;
  const setDate = (value: string) => updateDriver({date:value});
  const issuesCount = cancelledParcels.length;
  const pendingCount = (counts?.pending ?? (driver.assigned - driver.delivered - issuesCount));
  const deliveredCount = counts?.delivered ?? driver.delivered;
  const ordered = [...parcels].filter(parcel => !cancelledParcels.some(issue => issue.id === parcel.id)).sort((a,b) => sort === "name" ? a.name.localeCompare(b.name) : sort === "farthest" ? b.distance - a.distance : a.distance - b.distance);
  const hasDateData = date === parcelDay.date;
  function changeScenario(value: ParcelScenario) {
    setScenario(value); setFilter(value === "cancelled" ? "issues" : "pending");
    if (value === "inProgress") onStart(parcels[0]); else onReset();
  }
  return <div className="parcels-page"><div className="parcel-date"><span>{new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${date || parcelDay.date}T00:00:00Z`))}</span><label aria-label="Delivery date"><ImageSlot src={parcelAssets.calendar} className="parcel-calendar" /><input type="date" aria-label="Delivery date" value={date} onChange={event => { if (event.target.value) setDate(event.target.value); }} /></label></div><div className="parcel-filters" role="tablist" aria-label="Parcel status">{([{ id: "pending", label: "Pending", count: pendingCount }, { id: "delivered", label: "Delivered", count: deliveredCount }, { id: "issues", label: "Issues", count: issuesCount }] as const).map(item => <button role="tab" key={item.id} id={`parcel-tab-${item.id}`} aria-selected={filter === item.id} aria-controls="parcel-panel" onClick={() => setFilter(item.id)}>{item.label} ({hasDateData ? item.count : 0})</button>)}</div><section id="parcel-panel" role="tabpanel" aria-labelledby={`parcel-tab-${filter}`}>
    {!hasDateData ? <div className="parcel-empty"><h2>No parcels for this date</h2><p>Select 25 Oct 2026 to view the demo deliveries.</p></div> : filter === "pending" ? <><div className="parcel-list-toolbar"><p>{pendingCount} pending parcels</p><label>Sort: <select aria-label="Sort parcels" value={sort} onChange={event => setSort(event.target.value)}><option value="nearest">Nearest</option><option value="farthest">Farthest</option><option value="name">Name</option></select></label></div>{activeParcel ? <p className="parcel-info"><ImageSlot src={parcelAssets.info} className="parcel-small-icon" />Complete your current delivery before starting another.</p> : <p className="parcel-hint">Choose a parcel to begin delivery.</p>}<div className="parcel-list">{ordered.map(parcel => <ParcelCard key={parcel.id} parcel={parcel} nearest={parcel.id === ordered[0]?.id} active={activeParcel?.id === parcel.id} locked={!!activeParcel} onStart={() => onSelectParcel ? onSelectParcel(parcel) : setSelected(parcel)} onContinue={onContinue} />)}</div></> : filter === "issues" ? <><Link className="parcel-issues-link" href="/drivers/parcels/issues"><ImageSlot src={parcelAssets.info} className="parcel-small-icon" />What should I do next?</Link>{issuesCount ? <><div className="parcel-list">{cancelledParcels.map(parcel => <article className="parcel-card parcel-issue-card" key={parcel.id}><div className="parcel-card-top"><h3>{parcel.name}</h3><span className="issue-badge">Attempt cancelled</span></div><p>{parcel.id}</p><p>{parcel.address}</p><div className="parcel-issue-reason"><ImageSlot src={parcelAssets.warning} className="parcel-warning" /><div><strong>{parcel.reason}</strong><p>Cancelled automatically by system.</p></div></div></article>)}</div><p className="parcel-hint">These parcels stay in Issues until your hub updates their status.</p></> : <div className="parcel-empty"><h2>No delivery issues</h2><p>Parcels needing a hub update will appear here.</p></div>}</> : <div className="parcel-empty"><h2>{deliveredCount} parcels delivered</h2><p>Completed deliveries for this day. Individual delivery records have not been added to this demo.</p></div>}
    </section>{!hideDemoControls && <fieldset className="delivery-demo-control parcel-demo"><legend>Demo parcel state</legend>{([{ value: "ready", label: "No delivery started" }, { value: "inProgress", label: "Delivery in progress" }, { value: "cancelled", label: "Cancelled deliveries" }] as const).map(item => <label key={item.value}><input type="radio" name="parcel-scenario" checked={item.value === (activeParcel ? "inProgress" : scenario)} onChange={() => changeScenario(item.value)} />{item.label}</label>)}</fieldset>}<StartDeliverySheet parcel={selected} onCancel={() => setSelected(null)} onConfirm={() => { if (selected) { onStart(selected); setScenario("inProgress"); setSelected(null); } }} /></div>;
}





