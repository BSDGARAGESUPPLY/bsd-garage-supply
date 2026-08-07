/**
 * Lightweight inline SVG icon set (no external icon dependency).
 * Every icon inherits `currentColor` and accepts standard SVG props.
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export const Phone = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
  </svg>
);

export const Wrench = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M14.7 6.3a4 4 0 0 0 5 5l-1.6 4.6a2 2 0 0 1-1.3 1.3L6.5 20.7a2 2 0 0 1-2.5-2.5l3.5-10.3a2 2 0 0 1 1.3-1.3L14.7 6.3Z" />
    <path d="m10 14 5-5" />
  </svg>
);

export const Door = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
    <path d="M4 8h16M4 12h16M4 16h16" />
    <path d="M2 21h20" />
  </svg>
);

export const Spring = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 5h16" />
    <path d="M20 5c0 2-16 2-16 4s16 2 16 4-16 2-16 4" />
    <path d="M4 21h16" />
  </svg>
);

export const Opener = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="4" width="18" height="6" rx="1.5" />
    <path d="M8 10v3a4 4 0 0 0 8 0v-3" />
    <circle cx="12" cy="18" r="2.5" />
  </svg>
);

export const Shield = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5l-8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const Badge = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="9" r="6" />
    <path d="m9 13-1.5 8L12 19l4.5 2L15 13" />
    <path d="m10 9 1.5 1.5L15 7" />
  </svg>
);

export const Tag = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20.6 12.6 12 21.2a2 2 0 0 1-2.8 0l-6.4-6.4a2 2 0 0 1 0-2.8L11.4 2H20a2 2 0 0 1 2 2v8.6a2 2 0 0 1-.6 1.4Z" />
    <circle cx="16.5" cy="7.5" r="1.2" />
  </svg>
);

export const Bolt = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
  </svg>
);

export const Clock = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const Star = (p: IconProps) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="m12 2 2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 21l1.4-6.8L2.2 9.6l6.9-.7L12 2Z" />
  </svg>
);

export const Check = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m20 6-11 11-5-5" />
  </svg>
);

export const MapPin = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const Mail = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

export const Menu = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const Close = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const ChevronDown = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const ArrowRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/** Resolve an icon component by string key (used by data-driven sections). */
export const iconMap = {
  wrench: Wrench,
  door: Door,
  spring: Spring,
  opener: Opener,
  shield: Shield,
  badge: Badge,
  tag: Tag,
  bolt: Bolt,
  clock: Clock,
  star: Star,
  check: Check,
  mapPin: MapPin,
  mail: Mail,
  phone: Phone,
} as const;

export type IconKey = keyof typeof iconMap;
