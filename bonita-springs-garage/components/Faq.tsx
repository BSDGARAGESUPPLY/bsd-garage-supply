"use client";

import { useState } from "react";
import { faqs } from "@/lib/content";
import { site } from "@/lib/site";
import { ChevronDown } from "./Icons";
import Container from "./ui/Container";
import Reveal from "./ui/Reveal";
import SectionHeading from "./ui/SectionHeading";

function FaqItem({
  q,
  a,
  open,
  onToggle,
  id,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
  id: number;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-ink-800 transition-colors duration-300 hover:border-white/20">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`faq-panel-${id}`}
          id={`faq-btn-${id}`}
          className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
        >
          <span className="font-display text-base font-semibold text-white sm:text-lg">
            {q}
          </span>
          <span
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 text-brand transition-transform duration-300 ${
              open ? "rotate-180 bg-brand/15" : ""
            }`}
          >
            <ChevronDown className="h-5 w-5" />
          </span>
        </button>
      </h3>
      <div
        id={`faq-panel-${id}`}
        role="region"
        aria-labelledby={`faq-btn-${id}`}
        className={`grid transition-all duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-6 text-sm leading-relaxed text-white/65 sm:text-base">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative section-pad">
      <Container>
        <SectionHeading
          eyebrow="FAQ"
          title={
            <>
              Questions? <span className="gradient-text">We&apos;ve got answers.</span>
            </>
          }
          intro="Everything you might want to know before you call. Still unsure? We're happy to talk it through."
        />

        <div className="mx-auto mt-12 max-w-3xl space-y-3">
          {faqs.map((faq, i) => (
            <Reveal key={faq.q} delay={i * 60}>
              <FaqItem
                id={i}
                q={faq.q}
                a={faq.a}
                open={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <p className="mt-10 text-center text-white/60">
            Prefer to just talk to someone?{" "}
            <a
              href={site.phoneHref}
              className="font-semibold text-brand underline-offset-4 hover:underline"
            >
              Call {site.phone}
            </a>
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
