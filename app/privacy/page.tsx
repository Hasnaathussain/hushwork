import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return <main className="legal-page site-shell"><p className="eyebrow">HUSHWORK / privacy</p><h1>Your details stay<br /><em>yours.</em></h1><div className="legal-copy"><p>We use the information you provide to create accounts, process orders, answer support requests, and improve the store. We do not sell personal information.</p><h2>Payments</h2><p>Card details are collected by Stripe Checkout, not stored by HUSHWORK. We receive the payment status and the order information needed to fulfill your purchase.</p><h2>Sessions</h2><p>Signed-in sessions use HttpOnly cookies on the web and secure storage on the Android client. You can sign out at any time; password resets revoke active sessions.</p><h2>Questions</h2><p>For a privacy request, email hello@hushwork.store from the address connected to your account.</p></div></main>;
}
