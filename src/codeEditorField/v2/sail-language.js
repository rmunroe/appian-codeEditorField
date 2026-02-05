/**
 * Appian SAIL / Expression Language support for Monaco Editor
 *
 * Provides syntax highlighting for SAIL with distinct coloring for:
 * - Domain prefixes (a!, fn!, local!, ri!, cons!, rule!, etc.)
 * - System and standard functions
 * - Variables, constants, and rule references
 * - Named parameters, operators, strings, numbers, comments
 */

function registerSailLanguage() {
  // Register the language
  monaco.languages.register({
    id: 'sail',
    aliases: ['SAIL', 'Appian SAIL', 'Expression Language']
  });

  // Monarch tokenizer
  monaco.languages.setMonarchTokensProvider('sail', {
    defaultToken: '',
    ignoreCase: false,

    brackets: [
      ['{', '}', 'delimiter.curly'],
      ['[', ']', 'delimiter.square'],
      ['(', ')', 'delimiter.paren']
    ],

    keywords: ['true', 'false', 'null'],

    tokenizer: {
      root: [
        // Whitespace
        [/\s+/, 'white'],

        // Block comments (SAIL only supports /* */ comments)
        [/\/\*/, 'comment', '@comment'],

        // Strings (double-quoted only in SAIL)
        [/"/, 'string', '@string'],

        // System functions: a!functionName
        [/\ba!/, { token: 'keyword.function.system', next: '@afterSystemPrefix' }],

        // Standard functions: fn!functionName
        [/\bfn!/, { token: 'keyword.function.standard', next: '@afterFunctionPrefix' }],

        // Rule references: rule!name
        [/\brule!/, { token: 'keyword.reference', next: '@afterReferencePrefix' }],

        // Record type references: recordType!name
        [/\brecordType!/, { token: 'keyword.reference', next: '@afterReferencePrefix' }],

        // Type references: type!name
        [/\btype!/, { token: 'keyword.reference', next: '@afterReferencePrefix' }],

        // Other reference prefixes: site!, translation!, portal!
        [/\b(site|translation|portal)!/, { token: 'keyword.reference', next: '@afterReferencePrefix' }],

        // Constants: cons!NAME
        [/\bcons!/, { token: 'keyword.constant', next: '@afterConstantPrefix' }],

        // Rule inputs: ri!name
        [/\bri!/, { token: 'keyword.parameter', next: '@afterParameterPrefix' }],

        // Local variables: local!name
        [/\blocal!/, { token: 'keyword.variable', next: '@afterVariablePrefix' }],

        // Process variables: pv!name
        [/\bpv!/, { token: 'keyword.variable', next: '@afterVariablePrefix' }],

        // Other variable prefixes: pp!, fv!, rv!, save!, http!, controlPanel!, test!
        [/\b(pp|fv|rv|save|http|controlPanel|test)!/, { token: 'keyword.variable', next: '@afterVariablePrefix' }],

        // Boolean and null keywords
        [/\b(true|false|null)\b/, 'keyword'],

        // Named parameters: identifier immediately followed by colon (but not ::)
        [/[a-zA-Z_]\w*(?=\s*:(?!:))/, 'variable.parameter'],

        // Numbers (decimal)
        [/\d+\.\d+/, 'number.float'],
        [/\d+/, 'number'],

        // Multi-character operators (must come before single-char)
        [/<>/, 'operator'],
        [/<=/, 'operator'],
        [/>=/, 'operator'],

        // Single-character operators
        [/[+\-*/^=<>&]/, 'operator'],

        // Brackets and delimiters
        [/[{}()\[\]]/, '@brackets'],
        [/[,;]/, 'delimiter'],
        [/:/, 'delimiter'],

        // Dot notation property access: .fieldName
        [/\.([a-zA-Z_]\w*)/, 'variable.property'],

        // Unqualified function call: name(
        [/[a-zA-Z_]\w*(?=\s*\()/, 'function'],

        // Other identifiers
        [/[a-zA-Z_]\w*/, 'identifier']
      ],

      // Block comment state
      comment: [
        [/[^/*]+/, 'comment'],
        [/\*\//, 'comment', '@pop'],
        [/[/*]/, 'comment']
      ],

      // String state (double-quoted)
      string: [
        [/[^"]+/, 'string'],
        [/"/, 'string', '@pop']
      ],

      // After a! prefix -- next token is a system function name
      afterSystemPrefix: [
        [/[a-zA-Z_]\w*/, { token: 'function.system', next: '@pop' }],
        ['', '', '@pop']
      ],

      // After fn! prefix -- next token is a standard function name
      afterFunctionPrefix: [
        [/[a-zA-Z_]\w*/, { token: 'function.standard', next: '@pop' }],
        ['', '', '@pop']
      ],

      // After rule!, recordType!, type!, etc. -- next token is a reference name
      afterReferencePrefix: [
        [/[a-zA-Z_]\w*/, { token: 'function.reference', next: '@pop' }],
        ['', '', '@pop']
      ],

      // After cons! prefix -- next token is a constant name
      afterConstantPrefix: [
        [/[a-zA-Z_]\w*/, { token: 'constant', next: '@pop' }],
        ['', '', '@pop']
      ],

      // After ri! prefix -- next token is a parameter name
      afterParameterPrefix: [
        [/[a-zA-Z_]\w*/, { token: 'variable.parameter', next: '@pop' }],
        ['', '', '@pop']
      ],

      // After local!, pv!, pp!, etc. -- next token is a variable name
      afterVariablePrefix: [
        [/[a-zA-Z_]\w*/, { token: 'variable', next: '@pop' }],
        ['', '', '@pop']
      ]
    }
  });

  // Language configuration (brackets, comments, auto-closing)
  monaco.languages.setLanguageConfiguration('sail', {
    comments: {
      blockComment: ['/*', '*/']
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')']
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"', notIn: ['string', 'comment'] }
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' }
    ],
    indentationRules: {
      increaseIndentPattern: /^.*[\(\{].*$/,
      decreaseIndentPattern: /^.*[\)\}].*$/
    }
  });
}
