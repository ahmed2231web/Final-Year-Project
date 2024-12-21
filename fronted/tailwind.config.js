/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        agbluma: ["Agbalumo", "sans-serif"], // Ensure the font is spelled correctly
      },
      screens: {
        lg: '840px', // Add a custom breakpoint at 840px
      },
      animation: {
        marquee: "marquee 20s linear infinite", // Custom marquee animation
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
      spacing: {
        128: "32rem", // Example: Custom spacing
        144: "36rem",
      },
      borderRadius: {
        xl: "1.5rem", // Example: Additional border-radius option
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Plugin for better form styling
    require('@tailwindcss/typography'), // Plugin for advanced text formatting
  ],
};
