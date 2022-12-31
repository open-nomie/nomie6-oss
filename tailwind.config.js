module.exports = {
  purge: [
    './**/*.svelte', // Look for .svelte files
    './**/*.html', // Look for .html files
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    screens: {
      sm: '0px',
      md: '325px',
      lg: '500px',
      xl: '900px',
      '2xl': '1200px',
    },
    fontSize: {
      xs: '.75rem',
      sm: '.875rem',
      tiny: '.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '4rem',
      '7xl': '5rem',
    },
    extend: {
      colors: {
        gray: {
          950: '#090C13',
        },
        primary: {
          DEFAULT: '#00A4E4',
          50: '#eff9ff',
          100: '#def1ff',
          200: '#b6e5ff',
          300: '#75d3ff',
          400: '#2cbdff',
          500: '#00aaff',
          600: '#0083d4',
          700: '#0068ab',
          800: '#00588d',
          900: '#064974',
        },
      },
    },
  },
  variants: {
    backgroundColor: ['hover', 'responsive', 'focus', 'dark'],
    textColor: ['hover', 'responsive', 'focus', 'dark'],
  },
  plugins: [require('@tailwindcss/line-clamp'), require('@tailwindcss/typography')],
}
