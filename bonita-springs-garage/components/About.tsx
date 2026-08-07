import { site } from "@/lib/site";
import { stats } from "@/lib/content";
import Container from "./ui/Container";
import Reveal from "./ui/Reveal";
import CountUp from "./ui/CountUp";
import { Check, Phone } from "./Icons";

const highlights = [
  "Family-run, locally owned in the Five Towns",
  "Insulated doors built for Long Island weather",
  "Straight answers and honest recommendations",
];

export default function About() {
  return (
    <section id="about" className="relative section-pad">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Copy */}
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                <span className="h-px w-6 bg-brand/60" aria-hidden />
                Who We Are
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-4 font-display text-fluid-3xl font-bold tracking-tightest text-white">
                Your neighbors for reliable garage door service
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-5 text-lg leading-relaxed text-white/70">
                We started {site.shortName} with one simple idea: treat every home like
                our own. That means showing up when we say we will, explaining what&apos;s
                actually wrong, and charging a fair price — never selling you a door you
                don&apos;t need.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-4 text-base leading-relaxed text-white/55">
                From a single snapped spring to a full custom installation, our licensed
                technicians handle it with the same care and precision.
              </p>
            </Reveal>

            <ul className="mt-7 space-y-3">
              {highlights.map((h, i) => (
                <Reveal as="li" key={h} delay={240 + i * 70} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand/15 text-brand">
                    <Check className="h-4 w-4" />
                  </span>
                  <span className="text-white/80">{h}</span>
                </Reveal>
              ))}
            </ul>

            <Reveal delay={460}>
              <a
                href={site.phoneHref}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-bold text-ink shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-400"
              >
                <Phone className="h-4 w-4" />
                Talk to a Technician
              </a>
            </Reveal>
          </div>

          {/* Stats card cluster */}
          <Reveal delay={160}>
            <div className="relative">
              <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-brand/10 blur-2xl" />
              <div className="card-surface grid grid-cols-2 gap-4 p-6 sm:p-8">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="group rounded-3xl border border-white/5 bg-ink-700/70 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-brand/30"
                  >
                    <div className="font-display text-4xl font-bold gradient-text sm:text-5xl">
                      <CountUp value={s.value} />
                    </div>
                    <div className="mt-2 text-sm font-medium text-white/60">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
