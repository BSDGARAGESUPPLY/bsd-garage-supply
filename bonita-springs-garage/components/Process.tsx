import { Phone, Clock, Check } from "./Icons";
import Container from "./ui/Container";
import Reveal from "./ui/Reveal";
import SectionHeading from "./ui/SectionHeading";

const steps = [
  {
    icon: Phone,
    title: "Call or request online",
    blurb:
      "Tell us what's happening. We'll ask a few quick questions and lock in a time that works — often same day.",
  },
  {
    icon: Clock,
    title: "We arrive & diagnose",
    blurb:
      "A licensed technician inspects your door, explains the issue in plain English, and gives you an upfront written quote.",
  },
  {
    icon: Check,
    title: "Fixed & guaranteed",
    blurb:
      "We complete the repair on the spot when possible, test everything, and back the work with a written warranty.",
  },
];

export default function Process() {
  return (
    <section id="process" className="relative section-pad">
      <Container>
        <SectionHeading
          eyebrow="How It Works"
          title={
            <>
              Three simple steps to a <span className="gradient-text">working door</span>
            </>
          }
          intro="No runaround, no surprise fees — just a fast, honest process from the first call to the final test."
        />

        <div className="relative mt-16 grid gap-6 md:grid-cols-3">
          {/* connecting line (desktop) */}
          <div
            className="pointer-events-none absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent md:block"
            aria-hidden
          />
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <Reveal
                key={step.title}
                delay={i * 120}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 grid h-20 w-20 place-items-center rounded-3xl bg-ink-800 p-3 shadow-card ring-1 ring-white/10">
                  <span className="grid h-full w-full place-items-center rounded-2xl bg-brand/12 text-brand">
                    <Icon className="h-7 w-7" />
                  </span>
                  <span className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-brand-gradient text-xs font-bold text-ink shadow-glow">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-fluid-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/55">
                  {step.blurb}
                </p>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
