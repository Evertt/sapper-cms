/*
  Tailwind - The Utility-First CSS Framework
  A project by Adam Wathan (@adamwathan), Jonathan Reinink (@reinink),
  David Hemphill (@davidhemphill) and Steve Schoger (@steveschoger).
  View the full documentation at https://tailwindcss.com.
*/

module.exports = {
  purge: {
    content: ["./src/**/*.svelte", "./src/**/*.html"],
    options: {
      defaultExtractor: content => [
        ...content.matchAll(/(?:class:)*([\w\d-/:%.]+)/gm),
      ].map(([_match, group, ..._rest]) => group),
      keyframes: true,
    },
  },
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
  future: {
    purgeLayersByDefault: true,
    standardFontWeights: true,
    defaultLineHeights: true,
  },
}
