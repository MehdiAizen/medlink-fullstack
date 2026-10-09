/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0ea5a5', // Turquoise principal
          dark: '#0c8a8a',
          light: '#14c4c4',
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        secondary: {
          DEFAULT: '#10b981', // Vert émeraude
          dark: '#059669',
          light: '#34d399',
          container: '#d1fae5',
        },
        surface: {
          DEFAULT: '#ffffff',
          low: '#f8fafc',
          container: '#f1f5f9',
          high: '#e2e8f0',
          highest: '#cbd5e1',
        },
        on: {
          surface: '#0f172a',
          variant: '#64748b',
        },
        outline: {
          DEFAULT: '#94a3b8',
          variant: '#e2e8f0',
        },
        error: {
          DEFAULT: '#ef4444',
          container: '#fee2e2',
        },
        success: {
          DEFAULT: '#10b981',
          container: '#d1fae5',
        },
        warning: {
          DEFAULT: '#f59e0b',
          container: '#fef3c7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
};