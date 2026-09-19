"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return <button className="text-button" type="button" disabled={pending} onClick={async () => { setPending(true); await fetch("/api/auth/logout", { method: "POST" }); router.push("/"); router.refresh(); }}>{pending ? "Signing out…" : "Sign out"}</button>;
}
