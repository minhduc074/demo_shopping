/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#b22203',
          50:  '#fef2f0',
          100: '#fde3df',
          200: '#facbc4',
          300: '#f5a499',
          400: '#ee6e5e',
          500: '#e34c38',
          600: '#c93220',
          700: '#b22203',
          800: '#8f1c07',
          900: '#751a0a',
        },
        surface: '#f6f6f6',
        muted: '#737373',
      },
      fontFamily: {
        heading: ['"Be Vietnam Pro"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        card: '0.75rem',
      },
      boxShadow: {
        card: '0 2px 8px 0 rgba(0,0,0,0.08)',
        'card-hover': '0 8px 24px 0 rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
};

