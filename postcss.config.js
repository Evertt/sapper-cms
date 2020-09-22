const cssnano = require("cssnano")
const postcssImport = require("postcss-import")
const tailwindcss = require("tailwindcss")
const postcssNested = require("postcss-nested")
const tailwindcssConfig = require("./tailwind.config")

const mode = process.env.NODE_ENV
const dev = mode === "development"

module.exports = {
  plugins: [
    postcssImport,
    postcssNested(),
    tailwindcss(tailwindcssConfig),

    // Plugins for polyfills and the like (such as postcss-preset-env) should generally go here
    // but a few (like postcss-nested) have to run before Tailwind

    !dev && cssnano({
      preset: [
        "default",
        { discardComments: { removeAll: true } },
      ],
    }),
  ].filter(Boolean),
}
