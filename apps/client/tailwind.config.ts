import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: { colors: { navy: "#0A192F", gold: "#D4AF37" }, fontFamily: { serif: ["var(--font-playfair)"], sans: ["var(--font-inter)"] } } },
  plugins: [],
};
export default config;
