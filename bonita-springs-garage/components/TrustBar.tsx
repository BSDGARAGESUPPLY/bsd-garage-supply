import { Badge, Shield, Clock, Star, Check, Wrench } from "./Icons";
import Container from "./ui/Container";

const credentials = [
  { icon: Badge, label: "Licensed & Insured" },
  { icon: Star, label: "4.9★ Rated Service" },
  { icon: Clock, label: "24/7 Emergency" },
  { icon: Shield, label: "Written Warranty" },
  { icon: Wrench, label: "All Brands Serviced" },
  { icon: Check, label: "Upfront Pricing" },
];

/**
 * Premium credentials band. Static badge grid on desktop; on small screens the
 * same items scroll as a seamless marquee so nothing gets cramped.
 */
export default function TrustBar() {
  return (
    <div className="relative border-y border-white/10 bg-ink-800/50">
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.12] mix-blend-overlay" />
      <Container className="relative">
        {/* Desktop / tablet: evenly spread badges */}
        <ul className="hidden items-center justify-between gap-4 py-6 md:flex">
          {credentials.map(({ icon: Icon, label }) => (
            <li key={label} className="group flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand/12 text-brand transition-transform duration-300 group-hover:scale-110">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold tracking-tight text-white/80">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </Container>

      {/* Mobile: marquee */}
      <div className="flex overflow-hidden py-4 md:hidden">
        <ul className="flex shrink-0 animate-marquee items-center gap-8 pr-8">
          {credentials.concat(credentials).map(({ icon: Icon, label }, i) => (
            <li key={i} className="flex shrink-0 items-center gap-2 text-sm font-medium text-white/75">
              <Icon className="h-4 w-4 text-brand" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
