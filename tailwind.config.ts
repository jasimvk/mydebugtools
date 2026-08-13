import type { Config } from 'tailwindcss'

const config: Config = {
  // The site has no dark theme yet: globals.css defines only a light `:root`
  // and nothing ever sets a `dark` class. Tailwind's default `media` strategy
  // fired the ~138 stray `dark:` utilities in a handful of tools purely from
  // the OS setting, rendering dark panels inside a light shell. Opting into the
  // class strategy parks them until a real theme (and toggle) lands.
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        surface: 'var(--surface)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        'card-bg': 'var(--card-bg)',
        // Primary action = near-black (Vercel-style minimal)
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          light: '#f4f4f5',
          dark: '#18181b',
        },
        // Single restrained accent for links / active / focus
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
        },
        // Legacy brand orange kept available, no longer the default identity
        brand: {
          orange: '#FF6C37',
          'orange-hover': '#ff5722',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-mono)', 'Roboto Mono', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config 
