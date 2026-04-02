/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0f172a",
        card: "rgba(15, 23, 42, 0.55)",
        border: "rgba(148, 163, 184, 0.18)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(99, 102, 241, 0.4), 0 10px 35px -10px rgba(99,102,241,0.45)",
        soft: "0 10px 30px -12px rgba(15, 23, 42, 0.7)",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(99, 102, 241, 0.0)" },
          "50%": { boxShadow: "0 0 0 6px rgba(99, 102, 241, 0.15)" },
        },
      },
      animation: {
        pulseGlow: "pulseGlow 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
