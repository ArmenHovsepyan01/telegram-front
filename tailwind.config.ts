import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/layouts/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)'
      },
      animation: {
        'dot-blink': 'dotBlink 3s infinite'
      },
      keyframes: {
        dotBlink: {
          '0%, 20%': { opacity: '0' },
          '40%': { opacity: '1' },
          '60%': { opacity: '0' },
          '80%, 100%': { opacity: '1' }
        }
      }
    }
  },
  plugins: []
};
export default config;
