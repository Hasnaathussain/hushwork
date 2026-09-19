import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Welcome back" };

export default function LoginPage() {
  return <AuthForm initialMode="login" />;
}
