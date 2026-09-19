"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowUp, Sparkles, X } from "lucide-react";

type Message = { role: "assistant" | "user"; text: string; recommendations?: Array<{ slug: string; name: string; price: string; reason: string }> };

export function AssistantDock() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", text: "Tell me who or what you’re shopping for. I’ll keep the suggestions to the current catalog." }]);

  async function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim() || pending) return;
    const current = message.trim();
    setMessage("");
    setMessages((items) => [...items, { role: "user", text: current }]);
    setPending(true);
    try {
      const response = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: current }) });
      const payload = await response.json() as { reply?: string; recommendations?: Message["recommendations"]; error?: string };
      setMessages((items) => [...items, { role: "assistant", text: payload.reply ?? payload.error ?? "The guide is quiet right now.", recommendations: payload.recommendations }]);
    } catch {
      setMessages((items) => [...items, { role: "assistant", text: "The guide is quiet right now. Try again in a moment." }]);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={`assistant-dock ${open ? "assistant-dock--open" : ""}`}>
      {open && <section className="assistant-panel" aria-label="HUSHWORK shopping guide"><div className="assistant-panel__header"><div><span className="assistant-orbit"><Sparkles size={14} /></span><div><p className="eyebrow">Shopping guide</p><h2>Find the right thing</h2></div></div><button className="icon-button" type="button" onClick={() => setOpen(false)} aria-label="Close shopping guide"><X size={18} /></button></div><div className="assistant-messages">{messages.map((item, index) => <div className={`assistant-message assistant-message--${item.role}`} key={`${item.role}-${index}`}><p>{item.text}</p>{item.recommendations?.length ? <div className="assistant-recommendations">{item.recommendations.map((recommendation) => <Link href={`/product/${recommendation.slug}`} key={recommendation.slug} onClick={() => setOpen(false)}><span>{recommendation.name}</span><small>{recommendation.price} · {recommendation.reason}</small></Link>)}</div> : null}</div>)}{pending && <div className="assistant-message assistant-message--assistant"><p className="typing-dots"><i /><i /><i /></p></div>}</div><form className="assistant-form" onSubmit={ask}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Try: a gift under $40" aria-label="Ask the shopping guide" maxLength={600} /><button type="submit" aria-label="Ask the shopping guide" disabled={pending || !message.trim()}><ArrowUp size={17} /></button></form></section>}
      <button className="assistant-toggle" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}><span className="assistant-toggle__orb"><Sparkles size={16} /></span><span>{open ? "Close guide" : "Shopping guide"}</span></button>
    </div>
  );
}
