import { site } from "@/lib/site";
import Container from "./ui/Container";
import { Phone, Star, Check, Clock, ArrowRight, Shield, Badge } from "./Icons";

/**
 * Luxury split hero. Left: headline + CTAs + social proof.
 * Right: a framed, floating "product" panel rendered entirely in SVG/CSS
 * (zero external images). Swap the panel for a real photo via /public/hero.jpg
 * and a Next <Image fill priority /> when ready.
 */
export default function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden pb-16 pt-28 sm:pt-32 lg:pb-24 lg:pt-40">
      {/* ── Background ── */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900 via-ink to-ink" />
        <div className="absolute inset-x-0 top-0 h-[70vh] bg-radial-glow" />
        <div className="absolute -right-32 top-24 h-[520px] w-[520px] animate-float-slow rounded-full bg-brand/20 blur-[130px]" />
        <div className="absolute -left-40 top-1/3 h-[380px] w-[380px] rounded-full bg-brand/10 blur-[130px]" />
        <div className="absolute inset-0 bg-grid opacity-[0.5]" />
        <div className="absolute inset-0 bg-noise opacity-[0.15] mix-blend-overlay" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />
      </div>

      <Container className="relative">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          {/* ── Left column ── */}
          <div className="max-w-2xl">
            {/* Availability pill */}
            <div className="mb-7 inline-flex animate-fade-up items-center gap-2.5 rounded-full glass px-4 py-2 text-sm font-medium text-brand-300">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-brand" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand" />
              </span>
              {site.emergency} — We Answer 24/7
            </div>

            <h1 className="animate-blur-in font-display text-fluid-hero font-bold text-white text-balance">
              Garage door trouble?{" "}
              <span className="relative inline-block">
                <span className="gradient-text">We fix it today.</span>
                <svg
                  className="absolute -bottom-2 left-0 h-3 w-full text-brand/50"
                  viewBox="0 0 300 12"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <path d="M2 9C60 3 240 3 298 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p
              className="mt-7 max-w-xl animate-fade-up text-fluid-lg leading-relaxed text-white/65 text-pretty"
              style={{ animationDelay: "160ms" }}
            >
              Broken springs, off-track doors, dead openers — our licensed technicians
              arrive fast, quote upfront, and get it working right the first time.
            </p>

            {/* CTAs */}
            <div
              className="mt-9 flex animate-fade-up flex-col gap-3 sm:flex-row sm:items-center"
              style={{ animationDelay: "240ms" }}
            >
              <a
                href={site.phoneHref}
                className="shine group inline-flex items-center justify-center gap-2.5 rounded-full bg-brand-gradient px-8 py-4 text-base font-bold text-ink shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow-lg"
              >
                <Phone className="h-5 w-5" />
                Call {site.phone}
              </a>
              <a
                href="#contact"
                className="group inline-flex items-center justify-center gap-2 rounded-full glass px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/50 hover:text-brand"
              >
                Get a Free Estimate
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </a>
            </div>

            {/* Social proof */}
            <div
              className="mt-10 flex animate-fade-up flex-wrap items-center gap-x-6 gap-y-4"
              style={{ animationDelay: "320ms" }}
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {["#F8B84E", "#E0900C", "#FBC66B", "#B9740A"].map((c, i) => (
                    <span
                      key={i}
                      className="grid h-9 w-9 place-items-center rounded-full border-2 border-ink text-xs font-bold text-ink"
                      style={{ background: c }}
                    >
                      {["JS", "MR", "AK", "BR"][i]}
                    </span>
                  ))}
                </div>
                <div className="text-sm leading-tight">
                  <div className="flex text-brand">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4" />
                    ))}
                  </div>
                  <div className="mt-0.5 text-white/60">
                    <span className="font-semibold text-white">4.9/5</span> · 300+ reviews
                  </div>
                </div>
              </div>
              <div className="hidden h-8 w-px bg-white/10 sm:block" />
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/65">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-brand" /> Licensed &amp; Insured
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-brand" /> Same-Day Service
                </span>
              </div>
            </div>
          </div>

          {/* ── Right column: framed visual ── */}
          <div
            className="relative mx-auto hidden w-full max-w-md animate-fade-up md:block"
            style={{ animationDelay: "200ms" }}
          >
            {/* glow behind frame */}
            <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-brand/15 blur-3xl" />

            <div className="card-surface overflow-hidden p-3 shadow-lift">
              {/* The "door" visual */}
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.6rem] bg-gradient-to-b from-ink-700 to-ink-900">
                <div className="absolute inset-0 bg-grid opacity-40" />
                {/* stylized premium garage door */}
                <svg
                  viewBox="0 0 320 400"
                  className="absolute inset-0 h-full w-full"
                  preserveAspectRatio="xMidYMid slice"
                  aria-hidden
                >
                  <defs>
                    <linearGradient id="panel" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0%" stopColor="#242424" />
                      <stop offset="100%" stopColor="#161616" />
                    </linearGradient>
                    <linearGradient id="rim" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#F5A623" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#E0900C" stopOpacity="0.6" />
                    </linearGradient>
                  </defs>
                  {/* roofline */}
                  <path d="M40 96 L160 34 L280 96" fill="none" stroke="url(#rim)" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" />
                  {/* door frame */}
                  <rect x="54" y="104" width="212" height="272" rx="10" fill="url(#panel)" stroke="#3a3a3a" strokeWidth="2" />
                  {/* panels */}
                  {Array.from({ length: 4 }).map((_, r) => (
                    <g key={r}>
                      {Array.from({ length: 3 }).map((_, c) => (
                        <rect
                          key={c}
                          x={66 + c * 66}
                          y={116 + r * 64}
                          width="56"
                          height="54"
                          rx="6"
                          fill="#1f1f1f"
                          stroke="#333"
                          strokeWidth="1.5"
                        />
                      ))}
                    </g>
                  ))}
                  {/* top row windows glow */}
                  {Array.from({ length: 3 }).map((_, c) => (
                    <rect
                      key={c}
                      x={66 + c * 66}
                      y={116}
                      width="56"
                      height="54"
                      rx="6"
                      fill="#F5A623"
                      fillOpacity="0.12"
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-transparent to-transparent" />
              </div>

              {/* Floating stat chip — top */}
              <div className="absolute -left-5 top-10 animate-float rounded-2xl glass px-4 py-3 shadow-card">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-ink">
                    <Shield className="h-5 w-5" />
                  </span>
                  <div className="text-xs leading-tight">
                    <div className="font-bold text-white">Licensed &amp; Insured</div>
                    <div className="text-white/55">Background-checked</div>
                  </div>
                </div>
              </div>

              {/* Floating rating chip — bottom */}
              <div
                className="absolute -right-4 bottom-24 animate-float rounded-2xl glass px-4 py-3 shadow-card"
                style={{ animationDelay: "1.2s" }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-brand">
                    <Star className="h-5 w-5" />
                  </span>
                  <div className="text-xs leading-tight">
                    <div className="font-bold text-white">4.9 Rating</div>
                    <div className="text-white/55">300+ happy neighbors</div>
                  </div>
                </div>
              </div>

              {/* Free estimate footer bar */}
              <div className="flex items-center justify-between gap-3 px-4 py-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/12 text-brand">
                    <Badge className="h-5 w-5" />
                  </span>
                  <div className="text-sm leading-tight">
                    <div className="font-bold text-white">Free Estimates</div>
                    <div className="text-white/55">No obligation, ever</div>
                  </div>
                </div>
                <a
                  href={site.phoneHref}
                  className="grid h-11 w-11 place-items-center rounded-full bg-brand-gradient text-ink shadow-glow transition-transform hover:scale-105"
                  aria-label={`Call ${site.phone}`}
                >
                  <Phone className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
