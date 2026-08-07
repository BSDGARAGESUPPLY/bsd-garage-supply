import { whyChooseUs } from "@/lib/content";
import { iconMap } from "./Icons";
import Container from "./ui/Container";
import Reveal from "./ui/Reveal";
import SectionHeading from "./ui/SectionHeading";

export default function WhyChooseUs() {
  return (
    <section id="why" className="relative overflow-hidden section-pad">
      {/* soft section backdrop */}
      <div className="absolute inset-0 -z-10 bg-ink-900/60" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-brand/10 blur-[120px]" />

      <Container>
        <SectionHeading
          eyebrow="Why Choose Us"
          title={
            <>
              Six reasons neighbors keep{" "}
              <span className="gradient-text">calling us back</span>
            </>
          }
          intro="Reliable work, honest pricing, and a team you can trust in your driveway — that's the standard on every job."
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {whyChooseUs.map((item, i) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap] ?? iconMap.badge;
            return (
              <Reveal
                key={item.title}
                delay={i * 70}
                className="card-surface group p-7 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lift lg:p-8"
              >
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-brand/20 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/12 text-brand ring-1 ring-inset ring-brand/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-gradient group-hover:text-ink group-hover:ring-transparent">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-display text-fluid-lg font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-white/55">{item.blurb}</p>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
