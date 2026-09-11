/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#080B0D',
        surface: '#171C21',
        surfaceHover: '#13181E',
        textPrimary: '#F4F0E8',
        textSecondary: '#A7ADB4',
        textMuted: '#707780',
        gold: '#D5B06C',
        goldHover: '#E0BE81',
        borderSoft: 'rgba(255,255,255,0.08)',
        divider: 'rgba(255,255,255,0.05)',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['Inter', 'sans-serif'],
        playfair: ['"Playfair Display"', 'Georgia', 'serif'],
        cinzel: ['"Cinzel"', 'serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      fontSize: {
        'landing-hero': '72px',
        'landing-subtitle': '18px',
        'nav': '11px',
        'section-label': '11px',
        'card-title-lg': '30px',
        'card-title-md': '24px',
        'card-title-sm': '22px',
        'reader-title': '54px',
        'reader-body': '20px',
        'comment': '16px',
      },
      spacing: {
        4: '4px',
        8: '8px',
        12: '12px',
        16: '16px',
        20: '20px',
        24: '24px',
        32: '32px',
        40: '40px',
        48: '48px',
        64: '64px',
        96: '96px',
      },
      borderRadius: {
        'card': '18px',
        'nav': '999px',
        'btn': '999px',
        'comment': '16px',
      }
    },
  },
  plugins: [],
}