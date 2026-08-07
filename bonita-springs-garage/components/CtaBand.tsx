import { site } from "@/lib/site";
import Container from "./ui/Container";
import Reveal from "./ui/Reveal";
import { Phone, ArrowRight, Shield, Clock, Badge } from "./Icons";

const guarantees = [
  { icon: Badge, label: "Free Estimates" },
  { icon: Clock, label: "Same-Day Service" },
  { icon: Shield, label: "Workmanship Warranty" },
];

/**
 * Full-width conversion band. Reused mid-page to keep the phone CTA always in reach.
 */
export default function CtaBand() {
  return (
    <section className="py-6 lg:py-10">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-5xl border border-white/10 bg-gradient-to-br from-ink-800 to-ink-700 px-6 py-12 shadow-lift sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/25 blur-[110px]" />
            <div className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-brand/10 blur-[110px]" />
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
            <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.1] mix-blend-overlay" />

            <div className="relative flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center">
              <div className="max-w-xl">
                <h2 className="font-display text-fluid-2xl font-bold text-white text-balance">
                  Don&apos;t let a small problem become a{" "}
                  <span className="gradient-text">costly one.</span>
                </h2>
                <p className="mt-4 text-fluid-base text-white/60">
                  Free estimates, upfront pricing, and same-day service — talk to a real
                  technician now.
                </p>
                <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
                  {guarantees.map(({ icon: Icon, label }) => (
                    <li key={label} className="flex items-center gap-2 text-sm font-medium text-white/75">
                      <Icon className="h-5 w-5 text-brand" />
                      {label}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:flex-col xl:flex-row">
                <a
                  href={site.phoneHref}
                  className="shine inline-flex items-center justify-center gap-2.5 rounded-full bg-brand-gradient px-8 py-4 text-base font-bold text-ink shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow-lg"
                >
                  <Phone className="h-5 w-5" />
                  {site.phone}
                </a>
                <a
                  href="#contact"
                  className="group inline-flex items-center justify-center gap-2 rounded-full glass px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:border-brand/50 hover:text-brand"
                >
                  Book Online
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
