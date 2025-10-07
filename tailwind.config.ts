import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-plecnik)", "system-ui", "sans-serif"],
        plecnik: ["var(--font-plecnik)", "system-ui", "sans-serif"],
        nyghtserif: ["var(--font-nyghtserif)", "serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Brand colors
        brand: {
          violet: {
            50: "var(--color-brand-violet-50)",
            100: "var(--color-brand-violet-100)",
            200: "var(--color-brand-violet-200)",
            300: "var(--color-brand-violet-300)",
            400: "var(--color-brand-violet-400)",
            500: "var(--color-brand-violet-500)",
            600: "var(--color-brand-violet-600)",
            700: "var(--color-brand-violet-700)",
            800: "var(--color-brand-violet-800)",
            900: "var(--color-brand-violet-900)",
          },
        },
        // Enhanced neutrals
        neutral: {
          50: "var(--color-neutral-50)",
          100: "var(--color-neutral-100)",
          200: "var(--color-neutral-200)",
          300: "var(--color-neutral-300)",
          400: "var(--color-neutral-400)",
          500: "var(--color-neutral-500)",
          600: "var(--color-neutral-600)",
          700: "var(--color-neutral-700)",
          800: "var(--color-neutral-800)",
          900: "var(--color-neutral-900)",
          950: "var(--color-neutral-950)",
        },
        // Accent colors
        violet: {
          400: "var(--color-violet-400)",
          500: "var(--color-violet-500)",
          600: "var(--color-violet-600)",
        },
        blue: {
          400: "var(--color-blue-400)",
          500: "var(--color-blue-500)",
          600: "var(--color-blue-600)",
        },
      },
      fontSize: {
        xs: "var(--font-size-xs)",
        sm: "var(--font-size-sm)",
        base: "var(--font-size-base)",
        lg: "var(--font-size-lg)",
        xl: "var(--font-size-xl)",
        "2xl": "var(--font-size-2xl)",
        "3xl": "var(--font-size-3xl)",
        "4xl": "var(--font-size-4xl)",
        "5xl": "var(--font-size-5xl)",
        "6xl": "var(--font-size-6xl)",
        "7xl": "var(--font-size-7xl)",
        "8xl": "var(--font-size-8xl)",
        "9xl": "var(--font-size-9xl)",
      },
      spacing: {
        xs: "var(--spacing-xs)",
        sm: "var(--spacing-sm)",
        md: "var(--spacing-md)",
        lg: "var(--spacing-lg)",
        xl: "var(--spacing-xl)",
        "2xl": "var(--spacing-2xl)",
        "3xl": "var(--spacing-3xl)",
        "4xl": "var(--spacing-4xl)",
        "5xl": "var(--spacing-5xl)",
      },
      lineHeight: {
        headline: "var(--headline-line-height)",
        body: "var(--body-line-height)",
      },
      borderRadius: {
        badge: "var(--badge-border-radius)",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s ease-out",
      },
      keyframes: {
        fadeInUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(24px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
