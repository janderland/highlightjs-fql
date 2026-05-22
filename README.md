# highlightjs-fql

[FQL](https://github.com/janderland/fql) (FoundationDB Query Language)
syntax highlighting plugin for [highlight.js](https://highlightjs.org).

## Installation

```sh
npm install highlightjs-fql
```

## Usage

### Node / bundler (ESM)

```js
import hljs from 'highlight.js/lib/core';
import fql from 'highlightjs-fql';

hljs.registerLanguage('fql', fql);

const { value } = hljs.highlight('/users("alice",42)=nil', { language: 'fql' });
```

Or use the side-effect entry point that registers for you:

```js
import 'highlightjs-fql/register';
```

## Development

```sh
npm install
npm test         # mocha smoke tests
npm run build    # rollup -> dist/fql.js, dist/fql.min.js
```

## License

Apache-2.0
