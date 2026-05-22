// Byte-for-byte test runner for highlightjs-fql.
//
// Each *.txt under test/markup/fql/ is highlighted through hljs and compared
// to a sibling *.expect.txt. Mismatch = failure. UPDATE=1 regenerates the
// expected files in place.
//
//   npm test                run all fixtures (compare mode)
//   UPDATE=1 npm test       regenerate every *.expect.txt from current grammar

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import hljs from 'highlight.js';
import fql from '../src/fql.js';

hljs.registerLanguage('fql', fql);

const here = path.dirname(fileURLToPath(import.meta.url));
const markupDir = path.join(here, 'markup', 'fql');
const UPDATE = process.env.UPDATE === '1';

const firstDiff = (a, b) => {
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) if (a[i] !== b[i]) return i;
  return -1;
};

const slice = (s, pos, ctx = 60) =>
  s.slice(Math.max(0, pos - ctx), pos + ctx);

const cases = (await fs.readdir(markupDir))
  .filter((f) => f.endsWith('.txt') && !f.endsWith('.expect.txt'))
  .sort();

let pass = 0;
let fail = 0;
const failures = [];

for (const file of cases) {
  const name = file.replace(/\.txt$/, '');
  const input = await fs.readFile(path.join(markupDir, file), 'utf-8');
  const actual = hljs.highlight(input, { language: 'fql' }).value;
  const expectPath = path.join(markupDir, `${name}.expect.txt`);

  if (UPDATE) {
    await fs.writeFile(expectPath, actual);
    console.log(`✓ updated ${name}.expect.txt`);
    pass++;
    continue;
  }

  let expected;
  try {
    expected = await fs.readFile(expectPath, 'utf-8');
  } catch {
    console.log(`✗ ${name}: missing ${name}.expect.txt — run \`UPDATE=1 npm test\` to bootstrap`);
    fail++;
    continue;
  }

  if (actual === expected) {
    console.log(`✓ ${name}`);
    pass++;
  } else {
    console.log(`✗ ${name}`);
    fail++;
    failures.push({ name, expected, actual });
  }
}

if (failures.length > 0) {
  console.log('\nFailures:');
  for (const { name, expected, actual } of failures) {
    const pos = firstDiff(actual, expected);
    console.log(`\n  ${name} — first diff at char ${pos}`);
    console.log(`  expected: ${JSON.stringify(slice(expected, pos))}`);
    console.log(`  actual:   ${JSON.stringify(slice(actual, pos))}`);
  }
  console.log(`\nIf the new output is intended, run \`UPDATE=1 npm test\` to refresh.`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
