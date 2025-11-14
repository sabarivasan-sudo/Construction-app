/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A73E8',
          dark: '#0D47A1',
          light: '#4285F4',
        },
        secondary: {
          DEFAULT: '#F9A825',
          light: '#FFB300',
        },
        dark: '#263238',
        light: '#ECEFF1',
        background: '#F5F7FA',
        success: '#43A047',
        danger: '#E53935',
      },
      borderRadius: {
        'xl': '16px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'large': '0 8px 24px rgba(0, 0, 0, 0.16)',
      },
    },
  },
  plugins: [],
}

