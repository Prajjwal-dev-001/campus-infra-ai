import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "lpu-orange": "#F97316",
        "lpu-orange-dark": "#EA580C",
        "lpu-orange-light": "#FED7AA",
        "lpu-black": "#1A1A1A",
        "lpu-white": "#FFFFFF",
        "lpu-blue-light": "#EFF6FF",
        "lpu-blue-mid": "#BFDBFE",
        "lpu-gray": "#F3F4F6",
        "lpu-gray-dark": "#6B7280",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
