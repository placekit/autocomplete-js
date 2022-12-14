import path from 'path';

import autoprefixer from 'autoprefixer';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import cleanup from 'rollup-plugin-cleanup';
import copy from 'rollup-plugin-copy';
import postcss from 'rollup-plugin-postcss';
import postcssBanner from 'postcss-banner';

import pkg from './package.json' assert { type: "json" };
const banner = [
  `/*! ${pkg.name} v${pkg.version}`,
  '© placekit.io',
  `${pkg.license} license`,
  `${pkg.homepage} */`,
].join(' | ');

export default {
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
