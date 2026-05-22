/*
Language: FQL
Description: FoundationDB Query Language
Website: https://github.com/janderland/fql
Category: database
*/

// Keyword categories — single source of truth.
const LITERALS    = ['true', 'false', 'nil', 'inf', '-inf', 'nan', '-nan'];
const VERBS       = ['clear', 'remove'];
const TYPES       = ['any', 'int', 'bool', 'num', 'bint', 'str', 'bytes', 'uuid', 'tup', 'vstamp'];
const INT_TYPES   = ['i8', 'i16', 'i32', 'i64', 'u8', 'u16', 'u32', 'u64'];
const FLOAT_TYPES = ['f32', 'f64', 'f80'];
const AGGREGATES  = ['append', 'sum', 'avg', 'min', 'max', 'count'];
const OPTIONS_KW  = [
  'be', 'bigendian', 'endian', 'raw', 'reverse', 'unsigned',
  'width', 'sep', 'limit', 'mode', 'snapshot', 'strict',
];
const OPTION_VALUES  = ['want_all', 'iterator', 'exact', 'small', 'medium', 'large', 'serial'];

// US-keyboard ASCII punctuation. Used to construct broad terminator regexes
// (e.g. OPTION.end). Excludes `_` since it's a word character.
// Pre-escaped for use inside a regex `[...]` char class.
const SYMBOLS = '`~!@#$%^&*()\\-=+[\\]{}\\\\|;:\'",.<>/?';

// Build a lookahead-end regex: triggers on whitespace, EOL, or any keyboard
// symbol not matched by `keep`. Used by OPTION/DIRECTORY/VALUE.
const endAtSymbol = (keep) =>
  new RegExp('(?=[\\s' + SYMBOLS.replace(keep, '') + ']|$)');

// Composed lists for specific modes.
const TOP_KEYWORDS = [
  ...LITERALS, ...VERBS, ...TYPES, ...INT_TYPES, ...FLOAT_TYPES,
  ...AGGREGATES, ...OPTIONS_KW, ...OPTION_VALUES,
];
const VARIABLE_KEYWORDS = [...LITERALS, ...TYPES, ...AGGREGATES];
const BRACKET_KEYWORDS  = [...OPTIONS_KW, ...INT_TYPES, ...FLOAT_TYPES];

export default function(_hljs) {
  const ESCAPE = {
    scope: 'escape',
    begin: /\\./,
  };

  const COMMENT = {
    scope: 'comment',
    begin: /%.*\n?/,
  };

  const NUMBER = {
    begin: [
      /-?/,
      /\d+/,
      /\.?/,
      /\d*/,
      /e?/,
      /\d*/,
      /(kb|mb|gb)?/,
    ],
    beginScope: {
      1: 'accent',
      2: 'number',
      3: 'accent',
      4: 'number',
      5: 'accent',
      6: 'number',
      7: 'accent',
    },
  };

  const BYTES = {
    begin: [
      /0/,
      /x/,
      /[A-Za-z0-9]*/,
    ],
    beginScope: {
      1: 'number',
      2: 'accent',
      3: 'number',
    },
  };

  const UUID = {
    begin: [
      /\w{8}/,
      /-/,
      /\w{4}/,
      /-/,
      /\w{4}/,
      /-/,
      /\w{4}/,
      /-/,
      /\w{12}/,
    ],
    beginScope: {
      1: 'number',
      2: 'accent',
      3: 'number',
      4: 'accent',
      5: 'number',
      6: 'accent',
      7: 'number',
      8: 'accent',
      9: 'number',
    },
  };

  const VSTAMP = {
    begin: [
      /#/,
      /[A-Fa-f0-9]*/,
      /:/,
      /[A-Fa-f0-9]{4}/,
    ],
    beginScope: {
      1: 'accent',
      2: 'number',
      3: 'accent',
      4: 'number',
    },
  };

  const STRING = {
    scope: 'string',
    begin: /"/,
    end: /"/,
    contains: [ESCAPE],
  };

  const DSTRING = {
    scope: 'dstring',
    begin: /[\w\.\-]/,
  };

  const KEYWORD = {
    scope: 'keyword',
    beginKeywords: TOP_KEYWORDS.join(' '),
  };

  // OPTNAME — recognizes a token as an option-keyword name.
  const OPTNAME = {
    scope: 'keyword',
    beginKeywords: OPTIONS_KW.join(' '),
  };

  // OPTION — a single option, with or without `:value`. The single entry
  // point for option syntax everywhere — inside [...], at top level, in
  // TUPLE, in VALUE. Ends at any keyboard symbol other than `:`, plus
  // whitespace and EOL.
  const OPTION = {
    scope: 'accent',
    begin: new RegExp('(?=\\b(?:' + OPTIONS_KW.join('|') + ')\\b)'),
    end: endAtSymbol(/:/g),
    contains: [
      OPTNAME,
      STRING,
      {
        begin: [
          /:/,
          /[\w.\-]+/,
        ],
        beginScope: {
          1: 'option',
          2: 'number',
        },
      },
    ],
  };

  const OPTIONS = {
    scope: 'options',
    begin: /\[/,
    end: /]/,
    keywords: {
      $$pattern: /[^,:"]+/,
      keyword: BRACKET_KEYWORDS,
    },
    contains: [
      OPTION,
      STRING,
    ],
  };

  const VAR_NAME = {
    begin: [
      /[\w\.]+/,
      /:/,
    ],
    beginScope: {
      1: 'params',
      2: 'variable',
    },
  };

  const VARIABLE = {
    begin: /</,
    beginScope: 'variable',
    end: />/,
    endScope: 'variable',
    keywords: {
      $$pattern: /[^:|]+/,
      keyword: VARIABLE_KEYWORDS,
    },
    contains: [
      VAR_NAME,
      OPTIONS,
      {
        scope: 'variable',
        begin: /\|/,
      },
    ],
  };

  const TYPE_CAST = {
    begin: [
      /!/,
      /\w+/,
    ],
    beginScope: {
      1: 'reference',
      2: 'keyword',
    },
  };

  const REFERENCE = {
    begin: [
      /:/,
      /[\w\.]+/,
    ],
    beginScope: {
      1: 'reference',
      2: 'params',
    },
  };

  const MAYBEMORE = {
    scope: 'variable',
    begin: /\.\.\./,
  };

  const DIRECTORY = {
    scope: 'directory',
    begin: /[/@]/,
    end: endAtSymbol(/[/@<>.\-"]/g),
    contains: [
      STRING,
      VARIABLE,
      MAYBEMORE,
      DSTRING,
    ],
  };

  const TUPLE = {
    scope: 'tuple',
    begin: /\(/,
    end: /\)/,
    contains: [
      COMMENT,
      'self',
      STRING,
      VARIABLE,
      OPTION,
      REFERENCE,
      TYPE_CAST,
      MAYBEMORE,
      KEYWORD,
      UUID,
      VSTAMP,
      BYTES,
      NUMBER,
      OPTIONS,
    ],
  };

  const VALUE = {
    scope: 'value',
    begin: /=/,
    end: endAtSymbol(/[(<\[:!#\-"]/g),
    contains: [
      TUPLE,
      STRING,
      VARIABLE,
      OPTION,
      REFERENCE,
      TYPE_CAST,
      KEYWORD,
      UUID,
      VSTAMP,
      BYTES,
      NUMBER,
      OPTIONS,
    ],
  };

  return {
    name: 'FQL',
    aliases: ['fql'],
    classNameAliases: {
      directory: 'built_in',
      tuple: 'built_in',
      value: 'built_in',

      reference: 'variable',
      dstring: 'section',

      options: 'title',
      accent: 'title',
      escape: 'subst',
    },
    contains: [
      COMMENT,
      DIRECTORY,
      TUPLE,
      VALUE,
      VARIABLE,
      OPTION,
      REFERENCE,
      TYPE_CAST,
      MAYBEMORE,
      KEYWORD,
      STRING,
      UUID,
      VSTAMP,
      BYTES,
      NUMBER,
      OPTIONS,
    ],
  };
}
