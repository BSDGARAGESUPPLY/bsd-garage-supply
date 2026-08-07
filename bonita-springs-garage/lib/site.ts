/**
 * Central business configuration.
 * ── Edit everything about the company in this one file. ──
 * Values flow into the UI, metadata, JSON-LD structured data, sitemap, etc.
 */

export const site = {
  name: "Local Five Towns Garage Door",
  shortName: "Local Five Towns",
  tagline: "Fast, honest garage door repair you can count on.",
  description:
    "Licensed & insured garage door repair, installation, spring & opener service. Same-day 24/7 emergency service. Free estimates.",
  url: "https://www.localfivetownsgaragedoor.com",

  // ── Contact ──────────────────────────────────────────────
  phone: "(516) 618-7785",
  phoneHref: "tel:+15166187785",
  email: "localfivetownsgaragedoor@gmail.com",

  // ── Address (used for footer + Google Maps + LocalBusiness schema) ──
  address: {
    street: "224 Franklin Ave Unit 22",
    city: "Hewlett",
    state: "NY",
    zip: "11557",
    country: "US",
  },

  // Latitude / longitude for 224 Franklin Ave, Hewlett, NY (adjust to your exact HQ).
  geo: { lat: 40.6398, lng: -73.6987 },

  hours: [
    { day: "Monday – Friday", value: "7:00 AM – 8:00 PM" },
    { day: "Saturday", value: "8:00 AM – 6:00 PM" },
    { day: "Sunday", value: "Emergency service only" },
  ],

  // Shown in the "always open" badge
  emergency: "24/7 Emergency Service",

  social: {
    facebook: "#",
    instagram: "#",
    google: "#",
  },
} as const;

export type Site = typeof site;
