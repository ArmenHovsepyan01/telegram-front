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
        foreground: 'var(--foreground)',
        navy: '#707991'
      },
      textColor: {
        default: 'var(--foreground)'
      },
      animation: {
        'dot-blink': 'dotBlink 3s infinite',
        'dot-pulse': 'dotPulse 1.4s infinite ease-in-out both',
        'whatsapp-bounce': 'whatsAppBounce 2s ease-in-out infinite'
      },
      keyframes: {
        dotBlink: {
          '0%, 20%': { opacity: '0' },
          '40%': { opacity: '1' },
          '60%': { opacity: '0' },
          '80%, 100%': { opacity: '1' }
        },
        dotPulse: {
          '0%, 80%, 100%': { opacity: '0' },
          '40%': { opacity: '1' }
        },
        whatsAppBounce: {
          '0%, 100%': { transform: 'scale(1)' },
          '20%': { transform: 'scale(1.1)' },
          '40%': { transform: 'scale(1)' },
          '60%': { transform: 'scale(1.1)' },
          '80%': { transform: 'scale(1)' }
        }
      }
    }
  },
  screens: {
    lg: { max: "1440px" },
    md: { max: "1200px" },
    sm: { max: "768px" },
    xs: { max: "480px" },
  },
  plugins: []
};
export default config;
