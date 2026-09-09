# Web Components POC

Production-ready PatternFly buttons as [Lit](https://lit.dev/) web components with shadow DOM encapsulation.

## Overview

| Approach | Element | Shadow DOM | PatternFly styles |
|----------|---------|------------|-------------------|
| Light DOM | `<light-dom-button>` | No | Global CSS from the page |
| Shadow DOM | `<pf-button-shadow>` | Yes | Shared adopted stylesheet (button, spinner, badge) |

**`<pf-button-shadow>`** mirrors the [PatternFly React Button](https://github.com/patternfly/patternfly-react/tree/main/packages/react-core/src/components/Button) API and is suitable for use in applications when PatternFly design tokens are loaded globally.

The legacy tag `<pf-button>` is registered automatically when importing `pf-button-shadow.js`.

## Prerequisites

- [Node.js](https://nodejs.org/) (npm included)
- A browser with support for shadow DOM and constructable stylesheets (fallback `<style>` tag is used when unavailable)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:8080](http://127.0.0.1:8080). Use the dev server — ES modules do not work over `file://`.

## Production usage

### 1. Load PatternFly tokens globally (required once per page)

Design tokens (`--pf-t--*`) must be on the document so they inherit into shadow DOM:

```html
<link rel="stylesheet" href="node_modules/@patternfly/patternfly/patternfly.css" />
<!-- or, for a smaller payload: patternfly-base.css + fonts -->
<link rel="stylesheet" href="styles/theme.css" />
```

### 2. Register the component

```html
<script type="module" src="components/pf-button-shadow.js"></script>
```

With a bundler:

```javascript
import 'components/pf-button-shadow.js';
```

### 3. Use in HTML

**Attribute label (simple):**

```html
<pf-button-shadow variant="primary">Primary</pf-button-shadow>
<!-- or -->
<pf-button-shadow label="Primary" variant="primary"></pf-button-shadow>
```

**Default slot (preferred for rich content):**

```html
<pf-button-shadow variant="primary">
  Save changes
</pf-button-shadow>
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
  const { isFavorited } = event.detail;
  btn.isFavorited = isFavorited;
  btn.ariaLabel = isFavorited ? 'Unfavorite' : 'Favorite';
});

btn.addEventListener('pf-loading-change', (event) => {
  const { isLoading } = event.detail;
  btn.isLoading = isLoading;
});
```

| Event | Detail | When |
|-------|--------|------|
| `pf-activate` | `{ variant, type }` | Every activation |
| `pf-favorite-change` | `{ isFavorited }` | Favorite button activated |
| `pf-loading-change` | `{ isLoading }` | Progress-capable button activated |

All events bubble and are composed (`composed: true`).

## Forms

`<pf-button-shadow>` is a [form-associated custom element](https://developer.mozilla.org/en-US/docs/Web/API/Element/attachInternals). Use `type`, `name`, `value`, and `form` like a native button. Submit and reset are handled on the host element via `form.requestSubmit(this)` so `name`/`value` participate correctly in submission.

```html
<form id="demo-form">
  <pf-button-shadow type="submit" name="action" value="save" variant="primary">
    Submit
  </pf-button-shadow>
  <pf-button-shadow type="reset" variant="secondary">Reset</pf-button-shadow>
</form>
```

Link to an external form with the `form` attribute:

```html
<pf-button-shadow type="submit" form="demo-form" name="action" value="save">Submit</pf-button-shadow>
```

## Theming with `::part()`

Shadow parts are exported for external styling without piercing encapsulation:

```css
pf-button-shadow::part(control) {
  border-radius: 999px;
}

pf-button-shadow::part(icon) {
  color: var(--pf-t--global--icon--color--brand--default);
}
```

Exported parts: `control`, `icon`, `icon-favorite`, `icon-favorited`, `text`, `sr-text`, `progress`, `spinner`, `count`, `badge`.

## Accessibility

- Set `aria-label` on icon-only buttons.
- Use `sr-text` for visually hidden supplementary label text (stateful counts).
- `component="span"` inline buttons support **Enter** and **Space** activation.
- Progress spinners expose `spinner-aria-label`, `spinner-aria-labelledby`, and `spinner-aria-value-text`.

## Styling architecture

| Concern | Implementation |
|---------|----------------|
| Component CSS | Single shared `CSSStyleSheet` via `adoptedStyleSheets` (`pf-adopted-styles.js`) |
| Tokens / theme | Global `patternfly.css` or `patternfly-base.css` on `:root` |
| Per-instance cost | One stylesheet adoption per shadow root (not one network fetch per button) |

Override brand colors in `styles/theme.css` without editing the component — tokens inherit into shadow DOM.

## API reference

### Content

| Attribute / slot | Description |
|------------------|-------------|
| Default slot | Button label (preferred) |
| `label` | Label text (alternative to slot) |
| `slot="icon"` | Custom icon markup |
| `icon` | Built-in icon name |
| `sr-text` | Screen-reader-only text appended to label |

### Appearance

| Attribute | Values | Default |
|-----------|--------|---------|
| `variant` | `primary`, `secondary`, `tertiary`, `danger`, `warning`, `link`, `plain`, `control`, `stateful` | `primary` |
| `size` | `default`, `sm`, `lg` | `default` |
| `state` | `read`, `unread`, `attention` (stateful) | `unread` |
| `is-block`, `is-danger`, `is-inline`, `is-circle`, … | Boolean flags | `false` |

### Form & behavior

| Attribute | Description |
|-----------|-------------|
| `type` | `button`, `submit`, `reset` |
| `button-type` | Legacy alias for `type` |
| `name` | Form field name |
| `value` | Form submission value |
| `form` | ID of associated `<form>` |
| `component` | `button`, `a`, or `span` |
| `href` | Link URL when `component="a"` |
| `is-disabled` | Native disabled state |
| `is-aria-disabled` | `aria-disabled` styling |
| `is-loading` | Progress spinner |

See `index.html` for full PatternFly doc examples (variants, stateful, progress, favorite, circle, etc.).

## Project structure

```
components/
├── pf-button-shadow.js     # Form-associated Lit button component (shadow DOM)
├── pf-adopted-styles.js    # Shared adopted stylesheet loader
├── pf-button-class-names.js
├── pf-button-icons.js
├── button-styles.js        # PatternFly button.css
├── spinner-styles.js
├── badge-styles.js
└── light-dom-button.js     # Light DOM comparison
```

## License

MIT
