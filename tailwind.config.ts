import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--gradient-stops))",
      },
      colors: {
        // Design system trading colors
        trading: {
          yes: "#00D4AA", // Success green
          no: "#E94560", // Accent red
          bg: {
            primary: "#0A0A1A",
            secondary: "#13202D",
            card: "#16181f",
          },
        },
        velocity: {
          bg: "#0d0d0d",
          "bg-alt": "#111111",
          surface: "#1a1a1a",
          "surface-hover": "#222222",
          border: "#2a2a2a",
          teal: "#01696F",
          "teal-hover": "#0C4E54",
          "teal-light": "#4F98A3",
          gold: "#FFC553",
          "gold-dark": "#D4A843",
          success: "#00d68f",
          error: "#e84560",
          "text-primary": "#ffffff",
          "text-secondary": "#9ca3af",
          "text-muted": "#6b7280",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        hero: [
          "2rem",
          { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        "page-title": [
          "1.5rem",
          { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "700" },
        ],
        "section-header": [
          "1.125rem",
          { lineHeight: "1.3", fontWeight: "600" },
        ],
        "card-title": [
          "0.9375rem",
          { lineHeight: "1.3", fontWeight: "600" },
        ],
        caption: ["0.75rem", { lineHeight: "1.4", fontWeight: "400" }],
        probability: [
          "1.25rem",
          { lineHeight: "1", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
      },
    },
    screens: {
      // sx: "390px",
      // => @media (min-width: 390px) { ... }

      sm: "640px",
      // => @media (min-width: 640px) { ... }

      md: "768px",
      // => @media (min-width: 768px) { ... }

      lg: "1024px",
      // => @media (min-width: 1024px) { ... }

      xl: "1280px",
      // => @media (min-width: 1280px) { ... }

      "2xl": "1440px",
      // => @media (min-width: 1440px) { ... }
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
