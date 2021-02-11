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
    boxShadow: {
      up: "0 -1px 3px 0 rgb(0 0 0 / 10%), 0 -1px 2px 0 rgb(0 0 0 / 6%)",
      "md-up": "0 -4px 6px -1px rgb(0 0 0 / 10%), 0 -2px 4px -1px rgb(0 0 0 / 6%)",
    },
  },
  variants: {},
  plugins: [],
  future: {
    purgeLayersByDefault: true,
    standardFontWeights: true,
    defaultLineHeights: true,
  },
}
