const path = require('path');

const autoprefixer = require('autoprefixer');
const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const replace = require('@rollup/plugin-replace');
const cleanup = require('rollup-plugin-cleanup');
const copy = require('rollup-plugin-copy');
const postcss = require('rollup-plugin-postcss');
const postcssBanner = require('postcss-banner');

const pkg = require('./package.json');
const banner = [
  `/*! ${pkg.name} v${pkg.version}`,
  '© placekit.io',
  `${pkg.license} license`,
  `${pkg.homepage} */`,
].join(' | ');

module.exports = {
  input: 'src/index.js',
  output: [
    {
      file: pkg.module,
      format: 'es',
      banner,
    },
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'auto',
      banner,
    },
    {
      file: pkg.browser,
      format: 'umd',
      name: 'placekitAutocomplete',
      banner,
    },
  ],
  plugins: [
    replace({
      preventAssignment: true,
      values: {
        'process.env.NODE_ENV': '"production"',
      }
    }),
    nodeResolve({
      browser: true,
    }),
    commonjs(),
    cleanup(),
    postcss({
      extract: path.resolve('./dist/placekit-autocomplete.css'),
      minimize: false,
      plugins: [
        autoprefixer(),
        postcssBanner({
          banner: banner.replace(/^\/\*\!\s+(.+)\s+\*\/$/, '$1'),
          inline: true,
          important: true,
        })
      ],
    }),
    copy({
      targets: [
        {
          src: 'src/index.d.ts',
          dest: path.dirname(pkg.types),
          rename: path.basename(pkg.types),
          transform: (content) => [banner, content].join("\n"),
        },
      ]
    })
  ],
};
