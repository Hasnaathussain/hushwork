import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/password-recovery-form";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token ?? "";
  return token ? <ResetPasswordForm token={token} /> : <main className="site-shell not-found"><p className="eyebrow">Account recovery</p><h1>This link is<br /><em>missing.</em></h1><p>Request a new reset link and we’ll get you back on the shelf.</p></main>;
}
