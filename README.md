# highlightjs-fql

[FQL](https://github.com/janderland/fql) (FoundationDB Query Language)
syntax highlighting plugin for [highlight.js](https://highlightjs.org).

## Installation

```sh
npm install highlightjs-fql
```

## Usage

### Browser (CDN / static site)

Load `highlight.js` first, then the bundled FQL plugin — it self-registers
against the global `hljs`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js/styles/default.min.css">
<script src="https://cdn.jsdelivr.net/npm/highlight.js/lib/core.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/highlightjs-fql/dist/fql.min.js"></script>
<script>hljs.highlightAll();</script>
```

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
