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
          DEFAULT: '#6A11CB', // Premium Purple
          dark: '#4F46E5',
          light: '#818CF8',
        },
        secondary: {
          DEFAULT: '#00C9A7', // Premium Teal
          light: '#34D399',
        },
        dark: '#374151', // Soft Dark Grey
        light: '#F3F4F6', // Soft Light Grey
        background: '#F9F7FF', // Very Light Purple Mist - Premium background
        backgroundSecondary: '#FAFAFA', // Cool White
        backgroundAccent: '#F6F3FF', // Light Lavender Gray
        success: '#00C9A7', // Premium Teal
        danger: '#EF4444', // Soft Red
        violet: '#8B5CF6', // Pleasant Violet accent
        construction: {
          orange: '#FF8A00', // Construction Orange
          orangeLight: '#FFB347', // Premium Mild Orange
          orangeDark: '#F97316', // Industrial Orange
        },
        warning: '#FACC15',
        gradient: {
          purple: '#6A11CB',
          blue: '#2575FC',
          teal: '#00C9A7',
        },
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

