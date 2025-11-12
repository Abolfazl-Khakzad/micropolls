/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#E6F0FF',
          DEFAULT: '#4F8BFF',   // آبی خوشحال
          dark: '#1E3A8A',
        },
        accent: '#FF6F91',      // صورتی محترمانه نه فندقی
        highlight: '#FFD966',   // زرد ملایم برای تاکید
        textdark: '#1F2937',
      },
      borderRadius: {
        smooth: "12px",
      },
    },
  },
  plugins: [],
};
