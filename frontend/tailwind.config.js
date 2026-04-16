/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#09060f",
        cream: "#120d1d",
        coral: "#8e63f5",
        mint: "#c6b5ff",
        sand: "#1a1327",
        panel: "#151020",
        lilac: "#ede4ff"
      },
      fontFamily: {
        display: ['"Space Grotesk"', "sans-serif"],
        body: ['"Manrope"', "sans-serif"]
      },
      boxShadow: {
        glow: "0 24px 80px rgba(110, 69, 216, 0.24)"
      }
    }
  },
  plugins: []
};
