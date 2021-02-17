const sveltePreprocess = require("svelte-preprocess")
const windicss = require("svelte-windicss-preprocess")
const postcss = require("./postcss.config")

const createPreprocessors = ({ sourceMap }) => [
  sveltePreprocess({
    sourceMap,
    defaults: {
      script: "typescript",
      style: "postcss",
    },
    postcss,
  }),
  windicss.preprocess(),
]

module.exports = {
  createPreprocessors,
  // Options for `svelte-check` and the VS Code extension
  preprocess: createPreprocessors({ sourceMap: true }),
}
