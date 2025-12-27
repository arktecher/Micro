import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      // Breakpoints
      screens: {
        sm: "640px", // Phones
        md: "768px", // Tablets
        lg: "1024px", // Laptops
        xl: "1280px", // Desktops
        "2xl": "1536px", // Large desktops
      },

      // Font family
      fontFamily: {
        sans: [
          "Noto Sans JP",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
      },

      // Font sizes
      fontSize: {
        base: "16px",
      },

      // Colors (semantic naming matching globals.css)
      colors: {
        border: "rgba(0, 0, 0, 0.1)",
        input: "transparent",
        ring: "oklch(0.708 0 0)",
        background: "#ffffff",
        foreground: "oklch(0.145 0 0)",
        primary: {
          DEFAULT: "#1a1a1a",
          foreground: "oklch(1 0 0)",
        },
        secondary: {
          DEFAULT: "oklch(0.95 0.0058 264.53)",
          foreground: "#030213",
        },
        destructive: {
          DEFAULT: "#d4183d",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#ececf0",
          foreground: "#717182",
        },
        accent: {
          DEFAULT: "#c08a6f",
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "oklch(1 0 0)",
          foreground: "oklch(0.145 0 0)",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "oklch(0.145 0 0)",
        },
      },

      // Border radius
      borderRadius: {
        lg: "0.625rem", // 10px (var(--radius))
        md: "calc(0.625rem - 2px)",
        sm: "calc(0.625rem - 4px)",
        xl: "calc(0.625rem + 4px)",
      },

      // Font weights
      fontWeight: {
        normal: "400",
        medium: "500",
      },
    },
  },
  plugins: [
    // Add base styles plugin
    function ({ addBase }: any) {
      addBase({
        // HTML base
        html: {
          fontSize: "16px",
          scrollBehavior: "smooth",
        },

        // Body base
        body: {
          backgroundColor: "#ffffff",
          color: "oklch(0.145 0 0)",
          fontFamily:
            '"Noto Sans JP", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
        },

        // Universal styles
        "*": {
          borderColor: "rgba(0, 0, 0, 0.1)",
        },

        // Links and interactive elements
        "a, a > *, button:not(:disabled), [role='link'], [role='button'], .cursor-pointer":
          {
            cursor: "pointer",
          },

        // Typography defaults (when no Tailwind text classes are used)
        h1: {
          fontSize: "1.5rem",
          fontWeight: "500",
          lineHeight: "1.5",
        },
        h2: {
          fontSize: "1.25rem",
          fontWeight: "500",
          lineHeight: "1.5",
        },
        h3: {
          fontSize: "1.125rem",
          fontWeight: "500",
          lineHeight: "1.5",
        },
        h4: {
          fontSize: "1rem",
          fontWeight: "500",
          lineHeight: "1.5",
        },
        p: {
          fontSize: "1rem",
          fontWeight: "400",
          lineHeight: "1.5",
        },
        label: {
          fontSize: "1rem",
          fontWeight: "500",
          lineHeight: "1.5",
        },
        button: {
          fontSize: "1rem",
          fontWeight: "500",
          lineHeight: "1.5",
        },
        input: {
          fontSize: "1rem",
          fontWeight: "400",
          lineHeight: "1.5",
        },

        // Print styles
        "@media print": {
          "@page": {
            margin: "10mm",
          },
          body: {
            margin: "0",
            padding: "0",
          },
          ".no-print, button": {
            display: "none !important",
          },
          ".print-label": {
            display: "block !important",
            margin: "0 auto",
            pageBreakAfter: "avoid",
            boxShadow: "none !important",
          },
        },
      });
    },
  ],
};

export default config;
