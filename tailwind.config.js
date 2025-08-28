/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4361ee',
        secondary: '#3f37c9',
        success: '#4cc9f0',
        danger: '#f72585',
        warning: '#f8961e',
        info: '#4895ef',
        dark: '#212529'
      }
    },
  },
  plugins: [],
}