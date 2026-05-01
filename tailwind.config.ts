import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        crt: {
          bg: "#0a0e14",
          fg: "#e6e1cf",
          accent: "#ffb454",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
