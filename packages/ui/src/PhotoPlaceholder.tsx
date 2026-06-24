import * as React from "react";
import { cn } from "./cn";

/**
 * Visuele placeholder voor menu-items zonder foto.
 * Genereert een unieke kleur+initiaal per item naam zodat
 * de menukaart toch leeft zonder dat de eigenaar al foto's heeft.
 */
export function PhotoPlaceholder({
  label,
  className,
  aspect = "video",
}: {
  label: string;
  className?: string;
  aspect?: "video" | "square";
}) {
  const seed = hash(label);
  const hue = seed % 360;
  const initial = label.trim().charAt(0).toUpperCase() || "E";
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        aspect === "video" ? "aspect-video" : "aspect-square",
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(135deg, hsl(${hue}, 45%, 78%) 0%, hsl(${(hue + 40) % 360}, 50%, 60%) 100%)`,
      }}
      aria-hidden="true"
    >
      <span className="font-display text-5xl font-bold text-white/85 drop-shadow-sm">
        {initial}
      </span>
    </div>
  );
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}
