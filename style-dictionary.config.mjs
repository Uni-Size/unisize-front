// Style Dictionary build config.
//
// Reads the token source files in `tokens/` and generates
// `src/styles/tokens.generated.css`, a CSS file that wraps the resulting
// custom properties in a Tailwind CSS v4 `@theme { ... }` block so it can be
// pulled straight into `src/styles/global.css` via `@import`.
//
// `tokens.generated.css` is a build artifact (see .gitignore) — never edit
// it by hand, edit the JSON files in `tokens/` and run `npm run tokens:build`.
/** @type {import('style-dictionary/types').Config} */
export default {
  source: ['tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'src/styles/',
      files: [
        {
          destination: 'tokens.generated.css',
          format: 'css/variables',
          options: {
            selector: '@theme',
            outputReferences: true,
          },
        },
      ],
    },
  },
};
