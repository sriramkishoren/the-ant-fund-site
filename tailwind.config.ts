import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: '#15807D',
          dark: '#0D5957',
        },
        amber: {
          DEFAULT: '#E09A33',
        },
        gold: '#F2C44E',
        cream: '#FBF6EE',
        ink: '#1C2826',
        surface: '#FFFFFF',
        border: '#E6E0D5',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        heading: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
      },
      maxWidth: {
        content: '72rem',
      },
    },
  },
  plugins: [typography],
};

export default config;
