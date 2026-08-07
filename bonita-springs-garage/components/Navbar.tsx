"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { Phone, Menu, Close, ArrowRight } from "./Icons";
import Container from "./ui/Container";
import Logo from "./Logo";

const links = [
  { href: "#services", label: "Services" },
  { href: "#why", label: "Why Us" },
  { href: "#areas", label: "Service Areas" },
  { href: "#reviews", label: "Reviews" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when the mobile menu is open + close on Escape
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-ink/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <Container>
        <nav className="flex h-16 items-center justify-between gap-4 lg:h-20">
          {/* Logo */}
          <a href="#top" aria-label={site.name}>
            <Logo />
          </a>

          {/* Desktop nav */}
          <ul className="hidden items-center gap-7 lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="relative text-sm font-medium text-white/75 transition-colors hover:text-white after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-0 after:bg-brand after:transition-all after:duration-300 hover:after:w-full"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 lg:flex">
            <a
              href={site.phoneHref}
              className="flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-brand"
            >
              <Phone className="h-4 w-4 text-brand" />
              {site.phone}
            </a>
            <a
              href="#contact"
              className="shine group inline-flex items-center gap-2 rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-ink shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow-lg"
            >
              Free Estimate
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid h-11 w-11 place-items-center rounded-xl border border-white/15 text-white lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <Close className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>
      </Container>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`fixed inset-0 top-16 bg-ink/95 backdrop-blur-xl transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        >
          <Container className="flex h-[calc(100vh-4rem)] flex-col py-8">
            <ul className="flex flex-col gap-1">
              {links.map((l, i) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-2xl px-4 py-4 text-lg font-medium text-white/85 transition-colors hover:bg-white/5 hover:text-white"
                    style={{ transitionDelay: open ? `${i * 40}ms` : "0ms" }}
                  >
                    {l.label}
                    <ArrowRight className="h-5 w-5 text-brand" />
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-col gap-3">
              <a
                href={site.phoneHref}
                className="flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-4 text-base font-semibold text-white"
              >
                <Phone className="h-5 w-5 text-brand" />
                Call {site.phone}
              </a>
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="shine flex items-center justify-center gap-2 rounded-full bg-brand-gradient px-6 py-4 text-base font-semibold text-ink shadow-glow"
              >
                Get a Free Estimate
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </Container>
        </div>
      </div>
    </header>
  );
}
