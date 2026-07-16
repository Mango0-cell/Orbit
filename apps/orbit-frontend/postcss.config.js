// Tailwind CSS v4 is wired through its PostCSS plugin (zero-config).
// Utilities become available anywhere `global.css` (which `@import "tailwindcss"`) is loaded.
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
