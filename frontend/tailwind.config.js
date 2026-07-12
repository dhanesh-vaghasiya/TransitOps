/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: '#1a120c',
        'surface-dim': '#150c07',
        'surface-bright': '#271e18',
        'surface-container-lowest': '#110804',
        'surface-container-low': '#150c07',
        'surface-container': '#271e18',
        'surface-container-high': '#322822',
        'surface-container-highest': '#3d332c',
        'on-background': '#f1dfd5',
        'on-surface': '#dcc1b2',
        'on-surface-variant': '#a38c7e',
        outline: '#857368',
        'outline-variant': '#554338',
        primary: '#ffb786',
        'on-primary': '#461f00',
        'primary-container': '#da7727',
        'on-primary-container': '#ffede4',
        'primary-fixed': '#ffdbcb',
        'primary-fixed-dim': '#ffb786',
        'on-primary-fixed': '#321300',
        'on-primary-fixed-variant': '#502400',
        error: '#93000a',
        'on-error': '#ffdad6',
        'error-container': '#93000a22',
        'on-error-container': '#ffb4ab',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg-mobile': ['28px', { lineHeight: '36px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '32px', letterSpacing: '0', fontWeight: '600' }],
        'title-sm': ['14px', { lineHeight: '20px', letterSpacing: '0.1px', fontWeight: '500' }],
        'body-md': ['13px', { lineHeight: '20px', letterSpacing: '0', fontWeight: '400' }],
        'body-sm': ['12px', { lineHeight: '16px', letterSpacing: '0', fontWeight: '400' }],
        'label-caps': ['11px', { lineHeight: '16px', letterSpacing: '1px', fontWeight: '500' }],
        'mono-data': ['11px', { lineHeight: '16px', letterSpacing: '0', fontWeight: '400' }],
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
