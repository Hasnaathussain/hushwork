import Link from "next/link";

export default function NotFound() {
  return <main className="site-shell not-found"><p className="eyebrow">The shelf is empty here</p><h1>That object<br /><em>moved on.</em></h1><Link className="button button--dark" href="/shop">Return to the shelf</Link></main>;
}
