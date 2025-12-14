import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'parchment': '#F4EFE3',
        'ink': '#1A1410',
        'amber': {
          '50': '#FFF9F0',
          '100': '#FFEFD6',
          '400': '#FFB347',
          '500': '#FF9500',
          '600': '#E67E00',
          '700': '#CC6600',
        },
        'slate-deep': {
          '50': '#F8FAFC',
          '800': '#1E293B',
          '900': '#0F172A',
          '950': '#020617',
        }
      },
      fontFamily: {
        'heading': ['"Crimson Pro"', 'Georgia', 'serif'],
        'mono': ['"Space Mono"', 'Courier', 'monospace'],
        'body': ['"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(to right, rgba(255, 149, 0, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 149, 0, 0.05) 1px, transparent 1px)',
        'paper-texture': 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.05\' /%3E%3C/svg%3E")',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
};

export default config;
