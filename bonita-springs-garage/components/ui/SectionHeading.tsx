import type { ReactNode } from "react";
import Reveal from "./Reveal";

export default function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "center",
  light = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "center" | "left";
  light?: boolean;
}) {
  const alignment = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`max-w-2xl ${alignment}`}>
      {eyebrow && (
        <Reveal>
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            <span className="h-px w-6 bg-brand/60" aria-hidden />
            {eyebrow}
          </span>
        </Reveal>
      )}
      <Reveal delay={80}>
        <h2
          className={`mt-4 font-display text-fluid-3xl font-bold tracking-tightest ${
            light ? "text-ink" : "text-white"
          }`}
        >
          {title}
        </h2>
      </Reveal>
      {intro && (
        <Reveal delay={160}>
          <p
            className={`mt-5 text-fluid-base leading-relaxed text-pretty ${
              light ? "text-ink/70" : "text-white/60"
            }`}
          >
            {intro}
          </p>
        </Reveal>
      )}
    </div>
  );
}
