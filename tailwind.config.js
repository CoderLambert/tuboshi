const { adapter } = require('./tailwind.adapter')
const { vars } = require('./tailwind-theme-var-define')
const unit = '--tpx'

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    typography: require('./typography'),

    extend: {
      ...adapter(),
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        ...vars,
      },
      boxShadow: {
        'xs': '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
        'sm': '0px 1px 2px 0px rgba(16, 24, 40, 0.06), 0px 1px 3px 0px rgba(16, 24, 40, 0.10)',
        'md': '0px 2px 4px -2px rgba(16, 24, 40, 0.06), 0px 4px 8px -2px rgba(16, 24, 40, 0.10)',
        'lg': '0px 4px 6px -2px rgba(16, 24, 40, 0.03), 0px 12px 16px -4px rgba(16, 24, 40, 0.08)',
        'xl': '0px 8px 8px -4px rgba(16, 24, 40, 0.03), 0px 20px 24px -4px rgba(16, 24, 40, 0.08)',
        '2xl': '0px 24px 48px -12px rgba(16, 24, 40, 0.18)',
        '3xl': '0px 32px 64px -12px rgba(16, 24, 40, 0.14)',
        'status-indicator-green-shadow': '0px 2px 6px 0px var(--color-components-badge-status-light-success-halo), 0px 0px 0px 1px var(--color-components-badge-status-light-border-outer)',
        'status-indicator-warning-shadow': '0px 2px 6px 0px var(--color-components-badge-status-light-warning-halo), 0px 0px 0px 1px var(--color-components-badge-status-light-border-outer)',
        'status-indicator-red-shadow': '0px 2px 6px 0px var(--color-components-badge-status-light-error-halo), 0px 0px 0px 1px var(--color-components-badge-status-light-border-outer)',
        'status-indicator-blue-shadow': '0px 2px 6px 0px var(--color-components-badge-status-light-normal-halo), 0px 0px 0px 1px var(--color-components-badge-status-light-border-outer)',
        'status-indicator-gray-shadow': '0px 1px 2px 0px var(--color-components-badge-status-light-disabled-halo), 0px 0px 0px 1px var(--color-components-badge-status-light-border-outer)',
      },
      opacity: {
        2: '0.02',
        8: '0.08',
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
    [
      'postcss-preset-env',
      {
        // plugin options
        stage: 3,
      },
    ],
  ],
  corePlugins: {
    preflight: false,
  },
}
