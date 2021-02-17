/*
  Tailwind - The Utility-First CSS Framework
  A project by Adam Wathan (@adamwathan), Jonathan Reinink (@reinink),
  David Hemphill (@davidhemphill) and Steve Schoger (@steveschoger).
  View the full documentation at https://tailwindcss.com.
*/

module.exports = {
  theme: {
    extend: {
      boxShadow: {
        up: "0 -1px 3px 0 rgb(0 0 0 / 10%), 0 -1px 2px 0 rgb(0 0 0 / 6%)",
        "md-up": "0 -4px 6px -1px rgb(0 0 0 / 10%), 0 -2px 4px -1px rgb(0 0 0 / 6%)",
        dark: "0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.18)",
        "md-dark": "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.18)",
        "lg-dark": "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15)",
      },
    },
  },
  plugins: [],
  future: {
    purgeLayersByDefault: true,
    standardFontWeights: true,
    defaultLineHeights: true,
  },
}
