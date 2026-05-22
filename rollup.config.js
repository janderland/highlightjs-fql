import terser from '@rollup/plugin-terser';

const banner = '/*! highlightjs-fql | Apache-2.0 | https://github.com/janderland/fql */';

const base = {
  input: 'src/register.js',
  external: ['highlight.js'],
  output: {
    format: 'iife',
    name: 'hljsFQL',
    globals: { 'highlight.js': 'hljs' },
    banner,
  },
};

export default [
  {
    ...base,
    output: { ...base.output, file: 'dist/fql.js' },
  },
  {
    ...base,
    output: { ...base.output, file: 'dist/fql.min.js', plugins: [terser()] },
  },
];
