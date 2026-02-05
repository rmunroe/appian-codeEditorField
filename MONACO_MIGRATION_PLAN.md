# Monaco Editor Migration Plan (v2)

## Overview

This document outlines the plan to migrate the Appian SAIL `codeEditorField` component from Ace Editor to Monaco Editor, adding diff/compare functionality while maintaining backward compatibility with existing v1 users.

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Themes** | Create custom Monaco themes | Replicate popular Ace themes (monokai, dracula, github, etc.) for familiarity |
| **Versions** | Keep both v1 and v2 | Existing SAIL code continues working; developers opt-in to v2 |
| **Languages** | Use Monaco language IDs | Cleaner API; some differ from Ace (e.g., `cpp` instead of `c_cpp`) |
| **Component Name** | `codeEditorFieldV2` | Distinct name so existing usages remain on v1 |
| **Branch** | `v2` | All development on dedicated branch |

---

## New Features in v2

### 1. Diff/Compare Mode
- Side-by-side view showing two versions with highlighted differences
- Inline view showing additions/deletions in a single editor
- Original (left) side always read-only
- Modified (right) side editable when `readOnly: false`

### 2. Custom Themes
Monaco only ships 3 built-in themes. We'll create custom themes replicating popular Ace themes:
- **Dark**: monokai, dracula, nord, tomorrow-night, cobalt, twilight
- **Light**: github, solarized-light
- **Both**: solarized-dark

### 3. Monaco Language Support
Full syntax highlighting for ~45 languages using Monaco's language IDs.

---

## Parameters

### Existing Parameters (Preserved)

| Parameter | Type | Category | Description |
|-----------|------|----------|-------------|
| `text` | Text | input-output | The code content |
| `readOnly` | Boolean | input-only | Disable editing |
| `fontSize` | Enum | input-only | 12, 13, 14, 16, 18, 22, 24 px |
| `tabSize` | Integer | input-only | Spaces per tab (default: 2) |
| `hideGutter` | Boolean | input-only | Hide left gutter |
| `hideLineNumbers` | Boolean | input-only | Hide line numbers |
| `disableCodeFolding` | Boolean | input-only | Disable folding |
| `showPrintMargin` | Boolean | input-only | Show vertical margin line |
| `printMarginColumn` | Integer | input-only | Margin column (default: 80) |
| `marginBelow` | Enum | input-only | NONE or STANDARD |

### New Parameters (v2)

| Parameter | Type | Category | Default | Description |
|-----------|------|----------|---------|-------------|
| `editorMode` | Enum | input-only | `editor` | `editor` (standard) or `diff` (compare view) |
| `originalValue` | Text | input-only | `""` | Left side content in diff mode |
| `modifiedValue` | Text | input-output | `""` | Right side content in diff mode |
| `diffViewType` | Enum | input-only | `sideBySide` | `sideBySide` or `inline` |
| `language` | Enum | input-only | `plaintext` | Monaco language ID for syntax highlighting |
| `theme` | Enum | input-only | `vs` | Theme name (built-in + custom) |

### Behavior Notes
- In `editorMode: "editor"`, use `text` parameter (standard editing)
- In `editorMode: "diff"`, use `originalValue` and `modifiedValue`; `text` is ignored
- When `readOnly: false` in diff mode, only modified side is editable
- Changes to modified side save back via `modifiedValue` parameter

---

## File Structure

### Current (v1)
```
src/
├── appian-component-plugin.xml
├── __shared/
│   └── ace-builds/src-min-noconflict/
└── codeEditorField/
    └── v1/
        ├── index.html
        ├── codeEditorField_en_US.properties
        └── code-json.svg
```

### Target (v1 + v2)
```
src/
├── appian-component-plugin.xml          # Updated with v2 component
├── __shared/
│   ├── ace-builds/src-min-noconflict/   # Keep for v1
│   └── monaco-editor/vs/                # NEW: Monaco library
└── codeEditorField/
    ├── v1/                              # Unchanged
    │   ├── index.html
    │   ├── codeEditorField_en_US.properties
    │   └── code-json.svg
    └── v2/                              # NEW: Monaco implementation
        ├── index.html
        ├── themes.js
        ├── codeEditorFieldV2_en_US.properties
        └── code-json.svg
```

---

## Implementation Phases

### Phase 1: Setup
1. Create `v2` branch from master
2. Download Monaco Editor (npm or GitHub release)
3. Extract `min/vs/` folder to `src/__shared/monaco-editor/vs/`
4. Create `src/codeEditorField/v2/` directory

### Phase 2: Custom Themes (themes.js)
Create `src/codeEditorField/v2/themes.js` with custom theme definitions:

```javascript
var customThemes = {
  monokai: {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '75715E', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'F92672' },
      { token: 'string', foreground: 'E6DB74' },
      // ... more token rules
    ],
    colors: {
      'editor.background': '#272822',
      'editor.foreground': '#F8F8F2',
      // ... more UI colors
    }
  },
  // ... dracula, github, solarized-dark, solarized-light, nord, etc.
};

function registerCustomThemes() {
  Object.keys(customThemes).forEach(function(name) {
    monaco.editor.defineTheme(name, customThemes[name]);
  });
}
```

### Phase 3: Properties File
Create `src/codeEditorField/v2/codeEditorFieldV2_en_US.properties`:
- Component name and description
- Labels for new parameters (editorMode, originalValue, modifiedValue, diffViewType)
- Monaco language labels (~45 languages)
- Theme labels (3 built-in + 9 custom)

### Phase 4: Plugin XML
Update `src/appian-component-plugin.xml` to add the v2 component:

```xml
<!-- Existing v1 component stays unchanged -->
<component rule-name="codeEditorField" version="1.0.0">
  <!-- ... existing v1 definition ... -->
</component>

<!-- NEW v2 component -->
<component rule-name="codeEditorFieldV2" version="2.0.0">
  <sdk-version>2.0.0</sdk-version>
  <supported-user-agents>chrome firefox ie11 edge safari mobile</supported-user-agents>
  <icon-file>code-json.svg</icon-file>

  <!-- Existing parameters -->
  <parameter name="readOnly" category="input-only" type="Boolean"/>
  <parameter name="text" category="input-output" type="Text"/>
  <!-- ... other existing params ... -->

  <!-- NEW parameters -->
  <parameter name="editorMode">
    <category>input-only</category>
    <type><enum><choice>editor</choice><choice>diff</choice></enum></type>
  </parameter>
  <parameter name="originalValue" category="input-only" type="Text"/>
  <parameter name="modifiedValue" category="input-output" type="Text"/>
  <parameter name="diffViewType">
    <category>input-only</category>
    <type><enum><choice>sideBySide</choice><choice>inline</choice></enum></type>
  </parameter>
  <parameter name="language">
    <category>input-only</category>
    <type><enum><!-- Monaco language IDs --></enum></type>
  </parameter>
  <parameter name="theme">
    <category>input-only</category>
    <type><enum>
      <choice>vs</choice><choice>vs-dark</choice><choice>hc-black</choice>
      <choice>monokai</choice><choice>dracula</choice><choice>github</choice>
      <!-- ... custom themes ... -->
    </enum></type>
  </parameter>

  <html-entry-point>index.html</html-entry-point>
</component>
```

### Phase 5: Monaco Implementation (index.html)

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    html, body { width: 100%; height: 400px; margin: 0; padding: 0; overflow: hidden; }
    #container { width: 100%; height: 100%; border: 1px solid #d4d4d4; box-sizing: border-box; }
  </style>
  <script src='APPIAN_JS_SDK_URI'></script>
</head>
<body>
  <div id="container"></div>
  <script src="__shared/monaco-editor/vs/loader.js"></script>
  <script src="themes.js"></script>
  <script>
    // State variables
    var editor = null;
    var diffEditor = null;
    var currentEditorType = null;
    var loaded = false;

    // Configure AMD loader
    require.config({ paths: { 'vs': '__shared/monaco-editor/vs' } });

    // Load Monaco
    require(['vs/editor/editor.main'], function() {
      registerCustomThemes();
      Appian.Component.onNewValue(handleNewValue);
    });

    function handleNewValue(params) {
      var editorMode = params['editorMode'] || 'editor';

      // Switch editor type if needed
      if (currentEditorType !== editorMode) {
        disposeEditors();
        if (editorMode === 'diff') {
          createDiffEditor(params);
        } else {
          createStandardEditor(params);
        }
        currentEditorType = editorMode;
      } else {
        updateEditor(params);
      }

      handleHeight(params);
      loaded = true;
    }

    function createStandardEditor(params) {
      editor = monaco.editor.create(document.getElementById('container'), {
        value: params['text'] || '',
        language: params['language'] || 'plaintext',
        theme: params['theme'] || 'vs',
        fontSize: parseInt(params['fontSize']) || 13,
        readOnly: params['readOnly'] || false,
        lineNumbers: params['hideLineNumbers'] ? 'off' : 'on',
        glyphMargin: !params['hideGutter'],
        folding: !params['disableCodeFolding'],
        tabSize: params['tabSize'] || 2,
        minimap: { enabled: false },
        automaticLayout: true
      });

      editor.onDidChangeModelContent(function() {
        Appian.Component.saveValue('text', editor.getValue());
      });
    }

    function createDiffEditor(params) {
      diffEditor = monaco.editor.createDiffEditor(document.getElementById('container'), {
        theme: params['theme'] || 'vs',
        fontSize: parseInt(params['fontSize']) || 13,
        renderSideBySide: params['diffViewType'] !== 'inline',
        originalEditable: false,
        minimap: { enabled: false },
        automaticLayout: true
      });

      var lang = params['language'] || 'plaintext';
      diffEditor.setModel({
        original: monaco.editor.createModel(params['originalValue'] || '', lang),
        modified: monaco.editor.createModel(params['modifiedValue'] || '', lang)
      });

      diffEditor.getModifiedEditor().updateOptions({ readOnly: params['readOnly'] || false });

      diffEditor.getModifiedEditor().onDidChangeModelContent(function() {
        Appian.Component.saveValue('modifiedValue', diffEditor.getModifiedEditor().getValue());
      });
    }

    function disposeEditors() {
      if (editor) {
        editor.dispose();
        editor = null;
      }
      if (diffEditor) {
        var model = diffEditor.getModel();
        if (model) {
          if (model.original) model.original.dispose();
          if (model.modified) model.modified.dispose();
        }
        diffEditor.dispose();
        diffEditor = null;
      }
    }

    function updateEditor(params) {
      // Update existing editor properties without recreating
      // Preserve cursor position during text updates
    }

    function handleHeight(params) {
      var height = params.height;
      var marginBelow = params['marginBelow'];

      // Map Appian height values
      if (typeof height === 'string') {
        var heightMap = { 'SHORT': 150, 'MEDIUM': 300, 'TALL': 450 };
        height = heightMap[height] || 400;
      }

      // Adjust for margin
      height -= (marginBelow === 'STANDARD') ? 15 : 2;

      document.getElementById('container').style.height = height + 'px';
      if (editor) editor.layout();
      if (diffEditor) diffEditor.layout();
    }
  </script>
</body>
</html>
```

### Phase 6: Testing

**Standard Editor Tests:**
- Text input/output sync
- Language switching
- Theme switching (all custom themes)
- ReadOnly mode
- Font size, gutter, line numbers, folding options
- Height variations (SHORT, MEDIUM, TALL, AUTO)

**Diff Editor Tests:**
- Side-by-side rendering
- Inline rendering
- Original value display (always read-only)
- Modified value editing and sync
- Mode switching (editor ↔ diff)
- Theme/language in diff mode

**Edge Cases:**
- Empty content
- Large files
- Cursor position preservation
- Editor disposal/recreation
- Memory leak prevention

---

## Language Mapping Reference

Monaco uses specific language IDs. Key languages to support:

| Monaco ID | Display Name |
|-----------|--------------|
| `javascript` | JavaScript |
| `typescript` | TypeScript |
| `json` | JSON |
| `html` | HTML |
| `css` | CSS |
| `scss` | SCSS |
| `python` | Python |
| `java` | Java |
| `csharp` | C# |
| `cpp` | C++ |
| `c` | C |
| `go` | Go |
| `rust` | Rust |
| `ruby` | Ruby |
| `php` | PHP |
| `sql` | SQL |
| `mysql` | MySQL |
| `xml` | XML |
| `yaml` | YAML |
| `markdown` | Markdown |
| `shell` | Shell |
| `powershell` | PowerShell |
| `dockerfile` | Dockerfile |
| `plaintext` | Plain Text |

---

## Custom Theme Colors Reference

### Monokai
```javascript
{
  base: 'vs-dark',
  colors: {
    'editor.background': '#272822',
    'editor.foreground': '#F8F8F2',
    'editor.lineHighlightBackground': '#3E3D32',
    'editor.selectionBackground': '#49483E',
    'editorLineNumber.foreground': '#8F908A'
  },
  rules: [
    { token: 'comment', foreground: '75715E', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'F92672' },
    { token: 'string', foreground: 'E6DB74' },
    { token: 'number', foreground: 'AE81FF' },
    { token: 'type', foreground: '66D9EF' },
    { token: 'function', foreground: 'A6E22E' }
  ]
}
```

### Dracula
```javascript
{
  base: 'vs-dark',
  colors: {
    'editor.background': '#282A36',
    'editor.foreground': '#F8F8F2',
    'editor.lineHighlightBackground': '#44475A',
    'editor.selectionBackground': '#44475A'
  },
  rules: [
    { token: 'comment', foreground: '6272A4', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'FF79C6' },
    { token: 'string', foreground: 'F1FA8C' },
    { token: 'number', foreground: 'BD93F9' },
    { token: 'function', foreground: '50FA7B' }
  ]
}
```

### GitHub (Light)
```javascript
{
  base: 'vs',
  colors: {
    'editor.background': '#FFFFFF',
    'editor.foreground': '#24292E',
    'editor.lineHighlightBackground': '#F6F8FA',
    'editor.selectionBackground': '#C8E1FF'
  },
  rules: [
    { token: 'comment', foreground: '6A737D', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'D73A49' },
    { token: 'string', foreground: '032F62' },
    { token: 'number', foreground: '005CC5' },
    { token: 'function', foreground: '6F42C1' }
  ]
}
```

---

## Implementation Checklist

- [x] Create `v2` git branch
- [x] Download Monaco Editor (v0.55.1) to `src/__shared/monaco-editor/vs/`
- [x] Create `src/codeEditorField/v2/` folder
- [x] Create `themes.js` with custom themes (monokai, dracula, github, solarized-dark, solarized-light, nord, tomorrow-night, cobalt, twilight)
- [x] Create `codeEditorFieldV2_en_US.properties`
- [x] Copy `code-json.svg` from v1
- [x] Update `appian-component-plugin.xml` with v2 component definition
- [x] Implement `index.html` - standard editor mode
- [x] Implement diff editor mode
- [ ] Test standard editor functionality
- [ ] Test diff editor functionality
- [ ] Test all custom themes
- [ ] Test height variations
- [ ] Verify no memory leaks on editor switching
- [ ] Merge `v2` branch to `master` when ready

---

## Resources

- [Monaco Editor Documentation](https://microsoft.github.io/monaco-editor/)
- [Monaco API Reference](https://microsoft.github.io/monaco-editor/api/index.html)
- [Monaco NPM Package](https://www.npmjs.com/package/monaco-editor)
- [Appian Component Plugin JS API](https://docs.appian.com/suite/help/latest/reference-js-api.html)
