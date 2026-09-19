"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ProductArt } from "@/components/product-art";

gsap.registerPlugin(ScrollTrigger);

export function MotionStory() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (!root.current) return;
    const words = root.current.querySelectorAll<HTMLElement>("[data-reveal-word]");
    gsap.fromTo(words, { opacity: 0.22, y: 18 }, {
      opacity: 1,
      y: 0,
      stagger: 0.08,
      ease: "none",
      scrollTrigger: { trigger: root.current, start: "top 72%", end: "bottom 58%", scrub: true }
    });
    gsap.utils.toArray<HTMLElement>("[data-scale-art]").forEach((art) => {
      gsap.fromTo(art, { scale: 0.82, opacity: 0.45 }, {
        scale: 1,
        opacity: 1,
        ease: "none",
        scrollTrigger: { trigger: art, start: "top 88%", end: "center 55%", scrub: true }
      });
    });
  }, { scope: root });

  return (
    <section className="motion-story" ref={root}>
      <div className="motion-story__intro">
        <p className="eyebrow">The HUSHWORK edit</p>
        <h2>{"Objects that keep the room company.".split(" ").map((word, index) => <span key={`${word}-${index}`} data-reveal-word>{word} </span>)}</h2>
        <p className="motion-story__note">Made in small runs, chosen for their materials, and designed to be used until they become part of the room.</p>
      </div>
      <div className="motion-story__stack">
        <div className="story-card story-card--warm" data-scale-art><ProductArt visual="candle" size="detail" /><p>Light that knows when to lower its voice.</p></div>
        <div className="story-card story-card--dark" data-scale-art><ProductArt visual="ledger" size="detail" /><p>A blank page with no need to become anything.</p></div>
        <div className="story-card story-card--red" data-scale-art><ProductArt visual="cup" size="detail" /><p>Daily objects, kept just a little closer.</p></div>
      </div>
    </section>
  );
}
