import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark luxury palette
        ink: {
          DEFAULT: "#0E0E0E", // deep base background
          900: "#111111",
          800: "#171717", // elevated surface
          700: "#1E1E1E", // cards
          600: "#2A2A2A", // borders / hairlines
        },
        brand: {
          DEFAULT: "#F5A623", // orange accent
          300: "#FBC66B",
          400: "#F8B84E",
          500: "#F5A623",
          600: "#E0900C",
          700: "#B9740A",
          glow: "rgba(245,166,35,0.35)",
        },
        cream: "#F5F1EA", // warm off-white for premium text
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      // Fluid type scale — smooth from mobile to desktop, no layout jumps.
      fontSize: {
        "fluid-sm": "clamp(0.875rem, 0.83rem + 0.2vw, 1rem)",
        "fluid-base": "clamp(1rem, 0.95rem + 0.25vw, 1.125rem)",
        "fluid-lg": "clamp(1.125rem, 1.05rem + 0.4vw, 1.375rem)",
        "fluid-xl": "clamp(1.35rem, 1.2rem + 0.7vw, 1.75rem)",
        "fluid-2xl": ["clamp(1.75rem, 1.4rem + 1.6vw, 2.75rem)", { lineHeight: "1.1" }],
        "fluid-3xl": ["clamp(2.25rem, 1.7rem + 2.6vw, 3.75rem)", { lineHeight: "1.05" }],
        "fluid-hero": ["clamp(2.75rem, 1.8rem + 4.6vw, 5.5rem)", { lineHeight: "1.02", letterSpacing: "-0.02em" }],
      },
      letterSpacing: {
        tightest: "-0.03em",
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(0,0,0,0.55)",
        card: "0 20px 50px -24px rgba(0,0,0,0.65)",
        lift: "0 30px 70px -28px rgba(0,0,0,0.75)",
        glow: "0 14px 44px -12px rgba(245,166,35,0.5)",
        "glow-lg": "0 24px 70px -16px rgba(245,166,35,0.55)",
        "inset-hair": "inset 0 1px 0 0 rgba(255,255,255,0.06)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      maxWidth: {
        content: "1240px",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #FBC66B 0%, #F5A623 45%, #E0900C 100%)",
        "sheen": "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)",
        "radial-glow": "radial-gradient(60% 60% at 50% 0%, rgba(245,166,35,0.18) 0%, transparent 70%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "blur-in": {
          "0%": { opacity: "0", filter: "blur(12px)", transform: "translateY(16px)" },
          "100%": { opacity: "1", filter: "blur(0)", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-14px) rotate(-1.5deg)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.85)", opacity: "0.7" },
          "70%": { transform: "scale(1.7)", opacity: "0" },
          "100%": { opacity: "0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-120%)" },
          "60%, 100%": { transform: "translateX(220%)" },
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both",
        "blur-in": "blur-in 0.9s cubic-bezier(0.16,1,0.3,1) both",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 9s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.4,0,0.2,1) infinite",
        marquee: "marquee 32s linear infinite",
        shimmer: "shimmer 5s ease-in-out infinite",
        "gradient-pan": "gradient-pan 6s ease infinite",
      },
    },
  },
  plugins: [],
};

export default config;
