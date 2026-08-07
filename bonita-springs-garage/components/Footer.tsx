import { site } from "@/lib/site";
import { services } from "@/lib/content";
import { Phone, Mail, MapPin, Clock } from "./Icons";
import Container from "./ui/Container";
import Logo from "./Logo";

const nav = [
  { href: "#services", label: "Services" },
  { href: "#why", label: "Why Choose Us" },
  { href: "#areas", label: "Service Areas" },
  { href: "#reviews", label: "Reviews" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Free Estimate" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/10 bg-ink-800/60">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />
      <Container className="py-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          {/* Brand */}
          <div>
            <Logo titleClassName="text-base" />

            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/55">
              Licensed, insured, and locally trusted garage door repair, installation, and
              maintenance across the Five Towns &amp; Nassau County.
            </p>
            <a
              href={site.phoneHref}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-bold text-ink shadow-glow transition-all hover:-translate-y-0.5 hover:bg-brand-400"
            >
              <Phone className="h-4 w-4" />
              {site.phone}
            </a>
          </div>

          {/* Nav */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
              Explore
            </h3>
            <ul className="mt-4 space-y-2.5">
              {nav.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="text-sm text-white/60 transition-colors hover:text-brand">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
              Services
            </h3>
            <ul className="mt-4 space-y-2.5">
              {services.map((s) => (
                <li key={s.id}>
                  <a href="#services" className="text-sm text-white/60 transition-colors hover:text-brand">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
              Contact
            </h3>
            <ul className="mt-4 space-y-3.5 text-sm text-white/60">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <a href={site.phoneHref} className="hover:text-brand">
                  {site.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <a href={`mailto:${site.email}`} className="hover:text-brand">
                  {site.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span>
                  {site.address.street}
                  <br />
                  {site.address.city}, {site.address.state} {site.address.zip}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <div className="space-y-1">
                  {site.hours.map((h) => (
                    <div key={h.day}>
                      <span className="text-white/75">{h.day}:</span> {h.value}
                    </div>
                  ))}
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-center text-sm text-white/45 sm:flex-row sm:text-left">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
          <p className="text-white/55">
            Licensed &amp; Insured · Serving the Five Towns · Available 24/7
          </p>
        </div>
      </Container>
    </footer>
  );
}
