"use client";
import { createContext, createElement, useContext, useSyncExternalStore, type ReactNode } from "react";
import initial from "./seed.json";
import { getSupabase } from "./supabase";
import type { DemoOrder, DemoDriver, Entity, SharedMessage, SyncStatus } from "./types";

type Snapshot = { entities: Record<string,Entity>; messages: SharedMessage[]; status: SyncStatus; error: string | null; pending: number };
const initialEntities = Object.fromEntries(Object.entries(initial).map(([id,data]) => [id,{id,data,revision:0,updated_at:""}])) as Record<string,Entity>;
const serverSnapshot: Snapshot = { entities: initialEntities, messages: [], status: "connecting", error: null, pending: 0 };
let snapshot = serverSnapshot;
const listeners = new Set<() => void>();
let patches: Record<string,Record<string,unknown>> = {};
let messageQueue: SharedMessage[] = [];
let connection: Promise<void> | null = null;
let initialized = false, flushing = false;
let saveTimer: ReturnType<typeof setTimeout> | undefined;
const CACHE = "flipkart-mvp-pending-v1";
function emit(update: Partial<Snapshot>) { snapshot = { ...snapshot,...update,pending:Object.keys(patches).length + messageQueue.length }; listeners.forEach(listener => listener()); }
function saveQueue() { try { localStorage.setItem(CACHE,JSON.stringify({patches,messages:messageQueue})); } catch { /* The UI still reports unsaved changes when browser storage is unavailable. */ } }
function mergeEntity(row: Entity) {
  const current = snapshot.entities[row.id];
  if (current && current.revision > row.revision) return;
  emit({ entities: { ...snapshot.entities,[row.id]: { ...row,data:{...row.data,...patches[row.id]} } } });
}
function mergeMessage(message: SharedMessage) {
  const messages = new Map(snapshot.messages.map(item => [item.id,item])); messages.set(message.id,message);
  emit({ messages:[...messages.values()].sort((a,b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id)) });
}
async function refresh() {
  const client = getSupabase(); if (!client) return;
  const [entities,messages] = await Promise.all([client.from("demo_entities").select("*"),client.from("demo_messages").select("*").order("created_at").limit(1000)]);
  if (entities.error) throw entities.error;
  if (messages.error) throw messages.error;
  for (const row of entities.data as Entity[]) mergeEntity(row);
  for (const message of messages.data as SharedMessage[]) mergeMessage(message);
}
export async function connectDemo() {
  if (connection) return connection;
  const client = getSupabase();
  if (!client) { emit({ status:"not-configured",error:"Start local Supabase with npm run db:setup, then restart the app." }); return; }
  connection = (async () => {
    if (snapshot.status !== "synced" && snapshot.status !== "saving") emit({ status:"connecting",error:null });
    const { data: { session },error } = await client.auth.getSession();
    if (error) throw error;
    if (!session) { const result = await client.auth.signInAnonymously(); if (result.error) throw result.error; }
    await refresh();
    emit({ status:Object.keys(patches).length || messageQueue.length ? "saving" : "synced",error:null });
    void flush();
  })().catch(error => { emit({status:"offline",error:error instanceof Error ? error.message : String(error?.message || error)}); }).finally(() => { connection = null; });
  return connection;
}
export function initializeDemo() {
  if (initialized) return; initialized = true;
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE) || "{}");
    if (cached.patches && typeof cached.patches === "object") {
      patches = Object.fromEntries(Object.entries(cached.patches).filter(([id]) => !!initialEntities[id])) as typeof patches;
      for (const [id,patch] of Object.entries(patches)) mergeEntity({...initialEntities[id],data:{...initialEntities[id].data,...patch}});
    }
    if (Array.isArray(cached.messages)) { messageQueue = cached.messages; for (const message of messageQueue) mergeMessage(message); }
  } catch { /* Ignore invalid cached drafts, retaining the server as the source of truth. */ }
  void connectDemo();
  const client = getSupabase();
  if (client) client.channel("flipkart-shared-workspace")
    .on("postgres_changes",{event:"*",schema:"public",table:"demo_entities"},event => { if (event.new && "id" in event.new) mergeEntity(event.new as Entity); })
    .on("postgres_changes",{event:"INSERT",schema:"public",table:"demo_messages"},event => mergeMessage(event.new as SharedMessage))
    .subscribe(status => { if (status === "SUBSCRIBED") void connectDemo(); if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") emit({status:"offline",error:"Live connection interrupted. Retrying automatically."}); });
  window.addEventListener("online",() => { void connectDemo(); });
  window.addEventListener("focus",() => { void connectDemo(); });
  window.setInterval(() => { if (navigator.onLine) void connectDemo(); },5000);
}
export function updateEntities(changes: Record<string,Record<string,unknown>>) {
  const entities = {...snapshot.entities};
  for (const [id,patch] of Object.entries(changes)) {
    if (!entities[id]) throw new Error("Unknown demo record");
    patches[id] = {...patches[id],...patch};
    entities[id] = {...entities[id],data:{...entities[id].data,...patch}};
  }
  emit({entities,status:getSupabase() ? "saving" : "not-configured",error:snapshot.status === "synced" ? null : snapshot.error});
  saveQueue(); clearTimeout(saveTimer); saveTimer = setTimeout(() => { void flush(); },180);
}
export function updateOrder(id: string, patch: Partial<DemoOrder>) { updateEntities({[`order:${id}`]:patch}); }
export function updateDriver(patch: Partial<DemoDriver>) { updateEntities({driver:patch}); }
async function flush() {
  const client = getSupabase(); if (!client || flushing) return;
  flushing = true;
  try {
    const {data:{session}} = await client.auth.getSession(); if (!session) throw new Error("Waiting for local database sign-in.");
    while (Object.keys(patches).length || messageQueue.length) {
      const batch = Object.entries(patches).map(([id,patch]) => ({id,patch:{...patch}}));
      if (batch.length) {
        const result = await client.rpc("apply_demo_changes",{p_changes:batch});
        if (result.error) throw result.error;
        for (const {id,patch} of batch) {
          for (const [key,value] of Object.entries(patch)) if (JSON.stringify(patches[id]?.[key]) === JSON.stringify(value)) delete patches[id][key];
          if (!Object.keys(patches[id] || {}).length) delete patches[id];
        }
        for (const entity of result.data as Entity[]) mergeEntity(entity);
      }
      const messages = [...messageQueue];
      for (const message of messages) {
        const {error} = await client.from("demo_messages").insert({...message,user_id:session.user.id});
        if (error && error.code !== "23505") throw error;
        messageQueue = messageQueue.filter(item => item.id !== message.id);
      }
      saveQueue();
    }
    emit({status:"synced",error:null});
  } catch (error) { emit({status:"offline",error:error instanceof Error ? error.message : String((error as {message?:string})?.message || error)}); saveQueue(); }
  finally { flushing = false; }
}
export async function uploadAttachment(file: File, orderId: string) {
  if (file.size > 10 * 1024 * 1024) throw new Error("Please choose a file smaller than 10 MB.");
  await connectDemo();
  const client = getSupabase(); if (!client) throw new Error("Local database is not configured.");
  const {data:{session}} = await client.auth.getSession(); if (!session) throw new Error("Connect to the local database before attaching a file.");
  const extension = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi,"").toLowerCase() || "bin";
  const path = `${session.user.id}/${orderId}/${crypto.randomUUID()}.${extension}`;
  const {error} = await client.storage.from("demo-attachments").upload(path,file,{contentType:file.type}); if (error) throw error;
  return path;
}
export async function sendMessage(orderId: string, sender: SharedMessage["sender"], text: string, file?: File) {
  const path = file ? await uploadAttachment(file,orderId) : null;
  if (!text.trim() && !path) return;
  const message: SharedMessage = {id:crypto.randomUUID(),order_id:orderId,sender,body:text.trim(),attachment_name:file?.name || null,attachment_path:path,created_at:new Date().toISOString()};
  messageQueue.push(message); mergeMessage(message); saveQueue();
  emit({status:getSupabase() ? "saving" : "not-configured"}); void flush();
}
export async function openAttachment(path: string) {
  const client = getSupabase(); if (!client) return;
  const {data,error} = await client.storage.from("demo-attachments").createSignedUrl(path,300);
  if (error) throw error;
  window.open(data.signedUrl,"_blank","noopener,noreferrer");
}
export function useSharedDemo() {
  return useSyncExternalStore(listener => { listeners.add(listener); return () => { listeners.delete(listener); }; },() => snapshot,() => serverSnapshot);
}
const OrderContext = createContext("FMPP4197078643");
export function DemoOrderScope({ id, children }: { id: string; children: ReactNode }) { return createElement(OrderContext.Provider,{value:id},children); }
export function useDemoOrder(id?: string) { const scopedId = useContext(OrderContext); return useSharedDemo().entities[`order:${id || scopedId}`].data as unknown as DemoOrder; }
export function useDemoDriver() { return useSharedDemo().entities.driver.data as unknown as DemoDriver; }
export function getOrders(state: Snapshot) { return Object.values(state.entities).filter(entity => entity.id.startsWith("order:")).map(entity => entity.data as unknown as DemoOrder); }
export function setDeliveryStatus(id: string, status: DemoOrder["status"]) {
  const driver = snapshot.entities.driver.data as unknown as DemoDriver;
  const driverPatch: Partial<DemoDriver> = {};
  if (["outForDelivery","rescheduled","arrived"].includes(status) && (!driver.activeOrderId || driver.activeOrderId === id)) {
    driverPatch.activeOrderId = id; driverPatch.route = status === "arrived" ? "arrived" : "standard";
  } else if (driver.activeOrderId === id && ["confirmed","shipped","cancelled","delivered"].includes(status)) driverPatch.activeOrderId = null;
  driverPatch.cancelledOrderIds = status === "cancelled" ? [...new Set([...driver.cancelledOrderIds,id])] : driver.cancelledOrderIds.filter(item => item !== id);
  driverPatch.delivered = getOrders(snapshot).filter(order => (order.id === id ? status : order.status) === "delivered").length;
  if (status === "cancelled") driverPatch.route = "blocked";
  updateEntities({[`order:${id}`]:{status},driver:driverPatch});
}
export function startDelivery(id: string) {
  const driver = snapshot.entities.driver.data as unknown as DemoDriver;
  if (driver.activeOrderId && driver.activeOrderId !== id) throw new Error("Complete the current delivery before starting another.");
  setDeliveryStatus(id,"outForDelivery");
}

