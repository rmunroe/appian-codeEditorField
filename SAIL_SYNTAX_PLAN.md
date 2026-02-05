# SAIL Syntax Highlighting Feature Plan

## Overview

Add Appian SAIL / Expression Language as a custom language in the Monaco-based codeEditorFieldV2 component, providing syntax highlighting with distinct coloring for domain prefixes, functions, variables, operators, and SAIL-specific constructs.

## Key Decisions

- **Distinct colors** for different domain prefix types (functions vs variables vs constants)
- **Full syntax treatment** including named parameters, array literals, type references
- **sail_vscode extension is a different language** -- the GitHub repo (Timmmm/sail_vscode) is for a hardware description language, NOT Appian SAIL. Our tokenizer is built from Appian docs.

---

## SAIL Language Features to Highlight

### Token Categories and Coloring Strategy

| Token Category | Examples | Recommended Color Role |
|---------------|----------|----------------------|
| **System functions** | `a!localVariables()`, `a!textField()` | Function color |
| **Standard functions** | `fn!sum()`, `fn!isnull()` | Function color (slightly different) |
| **Rule references** | `rule!myExpression()` | Function/reference color |
| **Local variables** | `local!myVar` | Variable color |
| **Rule inputs** | `ri!inputName` | Parameter color |
| **Process variables** | `pv!processVar` | Variable color (italic) |
| **Constants** | `cons!MY_CONSTANT` | Constant color |
| **Type references** | `type!User`, `recordType!Case` | Type color |
| **Other domain prefixes** | `pp!`, `fv!`, `rv!`, `save!`, `http!` | Variable color |
| **Keywords** | `true`, `false`, `null` | Keyword color |
| **Strings** | `"Hello World"` | String color |
| **Numbers** | `42`, `3.14` | Number color |
| **Comments** | `/* block comment */` | Comment color |
| **Operators** | `+`, `-`, `*`, `/`, `=`, `<>`, `&`, `^` | Operator color |
| **Named parameters** | `label:`, `value:`, `saveInto:` | Parameter name color |
| **Array literals** | `{1, 2, 3}` | Bracket/delimiter color |
| **Dot notation** | `.field`, `.property` | Property access color |

### SAIL Syntax Details

**Comments:** Block only -- `/* ... */` (no line comments)

**Strings:** Double-quoted only -- `"text"` with no escape sequences

**Numbers:** Integers (`42`), decimals (`3.14`), negative (`-5`)

**Domain Prefixes (with `!`):**
- Functions: `a!`, `fn!`
- References: `rule!`, `recordType!`, `type!`, `site!`, `translation!`, `portal!`
- Variables: `local!`, `pv!`, `pp!`, `fv!`, `rv!`, `ri!`, `save!`
- Constants: `cons!`
- Other: `http!`, `controlPanel!`, `test!`

**Operators:**
- Arithmetic: `+`, `-`, `*`, `/`, `^`
- Comparison: `=`, `<>`, `<`, `>`, `<=`, `>=`
- Concatenation: `&`
- Colon (named params): `:`

**Brackets/Delimiters:**
- Parentheses: `(` `)`
- Curly braces (arrays): `{` `}`
- Square brackets (index): `[` `]`
- Comma: `,`

---

## Implementation Plan

### Files to Create

| File | Purpose |
|------|---------|
| `src/codeEditorField/v2/sail-language.js` | Monarch tokenizer + language config for SAIL |

### Files to Modify

| File | Changes |
|------|---------|
| `src/codeEditorField/v2/index.html` | Load `sail-language.js`, call registration function |
| `src/codeEditorField/v2/themes.js` | Add SAIL-specific token rules to all themes |
| `src/appian-component-plugin.xml` | Add `sail` to v2 language enum |
| `src/codeEditorField/v2/codeEditorFieldV2_en_US.properties` | Add label for SAIL language |

---

## Theme Color Mapping for SAIL Tokens

Each theme needs SAIL-specific token colors. Example for Monokai:

| Token | Color | Rationale |
|-------|-------|-----------|
| `keyword.function.system` (a!) | `#F92672` (pink) | System keyword prefix |
| `function.system` (function name) | `#A6E22E` (green) | Function name |
| `keyword.function.standard` (fn!) | `#F92672` (pink) | Function keyword prefix |
| `function.standard` (function name) | `#66D9EF` (blue) | Distinct from a! functions |
| `keyword.reference` (rule!, type!) | `#F92672` (pink) | Reference keyword prefix |
| `function.reference` (reference name) | `#E6DB74` (yellow) | Reference name |
| `keyword.constant` (cons!) | `#F92672` (pink) | Constant keyword prefix |
| `constant` (constant name) | `#AE81FF` (purple) | Constant value |
| `keyword.variable` (local!, pv!) | `#FD971F` (orange) | Variable keyword prefix |
| `variable` (variable name) | `#F8F8F2` (white) | Variable name |
| `keyword.parameter` (ri!) | `#FD971F` (orange) | Parameter keyword prefix |
| `variable.parameter` (param name / named param) | `#FD971F` (orange italic) | Named parameter |
| `variable.property` (.field) | `#A6E22E` (green) | Property access |

---

## Implementation Checklist

- [ ] Create `src/codeEditorField/v2/sail-language.js` with Monarch tokenizer
- [ ] Add SAIL token rules to all 9 custom themes + 3 built-in theme overrides in `themes.js`
- [ ] Add `<script src="sail-language.js">` to `index.html`
- [ ] Call `registerSailLanguage()` in Monaco init
- [ ] Add `sail` choice to language enum in `appian-component-plugin.xml`
- [ ] Add `parameter.language.sail.label=SAIL / Expression Language` to properties file
- [ ] Test syntax highlighting with sample SAIL code
- [ ] Commit and push
