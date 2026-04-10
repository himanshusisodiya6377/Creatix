/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backdropFilter: {
        'blur-20': 'blur(20px)',
        'blur-24': 'blur(24px)',
      },
    },
  },
  plugins: [],
  safelist: [
    'glass',
    'glass-card',
    'z-50',
    'z-[100]',
    'sticky',
    'top-0',
    'backdrop-blur',
    'border-white/8',
    'border-white/10',
  ]
}
