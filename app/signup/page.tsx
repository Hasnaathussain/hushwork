import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Make an account" };

export default function SignupPage() {
  return <AuthForm initialMode="signup" />;
}
