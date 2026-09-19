import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return <main className="legal-page site-shell"><p className="eyebrow">HUSHWORK / terms</p><h1>Simple terms for<br /><em>useful things.</em></h1><div className="legal-copy"><p>By placing an order, you agree to provide accurate delivery information, use products safely, and pay the listed price plus any delivery charge shown at checkout.</p><h2>Availability</h2><p>Stock is limited and can change until an order is paid. If we cannot fulfill a paid order, we will contact you and refund the affected amount.</p><h2>Returns</h2><p>Unused items can be returned within 30 days of delivery in their original packaging. Contact hello@hushwork.store before sending anything back.</p><h2>Changes</h2><p>We may update these terms as the store grows. The version shown when you order applies to that purchase.</p></div></main>;
}
