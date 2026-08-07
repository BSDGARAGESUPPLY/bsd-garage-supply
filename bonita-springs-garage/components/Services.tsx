import { services } from "@/lib/content";
import { iconMap, Check, ArrowRight, Phone } from "./Icons";
import { site } from "@/lib/site";
import Container from "./ui/Container";
import Reveal from "./ui/Reveal";
import SectionHeading from "./ui/SectionHeading";

export default function Services() {
  return (
    <section id="services" className="relative section-pad">
      <Container>
        <SectionHeading
          eyebrow="What We Do"
          title={
            <>
              Full-service garage door <span className="gradient-text">experts</span>
            </>
          }
          intro="From emergency repairs to brand-new installations, we cover every part of your garage door system — for homes and businesses across the area."
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => {
            const Icon = iconMap[service.icon as keyof typeof iconMap] ?? iconMap.wrench;
            return (
              <Reveal
                as="article"
                key={service.id}
                delay={i * 80}
                className={`card-surface group flex flex-col p-7 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lift lg:p-8 ${
                  i === 0 ? "sm:col-span-2 lg:col-span-1" : ""
                }`}
              >
                {/* hover glow */}
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand/25 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

                <div className="flex items-center justify-between">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand/12 text-brand ring-1 ring-inset ring-brand/20 transition-all duration-300 group-hover:bg-brand-gradient group-hover:text-ink group-hover:ring-transparent">
                    <Icon className="h-7 w-7" />
                  </span>
                  <span
                    className="font-display text-5xl font-bold text-white/[0.08] transition-colors duration-300 group-hover:text-brand/25"
                    aria-hidden
                  >
                    0{i + 1}
                  </span>
                </div>

                <h3 className="mt-6 font-display text-fluid-xl font-semibold text-white">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{service.blurb}</p>

                <ul className="mt-5 space-y-2.5">
                  {service.points.map((p) => (
                    <li key={p} className="flex items-center gap-2.5 text-sm text-white/75">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand/15 text-brand">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>

                <a
                  href="#contact"
                  className="mt-7 inline-flex items-center gap-1.5 py-1 text-sm font-semibold text-brand transition-colors group-hover:text-brand-300"
                >
                  Request this service
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Reveal>
            );
          })}

          {/* Emergency CTA tile */}
          <Reveal
            as="article"
            delay={services.length * 80}
            className="shine relative flex flex-col justify-between overflow-hidden rounded-4xl bg-brand-gradient p-8 text-ink shadow-glow"
          >
            <div className="pointer-events-none absolute -bottom-10 -right-6 h-44 w-44 rounded-full bg-black/10 blur-2xl" />
            <div className="pointer-events-none absolute inset-0 bg-noise opacity-20 mix-blend-overlay" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full bg-ink/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em]">
                Emergency?
              </span>
              <h3 className="mt-4 font-display text-2xl font-bold leading-tight">
                Door stuck or spring snapped? We&apos;re on it — 24/7.
              </h3>
              <p className="mt-3 text-sm font-medium text-ink/75">
                Don&apos;t risk injury or a trapped vehicle. Call now and we&apos;ll
                dispatch a technician right away.
              </p>
            </div>
            <a
              href={site.phoneHref}
              className="relative mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
            >
              <Phone className="h-4 w-4 text-brand" />
              Call {site.phone}
            </a>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
