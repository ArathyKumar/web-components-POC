# Web Components POC

Production-ready PatternFly buttons as [Lit](https://lit.dev/) web components.

## Overview

| Approach | Element | Shadow DOM | PatternFly styles |
|----------|---------|------------|-------------------|
| Light DOM | `<pf-button-light>` | No | Global `patternfly.css` + scoped host overrides |
| Shadow DOM | `<pf-button-shadow>` | Yes | Encapsulated adopted stylesheet (synced from `@patternfly/patternfly`) |

**`<pf-button-shadow>`** and **`<pf-button-light>`** share behavior via `components/pf-button/pf-button-core.js` (internal — not registered as a custom element). Load `patternfly.css` globally for design tokens.

## Prerequisites

- [Node.js](https://nodejs.org/) (npm included)
- A browser with shadow DOM and constructable stylesheets (fallback `<style>` tag when unavailable)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:8080](http://127.0.0.1:8080). Use the dev server — ES modules do not work over `file://`.

## Production usage

### 1. Load PatternFly globally (required once per page)

Design tokens (`--pf-t--*`) must be on the document so they inherit into shadow DOM. Light DOM also needs component CSS from this file:

```html
<link rel="stylesheet" href="node_modules/@patternfly/patternfly/patternfly.css" />
<link rel="stylesheet" href="styles/theme.css" />
```

### 2. Register the component

**Shadow DOM (self-contained component styles):**

```html
<script type="module" src="components/pf-button-shadow.js"></script>
```

**Light DOM (global PatternFly CSS required):**

```html
<link rel="stylesheet" href="node_modules/@patternfly/patternfly/patternfly.css" />
<script type="module" src="components/pf-button-light.js"></script>
```

With a bundler:

```javascript
import 'components/pf-button-shadow.js';
// or
import 'components/pf-button-light.js';
```

### 3. Use in HTML

**Default slot (label content):**

```html
<pf-button-shadow variant="primary">Save changes</pf-button-shadow>
```

**Custom icon slot:**

```html
<pf-button-shadow variant="plain" aria-label="Custom action">
  <svg slot="icon" ...></svg>
</pf-button-shadow>
```

**Built-in icons** use the `icon` attribute: `notification`, `add-circle`, `copy`, `close`, `upload`.

### 4. Controlled state via custom events

The component does **not** toggle favorite or loading state internally. Listen for custom events and update properties from your app:

```javascript
const btn = document.querySelector('#favorite-btn');

btn.addEventListener('pf-favorite-change', (event) => {
  const { favorited } = event.detail;
  btn.favorited = favorited;
  btn.ariaLabel = favorited ? 'Unfavorite' : 'Favorite';
});

btn.addEventListener('pf-loading-change', (event) => {
  const { loading } = event.detail;
  btn.loading = loading;
});
```

| Event | Detail | When |
|-------|--------|------|
| `pf-activate` | `{ variant, type }` | Every activation |
| `pf-favorite-change` | `{ favorited }` | Favorite button activated |
| `pf-loading-change` | `{ loading }` | Progress-capable button activated |

All events bubble and are composed (`composed: true`).

## Forms

Both elements are [form-associated custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Element/attachInternals). Use `type`, `name`, `value`, and `form` like a native button. Submit uses `SubmitEvent` with the host as `submitter`.

```html
<form id="demo-form">
  <pf-button-shadow type="submit" name="action" value="save" variant="primary">
    Submit
  </pf-button-shadow>
  <pf-button-shadow type="reset" variant="secondary">Reset</pf-button-shadow>
</form>
```

## Theming with `::part()` (shadow only)

```css
pf-button-shadow::part(control) {
  border-radius: 999px;
}

pf-button-shadow::part(icon) {
  color: var(--pf-t--global--icon--color--brand--default);
}
```

For light DOM, style with attribute selectors: `pf-button-light [part="control"]`.

Exported parts: `control`, `icon`, `icon-favorite`, `icon-favorited`, `text`, `sr-text`, `progress`, `spinner`, `count`, `badge`.

## Accessibility

- Set `aria-label` on icon-only buttons.
- Use `sr-text` for visually hidden supplementary label text (stateful counts).
- `as="span"` inline buttons support **Enter** and **Space** activation.
- Call `focus()` on the host to focus the inner control.
- Progress spinners expose `spinner-aria-label`, `spinner-aria-labelledby`, and `spinner-aria-value-text`.

## Styling architecture

| Concern | Shadow DOM | Light DOM |
|---------|------------|-----------|
| Component CSS | `styles/pf-adopted-styles-shadow.js` (synced from package) | Global `patternfly.css` |
| Host overrides | Inside shadow root | `styles/pf-adopted-styles-light.js` (scoped to `pf-button-light`) |
| Tokens / theme | Global `patternfly.css` on `:root` | Global `patternfly.css` on `:root` |

Sync vendored CSS after upgrading PatternFly:

```bash
npm run sync-styles
```

## API reference

### Content

| Attribute / slot | Description |
|------------------|-------------|
| Default slot | Button label (required for visible text) |
| `slot="icon"` | Custom icon markup |
| `icon` | Built-in icon name |
| `sr-text` | Screen-reader-only text appended to label |

### Appearance

| Attribute | Values | Default |
|-----------|--------|---------|
| `variant` | `primary`, `secondary`, `tertiary`, `danger`, `warning`, `link`, `plain`, `control`, `stateful` | `primary` |
| `size` | `default`, `sm`, `lg` | `default` |
| `state` | `read`, `unread`, `attention` (stateful) | `unread` |
| `block`, `danger`, `inline`, `circle`, `favorite`, `loading`, … | Boolean flags | `false` |

### Form & behavior

| Attribute | Description |
|-----------|-------------|
| `type` | `button`, `submit`, `reset` |
| `name` | Form field name |
| `value` | Form submission value |
| `form` | ID of associated `<form>` |
| `as` | `button`, `a`, or `span` |
| `href` | Link URL when `as="a"` |
| `disabled` | Native disabled state |
| `aria-disabled` | `aria-disabled` styling |
| `loading` | Progress spinner |
| `control-id` | `id` on the inner activator element |

See `index.html` for full PatternFly doc examples.

## Project structure

```
components/
├── pf-button-shadow.js     # Shadow DOM implementation
├── pf-button-light.js      # Light DOM implementation
└── pf-button/              # Shared button implementation
    ├── pf-button-core.js       # Shared logic (not registered)
    ├── pf-button-class-names.js
    └── pf-button-icons.js
styles/
├── theme.css               # Brand token overrides
├── pf-adopted-styles-shadow.js  # Encapsulated component + host styles
├── pf-adopted-styles-light.js   # Scoped host overrides
├── button-styles.js        # Auto-generated from @patternfly/patternfly
├── spinner-styles.js
└── badge-styles.js
scripts/
└── sync-patternfly-styles.mjs
```

## License

MIT
