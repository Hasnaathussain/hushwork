import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/password-recovery-form";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
