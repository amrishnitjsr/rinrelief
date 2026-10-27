import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: { colors: { navy: "#0A192F", gold: "#D4AF37", espresso: "#332B26", paper: "#F5F3EE" }, fontFamily: { serif: ["var(--font-playfair)"], sans: ["var(--font-inter)"] }, boxShadow: { soft: "0 20px 60px rgba(15,23,42,.08)" } } },
  plugins: []
};
export default config;
