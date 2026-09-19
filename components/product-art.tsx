import type { CSSProperties } from "react";

const artThemes: Record<string, [string, string, string]> = {
  candle: ["#f9d89a", "#c45336", "#321f1a"],
  ledger: ["#dcd1bb", "#8b6e51", "#2d2923"],
  incense: ["#d7c7b5", "#84786e", "#24211d"],
  cup: ["#e0d0b9", "#a24a35", "#38231e"],
  tin: ["#c2baa8", "#72766d", "#222622"],
  cloth: ["#d8d1c2", "#9a9b8e", "#34342f"],
  lamp: ["#f7d19a", "#bd623a", "#33231c"],
  matches: ["#e5b9a0", "#bd4e39", "#33211e"]
};

export function ProductArt({ visual, size = "card" }: { visual: string; size?: "card" | "hero" | "detail" }) {
  const [a, b, c] = artThemes[visual] ?? artThemes.candle;
  const style = { "--art-a": a, "--art-b": b, "--art-c": c } as CSSProperties;
  return (
    <div className={`product-art product-art--${size} visual-${visual}`} style={style} aria-hidden="true">
      <div className="art-haze" />
      <div className="art-object">
        <span className="art-shape art-shape-one" />
        <span className="art-shape art-shape-two" />
        <span className="art-mark" />
      </div>
      <span className="art-orbit art-orbit-one" />
      <span className="art-orbit art-orbit-two" />
    </div>
  );
}
