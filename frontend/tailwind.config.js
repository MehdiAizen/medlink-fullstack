/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0B1B3D',
          dark: '#00020a',
          light: '#162E5B',
        },
        secondary: {
          DEFAULT: '#485e8d',
          container: '#b3c9ff',
        },
        surface: {
          DEFAULT: '#f8f9ff',
          low: '#eff4ff',
          container: '#e5eeff',
          high: '#dce9ff',
          highest: '#d3e4fe',
        },
        on: {
          surface: '#0b1c30',
          variant: '#45464e',
        },
        outline: {
          DEFAULT: '#75777f',
          variant: '#c5c6cf',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        success: {
          DEFAULT: '#0d7a4f',
          container: '#d1fae5',
        },
        warning: {
          DEFAULT: '#b45309',
          container: '#fef3c7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
      },
    },
  },
  plugins: [],
};
