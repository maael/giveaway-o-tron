/* eslint-disable no-undef */
module.exports = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
      },
      animation: {
        wiggle: 'wiggle 1.5s ease-in-out infinite',
        slowwiggle: 'wiggle 6s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
