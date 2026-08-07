import { serviceAreas } from "@/lib/content";
import { site } from "@/lib/site";
import { MapPin, Phone } from "./Icons";
import Container from "./ui/Container";
import Reveal from "./ui/Reveal";
import SectionHeading from "./ui/SectionHeading";

export default function ServiceAreas() {
  return (
    <section id="areas" className="relative overflow-hidden section-pad">
      <div className="absolute inset-0 -z-10 bg-ink-800/40" />
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Service Areas"
              title={
                <>
                  Proudly serving <span className="gradient-text">the Five Towns</span>
                </>
              }
              intro="Based in Hewlett and covering the Five Towns and surrounding Nassau County communities. If you're nearby and don't see your town, just ask — we probably cover it."
            />
            <Reveal delay={220}>
              <a
                href={site.phoneHref}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-bold text-ink shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-400"
              >
                <Phone className="h-4 w-4" />
                Check Availability
              </a>
            </Reveal>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
            {serviceAreas.map((area, i) => (
              <Reveal
                key={area}
                delay={i * 50}
                className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-800 px-5 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40"
              >
                <MapPin className="h-5 w-5 shrink-0 text-brand" />
                <span className="font-medium text-white/85">{area}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
