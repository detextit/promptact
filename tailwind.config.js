/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': {
            boxShadow: '0 0 20px 2px rgba(245, 158, 11, 0.3)',
            transform: 'scale(1)',
          },
          '50%': {
            boxShadow: '0 0 30px 4px rgba(245, 158, 11, 0.5)',
            transform: 'scale(1.01)',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 