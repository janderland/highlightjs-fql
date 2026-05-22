import assert from 'node:assert';
import hljs from 'highlight.js';
import fql from '../src/fql.js';

describe('highlightjs-fql', () => {
  before(() => {
    hljs.registerLanguage('fql', fql);
  });

  it('registers the language', () => {
    assert.ok(hljs.getLanguage('fql'));
  });

  it('highlights a simple write query', () => {
    const { value } = hljs.highlight('/users("alice", 42)=nil', { language: 'fql' });
    assert.match(value, /hljs-built_in/);
    assert.match(value, /hljs-string/);
    assert.match(value, /hljs-number/);
    assert.match(value, /hljs-keyword/);
  });

  it('highlights a comment', () => {
    const { value } = hljs.highlight('% this is a comment', { language: 'fql' });
    assert.match(value, /hljs-comment/);
  });

  it('highlights a typed variable', () => {
    const { value } = hljs.highlight('/users(<int>)=<str>', { language: 'fql' });
    assert.match(value, /hljs-variable/);
    assert.match(value, /hljs-keyword/);
  });

  it('highlights options brackets', () => {
    const { value } = hljs.highlight('/users(<int>)=nil [limit:100, reverse]', { language: 'fql' });
    assert.match(value, /hljs-title/);
  });
});
