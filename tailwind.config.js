/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#F1FAFB',
          100: '#E2F3F5',
          200: '#C4E4E9',
          300: '#8BC3CF',
          400: '#4A9AB0',
          500: '#0F4C5C', // brand primary
          600: '#0D3F4D',
          700: '#0A313D',
          800: '#062029',
          900: '#02151A',
        },
        secondary: {
          50: '#ECFFFB',
          100: '#D1FFF5',
          200: '#A2FFE8',
          300: '#6CEFD7',
          400: '#2EC4B6', // brand secondary
          500: '#25A396',
          600: '#1C7E73',
          700: '#145C54',
          800: '#0C3C37',
          900: '#061F1D',
        },
        accent: {
          50: '#FFF4EE',
          100: '#FFE2D1',
          200: '#FFC2A3',
          300: '#FFA072',
          400: '#FF7F50', // brand accent
          500: '#E8633A',
          600: '#C44C2B',
          700: '#9A3920',
          800: '#6A2615',
          900: '#3B140C',
        },
      },
    },
  },
  plugins: [],
}
