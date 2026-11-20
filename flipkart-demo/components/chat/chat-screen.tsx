"use client";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Icon } from "@/components/orders/icon";
import { ImageSlot } from "@/components/orders/image-slot";
import type { ChatContact, ChatMessage } from "./chat-data";
export type ChatScreenProps = {
  open: boolean; onClose: () => void | Promise<void>; contact: ChatContact;
  initialMessages?: ChatMessage[]; quickMessages?: string[]; privacyNote?: string;
  onSend?: (message: ChatMessage, attachment?: File) => void | Promise<void>;
  messages?: ChatMessage[]; onAttachmentClick?: (path: string) => Promise<void>;
  embedded?: boolean; scriptedMessages?: ChatMessage[]; draftPreview?: string;
};
export default function ChatScreen({ open, onClose, contact, initialMessages = [], quickMessages = [], privacyNote = "Keep your OTP private until delivery.", onSend, messages: controlledMessages, onAttachmentClick, embedded = false, scriptedMessages = [], draftPreview }: ChatScreenProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const transcript = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const headingId = useId();
  const [localMessages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [sending, setSending] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState<File | undefined>();
  useEffect(() => {
    if (embedded) return;
    const element = dialog.current;
    if (open && !element?.open) element?.showModal();
    if (!open && element?.open) element.close();
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = overflow; };
  }, [open, embedded]);
  useEffect(() => { if (open && transcript.current) transcript.current.scrollTop = transcript.current.scrollHeight; }, [localMessages, controlledMessages, open, scriptedMessages.length]);
  async function send(text: string, file?: File) {
    if ((!text.trim() && !file) || sending) return false;
    setSending(true); setErrorText("");
    try {
      const message: ChatMessage = { id: crypto.randomUUID(), sender: "self", text: text.trim(), time: new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date()), attachmentName: file?.name };
      await onSend?.(message,file);
      if (!controlledMessages) setMessages(current => [...current,message]);
      return true;
    } catch (error) { setErrorText(error instanceof Error ? error.message : "Could not send this message."); return false; }
    finally { setSending(false); }
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (await send(draft || draftPreview || "",attachment)) {
      setDraft(""); setAttachment(undefined);
      if (fileInput.current) fileInput.current.value = "";
      input.current?.focus();
    }
  }
  const content = <div className="chat-layout">
    <header className="chat-header"><button data-demo-tap="chat-back" className="icon-button" aria-label="Back to delivery details" onClick={onClose}><Icon name="back" /></button><ImageSlot src={contact.portrait} className="chat-portrait" /><div className="chat-contact"><h2 id={headingId}>{contact.name}</h2><p>{contact.role}</p></div>{contact.phone ? <a className="icon-button" href={`tel:${contact.phone}`} aria-label={`Call ${contact.name}`}><Icon name="phone" /></a> : <button className="icon-button" disabled aria-label="Call unavailable until a phone number is added" title="Phone number not added"><Icon name="phone" /></button>}</header>
    <div className="chat-transcript" ref={transcript}><div className="chat-date"><span>Today</span></div><div className="chat-messages" role="log" aria-label="Conversation" aria-relevant="additions">{(controlledMessages ?? [...localMessages, ...scriptedMessages]).map(message => <div key={message.id} className={`chat-bubble ${message.sender === "self" ? "outgoing" : "incoming"}`}><span className="sr-only">{message.sender === "self" ? "You" : contact.name}: </span>{message.text && <p>{message.text}</p>}{message.attachmentName && <p className="chat-attachment"><Icon name="attachment" /><button type="button" className="chat-file-link" disabled={!message.attachmentPath || !onAttachmentClick} onClick={() => { if (message.attachmentPath) void onAttachmentClick?.(message.attachmentPath).catch(error => setErrorText(error.message)); }}>{message.attachmentName}</button></p>}<time>{message.time}</time></div>)}</div><p className="chat-privacy"><Icon name="lock" />{privacyNote}</p></div>
    {quickMessages.length > 0 && <section className="chat-quick" aria-labelledby={`${headingId}-quick`}><h3 id={`${headingId}-quick`}>Quick messages</h3><div>{quickMessages.map(text => <button key={text} disabled={sending} onClick={() => { void send(text); }}>{text}</button>)}</div></section>}
    {errorText && <p className="chat-error" role="alert">{errorText}</p>}<form className="chat-composer" onSubmit={submit}>{attachment && <div className="chat-selected-file"><span>{attachment.name}</span><button type="button" aria-label="Remove attachment" onClick={() => { setAttachment(undefined); if (fileInput.current) fileInput.current.value = ""; }}><Icon name="close" /></button></div>}<input type="file" ref={fileInput} hidden onChange={event => setAttachment(event.target.files?.[0])} /><button className="icon-button chat-attach" type="button" aria-label="Attach a file" onClick={() => fileInput.current?.click()}><Icon name="attachment" /></button><label className="sr-only" htmlFor={`${headingId}-message`}>Type a message</label><input data-demo-tap="chat-input" id={`${headingId}-message`} ref={input} value={draft || draftPreview || ""} onChange={event => setDraft(event.target.value)} maxLength={2000} placeholder="Type a message..." autoComplete="off" /><button data-demo-tap="chat-send" className="chat-send" aria-label="Send message" disabled={sending || (!draft.trim() && !draftPreview?.trim() && !attachment)}><Icon name="send" /></button></form>
    </div>;
  return embedded ? <section className="chat-screen chat-embedded" aria-labelledby={headingId} hidden={!open}>{content}</section> : <dialog className="chat-screen" ref={dialog} aria-labelledby={headingId} onCancel={event => { event.preventDefault(); onClose(); }}>{content}</dialog>;
}



