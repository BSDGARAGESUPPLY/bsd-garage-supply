# Local Five Towns Garage Door — Marketing Site

A premium, conversion-focused, fully responsive one-page marketing site built with
**Next.js 15 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS**.

Original design inspired by (not copied from) a reference site — dark-luxury palette,
large display typography, rounded cards, soft shadows, scroll-reveal animations, and a
sticky mobile call bar.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Build for production:

```bash
npm run build && npm start
```

## Editing content

Almost everything lives in two files — no need to touch components:

| File | What it controls |
| --- | --- |
| `lib/site.ts` | Business name, **phone**, email, address, hours, geo coordinates, social links |
| `lib/content.ts` | Services, "why choose us", testimonials, service areas, FAQ, stats |

## Structure

```
app/
  layout.tsx        Root layout, metadata, fonts, LocalBusiness JSON-LD
  page.tsx          Homepage — composes all sections
  globals.css       Tailwind layers + design tokens
  sitemap.ts        SEO sitemap
  robots.ts         robots.txt
  api/contact/route.ts   Lead-capture endpoint (stub — wire email/CRM here)
components/
  Navbar, Hero, TrustBar, About, Services, CtaBand, WhyChooseUs,
  Testimonials, ServiceAreas, Faq, ContactForm, MapSection, Footer, MobileCallBar
  Icons.tsx         Inline SVG icon set (zero icon dependency)
  ui/               Reusable primitives: Container, Button, SectionHeading, Reveal
lib/
  site.ts, content.ts
```

## Things to customize before launch

1. **Phone number & business details** → `lib/site.ts`.
2. **Logo** — the header/footer use an SVG recreation in `components/Logo.tsx`, and the
   favicon (`app/icon.svg`) + generated OG image (`app/opengraph-image.tsx`) match it.
   To use the exact raster logo, add `public/logo.png` and swap `<LogoMark/>` in
   `components/Logo.tsx` for `<Image src="/logo.png" width={40} height={40} alt="" />`.
3. **Hero image** — currently a CSS/SVG treatment (no external assets). To use a real
   photo, drop `public/hero.jpg` and swap the art block in `components/Hero.tsx` for a
   Next `<Image fill priority />`.
4. **Contact form delivery** — `app/api/contact/route.ts` validates and logs leads.
   Add email (Resend/Nodemailer), a CRM webhook, or a DB write where marked `TODO`.
5. **Map** — `components/MapSection.tsx` uses the keyless Google Maps embed centered on
   the full street address; adjust the query or coordinates as needed.

## Accessibility & performance

- Semantic landmarks, skip-to-content link, focus-visible rings, ARIA on the FAQ
  accordion and mobile menu.
- `prefers-reduced-motion` disables animations and smooth scroll.
- No client-side data fetching; sections are server components except where interactivity
  is required (nav, FAQ, form, mobile bar). Fonts via `next/font` (self-hosted, swap).
