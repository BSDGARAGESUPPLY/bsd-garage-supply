"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { Phone, ArrowRight } from "./Icons";

/**
 * Sticky bottom action bar on mobile — keeps "Call" and "Estimate" one tap away.
 * Appears after the user scrolls past the hero, hides again at the top.
 */
export default function MobileCallBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/90 p-3 backdrop-blur-xl transition-all duration-300 lg:hidden ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
      }`}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex gap-2.5">
        <a
          href={site.phoneHref}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-gradient px-4 py-3.5 text-sm font-bold text-ink shadow-glow"
        >
          <Phone className="h-4 w-4" />
          Call Now
        </a>
        <a
          href="#contact"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/20 px-4 py-3.5 text-sm font-semibold text-white"
        >
          Free Estimate
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
