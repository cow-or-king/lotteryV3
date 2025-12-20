import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Connect & Boost Brand Colors
        cb: {
          yellow: '#FFB800',
          orange: '#FF8C00',
          magenta: '#FF006E',
          purple: '#8B5CF6',
          violet: '#6366F1',
          cyan: '#00D9FF',
          blue: '#0EA5E9',
          dark: '#1A1A1A',
        },
      },
      backgroundImage: {
        // Connect & Boost Gradients
        'cb-gradient':
          'linear-gradient(135deg, #FFB800 0%, #FF006E 50%, #8B5CF6 75%, #00D9FF 100%)',
        'cb-gradient-warm': 'linear-gradient(135deg, #FFB800 0%, #FF006E 100%)',
        'cb-gradient-cool': 'linear-gradient(135deg, #8B5CF6 0%, #00D9FF 100%)',
        'cb-gradient-radial':
          'radial-gradient(circle at center, #FFB800, #FF006E, #8B5CF6, #00D9FF)',
      },
    },
  },
  plugins: [],
};

export default config;
