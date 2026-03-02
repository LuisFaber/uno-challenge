import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2F6F4E",
        softgreen: "#4C9A6A",
        earth: "#6B4F3A",
        warmbg: "#F5F3EF",
        darktext: "#2C2C2C",
      },
    },
  },
  plugins: [],
} satisfies Config;
