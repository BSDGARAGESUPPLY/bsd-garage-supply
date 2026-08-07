import { testimonials } from "@/lib/content";
import { Star } from "./Icons";
import Container from "./ui/Container";
import Reveal from "./ui/Reveal";
import SectionHeading from "./ui/SectionHeading";

export default function Testimonials() {
  return (
    <section id="reviews" className="relative section-pad">
      <Container>
        <SectionHeading
          eyebrow="Reviews"
          title={
            <>
              Rated <span className="gradient-text">4.9 / 5</span> by the Five Towns
            </>
          }
          intro="Real feedback from real neighbors. Here's what people say after we've been out to their home."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <Reveal
              as="article"
              key={t.name}
              delay={i * 90}
              className="group relative flex flex-col rounded-4xl border border-white/10 bg-ink-800 p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 sm:p-8"
            >
              <span
                className="pointer-events-none absolute right-7 top-4 font-display text-7xl leading-none text-brand/15"
                aria-hidden
              >
                &rdquo;
              </span>
              <div className="flex gap-1 text-brand" aria-label={`${t.rating} out of 5 stars`}>
                {Array.from({ length: t.rating }).map((_, s) => (
                  <Star key={s} className="h-5 w-5" />
                ))}
              </div>
              <p className="mt-5 text-base leading-relaxed text-white/80">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-brand/15 font-display text-base font-bold text-brand">
                  {t.name.charAt(0)}
                </span>
                <div>
                  <div className="font-semibold text-white">{t.name}</div>
                  <div className="text-sm text-white/50">{t.location}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
