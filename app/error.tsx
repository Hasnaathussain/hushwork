"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main className="site-shell not-found"><p className="eyebrow">A small interruption</p><h1>The room<br /><em>needs a reset.</em></h1><div className="hero-actions"><button className="button button--dark" type="button" onClick={() => reset()}>Try again</button><Link className="button button--quiet" href="/">Go home</Link></div></main>;
}
