import path from 'node:path';

import autoprefixer from 'autoprefixer';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import cleanup from 'rollup-plugin-cleanup';
import copy from 'rollup-plugin-copy';
import postcss from 'rollup-plugin-postcss';
import postcssBanner from 'postcss-banner';

import pkg from './package.json' assert { type: 'json' };
const banner = [
  `/*! ${pkg.name} v${pkg.version}`,
  '© placekit.io',
  `${pkg.license} license`,
  `${pkg.homepage} */`,
].join(' | ');

export default {
  input: 'src/placekit-autocomplete.js',
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
    nodeResolve({
      browser: true,
    }),
    cleanup({
      comments: 'none',
    }),
    postcss({
      extract: path.resolve('./dist/placekit-autocomplete.css'),
      minimize: false,
      plugins: [
        autoprefixer(),
        postcssBanner({
          banner: banner.replace(/^\/\*\!\s+(.+)\s+\*\/$/, '$1'),
          inline: true,
          important: true,
        }),
      ],
    }),
    copy({
      targets: [
        {
          src: 'src/placekit-autocomplete.d.ts',
          dest: path.dirname(pkg.types),
          rename: path.basename(pkg.types),
          transform: (content) => [banner, content].join("\n"),
        },
      ]
    })
  ],
};
