/**
 * Site copy & data collections.
 * Original marketing copy — written for this project, not copied from any source.
 */

export type Service = {
  id: string;
  title: string;
  blurb: string;
  points: string[];
  icon: string; // maps to components/Icons.tsx
};

export const services: Service[] = [
  {
    id: "repair",
    title: "Garage Door Repair",
    blurb:
      "Off-track, noisy, or stuck? Our technicians diagnose and fix it fast — usually same day, done right the first time.",
    points: ["Off-track & cable fixes", "Panel & roller replacement", "Same-day diagnostics"],
    icon: "wrench",
  },
  {
    id: "installation",
    title: "Garage Door Installation",
    blurb:
      "New builds and full replacements with premium, insulated doors built to handle Long Island winters and coastal weather.",
    points: ["Insulated & weather-sealed", "Custom styles & finishes", "Clean, code-compliant install"],
    icon: "door",
  },
  {
    id: "springs",
    title: "Spring Repair & Replacement",
    blurb:
      "A broken torsion or extension spring is dangerous to touch. We replace them safely with high-cycle, long-life springs.",
    points: ["Torsion & extension springs", "High-cycle upgrades", "Balanced & tension-tested"],
    icon: "spring",
  },
  {
    id: "openers",
    title: "Opener Repair & Install",
    blurb:
      "Belt, chain, and smart Wi-Fi openers — installed, tuned, and repaired. Quieter operation and phone control.",
    points: ["Smart / Wi-Fi openers", "Quiet belt-drive units", "Remote & keypad setup"],
    icon: "opener",
  },
  {
    id: "maintenance",
    title: "Garage Door Maintenance",
    blurb:
      "A 25-point tune-up that catches small problems before they become expensive breakdowns and extends door life.",
    points: ["25-point safety inspection", "Lubrication & balancing", "Preventive tune-ups"],
    icon: "shield",
  },
];

export type WhyItem = { title: string; blurb: string; icon: string };

export const whyChooseUs: WhyItem[] = [
  {
    title: "Licensed & Insured",
    blurb: "Fully licensed, insured, and background-checked technicians on every job.",
    icon: "badge",
  },
  {
    title: "Upfront Pricing",
    blurb: "Clear, written quotes before we start. No surprises, no hidden fees.",
    icon: "tag",
  },
  {
    title: "Same-Day Service",
    blurb: "Most repairs are handled the same day you call — often within hours.",
    icon: "bolt",
  },
  {
    title: "24/7 Emergency",
    blurb: "Broken spring at midnight? We answer around the clock, every day.",
    icon: "clock",
  },
  {
    title: "Workmanship Warranty",
    blurb: "Parts and labor are backed by a written warranty for real peace of mind.",
    icon: "shield",
  },
  {
    title: "5-Star Local Reputation",
    blurb: "Hundreds of happy neighbors across the Five Towns — and counting.",
    icon: "star",
  },
];

export type Testimonial = {
  quote: string;
  name: string;
  location: string;
  rating: number;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "Called at 7am with a snapped spring and my car trapped inside. A tech was out by 9 and I was back on the road before lunch. Fair price, zero pressure.",
    name: "Marcus D.",
    location: "Hewlett, NY",
    rating: 5,
  },
  {
    quote:
      "They replaced our opener and tuned the whole door. It's genuinely silent now compared to the old chain drive. Clean, professional, on time.",
    name: "Priya S.",
    location: "Cedarhurst, NY",
    rating: 5,
  },
  {
    quote:
      "Honest is the word. They could've sold me a whole new door and instead fixed the rollers and cables for a fraction of the cost. I'll only call them from now on.",
    name: "Bill R.",
    location: "Woodmere, NY",
    rating: 5,
  },
  {
    quote:
      "New insulated door installed before winter. The crew was courteous, cleaned up everything, and walked me through the smart opener app.",
    name: "Angela M.",
    location: "Lawrence, NY",
    rating: 5,
  },
];

export const serviceAreas: string[] = [
  "Hewlett",
  "Cedarhurst",
  "Lawrence",
  "Woodmere",
  "Inwood",
  "Hewlett Harbor",
  "Woodsburgh",
  "Valley Stream",
  "Long Beach",
  "Rockville Centre",
  "Oceanside",
  "Far Rockaway",
];

export type Faq = { q: string; a: string };

export const faqs: Faq[] = [
  {
    q: "How fast can you get to me?",
    a: "For most calls across the Five Towns and nearby Nassau County we offer same-day service, and our 24/7 emergency line means a broken spring or a car trapped in the garage never has to wait until morning.",
  },
  {
    q: "How much does a garage door repair cost?",
    a: "It depends on the part and the problem, which is exactly why we give a clear written quote before any work begins. Estimates are free, and you approve the price up front — no surprises when the job is done.",
  },
  {
    q: "Is it safe to fix a broken spring myself?",
    a: "We strongly recommend against it. Garage door springs are under extreme tension and can cause serious injury. Our technicians carry the right tools and high-cycle replacement springs to do it safely and correctly.",
  },
  {
    q: "Do you work on all brands and door types?",
    a: "Yes. We service and install virtually every major residential and commercial brand, including sectional, roll-up, and carriage-style doors, plus belt, chain, and smart Wi-Fi openers.",
  },
  {
    q: "Are you licensed and insured?",
    a: "Absolutely. Every technician is licensed, insured, and background-checked, and our workmanship is backed by a written warranty on parts and labor.",
  },
  {
    q: "Do you offer free estimates?",
    a: "Yes — estimates are always free. Call us or request a quote online and we'll give you honest, upfront pricing with no obligation.",
  },
];

export type Stat = { value: string; label: string };

export const stats: Stat[] = [
  { value: "10+", label: "Years serving the Five Towns" },
  { value: "5,000+", label: "Doors repaired" },
  { value: "4.9★", label: "Average rating" },
  { value: "24/7", label: "Emergency response" },
];
