"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, MailCheck } from "lucide-react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setPending(true); setMessage(""); setError("");
    try {
      const response = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const payload = await response.json() as { message?: string; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Try again in a moment.");
      setMessage(payload.message ?? "Check your inbox.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Try again in a moment."); }
    finally { setPending(false); }
  }
  return <main className="site-shell auth-page"><div className="auth-card"><div className="auth-card__intro"><p className="eyebrow">Account recovery</p><h1>Find your way<br /><em>back in.</em></h1><p>We’ll send a one-time reset link if that email belongs to a HUSHWORK account.</p></div><form className="auth-form" onSubmit={submit}><label>Email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required /></label>{error && <p className="form-error" role="alert">{error}</p>}{message && <p className="form-success" role="status"><MailCheck size={16} /> {message}</p>}<button className="button button--dark button--full" type="submit" disabled={pending}>{pending ? "Sending…" : "Send reset link"} <ArrowRight size={16} /></button></form><Link className="text-link" href="/login">Back to sign in <ArrowRight size={15} /></Link></div></main>;
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setPending(true); setMessage(""); setError("");
    try {
      const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
      const payload = await response.json() as { message?: string; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not update your password.");
      setMessage(payload.message ?? "Password updated.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not update your password."); }
    finally { setPending(false); }
  }
  return <main className="site-shell auth-page"><div className="auth-card"><div className="auth-card__intro"><p className="eyebrow">Account recovery</p><h1>A fresh<br /><em>start.</em></h1><p>Choose a new password for your HUSHWORK account.</p></div><form className="auth-form" onSubmit={submit}><label>New password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="new-password" minLength={8} required /></label>{error && <p className="form-error" role="alert">{error}</p>}{message && <p className="form-success" role="status"><MailCheck size={16} /> {message}</p>}{message ? <Link className="button button--dark button--full" href="/login">Sign in <ArrowRight size={16} /></Link> : <button className="button button--dark button--full" type="submit" disabled={pending}>{pending ? "Updating…" : "Update password"} <ArrowRight size={16} /></button>}</form></div></main>;
}
