module.exports = {
  content: [
    './src/**/*.html',
    './src/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          50: '#f0f4ff',
          100: '#e0e9fe',
          200: '#bad2fd',
          300: '#7cadfd',
          400: '#3783f9',
          500: '#0d63ea',
          600: '#0149c8',
          700: '#0239a2',
          800: '#063386',
          900: '#0b2c6f',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};