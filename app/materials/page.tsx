import type { Metadata } from "next";

export const metadata: Metadata = { title: "Materials & care" };

export default function MaterialsPage() {
  return <main className="editorial-page site-shell"><p className="eyebrow">The material edit</p><h1>Things that get<br /><em>better with use.</em></h1><div className="support-grid"><section><h2>Stoneware</h2><p>Speckled clay, warm glazes, and small differences that make a cup or lamp feel made rather than manufactured. Wipe the lamp dry; the cup is dishwasher safe.</p></section><section><h2>Cloth & paper</h2><p>FSC paper and densely woven cotton are chosen for the way they soften, fill, fold, and become familiar. Keep the ledger dry and wash the Pocket Cloth cold.</p></section><section><h2>Brass & steel</h2><p>Small tools should be repairable. Keep the Mending Tin dry, let the brass age, and wipe any surface dust with a soft cloth.</p></section><section><h2>Wax & smoke</h2><p>Trim candle wicks before burning and use incense only on a heat-safe surface with ventilation. Never leave a flame unattended.</p></section></div></main>;
}
