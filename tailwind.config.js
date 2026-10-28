/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#050d1a',
          900: '#0F172A',
          800: '#1e293b',
          700: '#334155',
        },
        medblue: {
          50: '#EAF4FF',
          100: '#d6eaff',
          200: '#aed0ff',
          300: '#75adff',
          400: '#3b80ff',
          500: '#0EA5E9',
          600: '#0284c7',
          700: '#0369a1',
        },
        teal: {
          400: '#2dd4bf',
          500: '#14B8A6',
          600: '#0d9488',
        },
        surface: '#F8FAFC',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scan: {
          '0%, 100%': { transform: 'translateY(0%)', opacity: '0.7' },
          '50%': { transform: 'translateY(100%)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.08)',
        'card-hover': '0 4px 12px rgba(15,23,42,0.08), 0 12px 32px rgba(15,23,42,0.12)',
        'glow-cyan': '0 0 20px rgba(14,165,233,0.25)',
        'glow-teal': '0 0 20px rgba(20,184,166,0.25)',
      },
    },
  },
  plugins: [],
}
