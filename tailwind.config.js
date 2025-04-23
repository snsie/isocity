/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        josefin: ['Josefin Sans', sans - serif],
      },
      zIndex: {
        100: '100',
        110: '110',
      },
      backgroundColor: {
        'menu-overlay': 'rgba(0, 0, 0, 0.7)',
        'menu-content': 'rgba(173, 193, 163, 0.85)',
        'message-box': 'rgba(173, 193, 163, 0.9)',
      },
      boxShadow: {
        menu: '0 8px 25px rgba(0,0,0,0.2)',
        message: '0 6px 20px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
};
