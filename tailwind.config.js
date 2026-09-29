/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './assets/js/**/*.js'],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      nav: '1120px', // full desktop navigation from here up
      xl: '1280px',
    },
    extend: {
      colors: {
        // The two inks of the logo, plus the approved light grounds.
        navy: '#1A3659',
        orange: '#F37221',
        paper: '#FAF7F2',
        sand: '#F1ECE3',
      },
      fontFamily: {
        display: ['Alexandria', '"Alexandria Fallback"', 'Tahoma', 'sans-serif'],
        sans: ['"IBM Plex Sans Arabic"', '"Plex Fallback"', 'Tahoma', 'Arial', 'sans-serif'],
      },
      maxWidth: {
        content: '80rem',
      },
    },
  },
  plugins: [],
};
