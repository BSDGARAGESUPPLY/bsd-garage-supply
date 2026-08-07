import { site } from "@/lib/site";

/**
 * Brand logo — a faithful SVG recreation of the Local Five Towns garage-door
 * mark (peaked roofline, perspective garage door with panel grid, orange base).
 * Multi-color and tuned for dark backgrounds, matching the brand's
 * black-background logo variant. Fully scalable and dependency-free.
 *
 * To swap in the exact raster logo: add `public/logo.png` and replace
 * <LogoMark/> below with
 * `<Image src="/logo.png" width={132} height={104} alt="" priority />`.
 */

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 132 104"
      className={className}
      fill="none"
      role="img"
      aria-label={`${site.name} logo`}
    >
      {/* orange driveway / base */}
      <path d="M18 82 L88 90 L122 90 L122 99 L18 99 Z" fill="#F5A623" />
      {/* peaked roofline */}
      <path
        d="M12 52 L54 16 L106 48"
        stroke="#F5A623"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* garage door (perspective) */}
      <path d="M22 46 L86 54 L86 88 L22 80 Z" fill="#FFFFFF" stroke="#111111" strokeWidth="3" strokeLinejoin="round" />
      {/* panel grid */}
      <g stroke="#111111" strokeWidth="2" strokeLinecap="round">
        {/* verticals (sheared to match perspective) */}
        <path d="M38 48 L38 82" />
        <path d="M54 50 L54 84" />
        <path d="M70 52 L70 86" />
        {/* horizontals */}
        <path d="M22 57 L86 65" />
        <path d="M22 68 L86 76" />
      </g>
    </svg>
  );
}

/**
 * Full lockup: garage mark + stacked wordmark ("LOCAL FIVE TOWNS" over a
 * "GARAGE DOOR" orange bar). Used in the header and footer.
 */
export default function Logo({
  className = "",
  markClassName = "h-11 w-auto",
  titleClassName = "text-sm sm:text-[0.95rem]",
}: {
  className?: string;
  markClassName?: string;
  titleClassName?: string;
}) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark className={markClassName} />
      <span className="flex flex-col items-start gap-1 leading-none">
        <span className={`font-display font-bold uppercase tracking-tight text-white ${titleClassName}`}>
          Local Five Towns
        </span>
        <span className="rounded-[3px] bg-brand px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-ink">
          Garage Door
        </span>
      </span>
    </span>
  );
}
