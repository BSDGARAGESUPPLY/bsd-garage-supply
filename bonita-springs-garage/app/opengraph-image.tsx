import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const alt = `${site.name} — Same-Day Garage Door Repair`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Branded Open Graph / social-share image, generated at build time.
 * Dark-luxury palette with the garage mark, business name, and phone.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0E0E0E",
          backgroundImage:
            "radial-gradient(1000px 500px at 80% -10%, rgba(245,166,35,0.28), transparent 60%)",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top: logo lockup */}
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <svg width="128" height="101" viewBox="0 0 132 104" fill="none">
            <path d="M18 82 L88 90 L122 90 L122 99 L18 99 Z" fill="#F5A623" />
            <path d="M12 52 L54 16 L106 48" stroke="#F5A623" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 46 L86 54 L86 88 L22 80 Z" fill="#FFFFFF" stroke="#111111" strokeWidth="3" strokeLinejoin="round" />
            <path d="M38 48 L38 82" stroke="#111111" strokeWidth="2" />
            <path d="M54 50 L54 84" stroke="#111111" strokeWidth="2" />
            <path d="M70 52 L70 86" stroke="#111111" strokeWidth="2" />
            <path d="M22 57 L86 65" stroke="#111111" strokeWidth="2" />
            <path d="M22 68 L86 76" stroke="#111111" strokeWidth="2" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
            <div style={{ color: "#fff", fontSize: 40, fontWeight: 700, lineHeight: 1, letterSpacing: 1 }}>
              LOCAL FIVE TOWNS
            </div>
            <div
              style={{
                display: "flex",
                background: "#F5A623",
                color: "#111",
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: 6,
                padding: "3px 10px",
                borderRadius: 4,
              }}
            >
              GARAGE DOOR
            </div>
          </div>
        </div>

        {/* Middle: headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ color: "#fff", fontSize: 72, fontWeight: 800, lineHeight: 1.02, maxWidth: 900 }}>
            Same-Day Garage Door Repair
          </div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 30 }}>
            Licensed &amp; insured · 24/7 emergency service · Free estimates
          </div>
        </div>

        {/* Bottom: contact bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "linear-gradient(135deg,#FBC66B,#F5A623 50%,#E0900C)",
              color: "#111",
              fontSize: 34,
              fontWeight: 800,
              padding: "16px 34px",
              borderRadius: 999,
            }}
          >
            {site.phone}
          </div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 28 }}>
            Serving Hewlett &amp; the Five Towns, NY
          </div>
        </div>
      </div>
    ),
    size
  );
}
