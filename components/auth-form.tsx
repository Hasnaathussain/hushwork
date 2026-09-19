"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export function AuthForm({ initialMode = "login" }: { initialMode?: "login" | "signup" }) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const body = mode === "signup"
      ? { name: String(form.get("name") ?? ""), email: String(form.get("email") ?? ""), password: String(form.get("password") ?? "") }
      : { email: String(form.get("email") ?? ""), password: String(form.get("password") ?? "") };
    try {
      const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Something went wrong.");
      router.push("/account");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="site-shell auth-page"><div className="auth-card"><div className="auth-card__intro"><p className="eyebrow">Your HUSHWORK account</p><h1>{mode === "signup" ? <>Make room for<br /><em>better routines.</em></> : <>Welcome back<br /><em>to your edit.</em></>}</h1><p>{mode === "signup" ? "Save your details and keep order history in one place." : "See your orders and keep shopping the current edit."}</p></div><form className="auth-form" onSubmit={onSubmit}>{mode === "signup" && <label>Name<input name="name" autoComplete="name" required /></label>}<label>Email<input name="email" type="email" autoComplete="email" required /></label><label>Password<div className="password-field"><input name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={mode === "signup" ? 8 : 1} required /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button--dark button--full" type="submit" disabled={pending}>{pending ? "One moment…" : mode === "signup" ? "Create account" : "Sign in"} <ArrowUpRight size={17} /></button></form>{mode === "login" && <Link className="text-link auth-recovery-link" href="/forgot-password">Forgot your password? <ArrowUpRight size={15} /></Link>}<p className="auth-switch">{mode === "signup" ? "Already have an account?" : "New here?"} <button type="button" onClick={() => { setMode((value) => value === "signup" ? "login" : "signup"); setError(""); }}>{mode === "signup" ? "Sign in" : "Make an account"}</button></p><Link className="text-link" href="/shop">Continue without an account <ArrowUpRight size={16} /></Link></div></main>
  );
}
