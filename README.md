# Web Components POC

Production-ready [PatternFly](https://www.patternfly.org/components/button) buttons as [Lit](https://lit.dev/) web components, with separate shadow DOM and light DOM implementations.

## Overview

| Approach | Element | Shadow root | PatternFly styles | Content projection | Theming |
|----------|---------|-------------|-------------------|--------------------|---------|
| Shadow DOM | `<pf-button-shadow>` | Yes | Encapsulated adopted stylesheet | Native `<slot>` | `::part()` via `exportparts` |
| Light DOM | `<pf-button-light>` | No | Global `patternfly.css` + scoped host overrides | Manual DOM-node projection | `pf-button-light [part="…"]` selectors |

Both elements share the same public API and form behavior. Implementation details differ — see [Shadow vs light DOM](#shadow-vs-light-dom).

## Prerequisites

- [Node.js](https://nodejs.org/) (npm included)
- A browser with shadow DOM and constructable stylesheets (fallback `<style>` tag when unavailable)

## Getting started

```bash
npm install   # also runs npm run sync-styles via postinstall
npm run dev
```

Open [http://127.0.0.1:8080](http://127.0.0.1:8080). ES modules and Lit imports require a dev server — they do not work over `file://`.

### Page setup

```html
<link rel="stylesheet" href="node_modules/@patternfly/patternfly/patternfly.css" />
<link rel="stylesheet" href="styles/theme.css" />

<script type="importmap">
  {
    "imports": {
      "lit": "./node_modules/lit/index.js",
      "lit/": "./node_modules/lit/",
      "@lit/reactive-element": "./node_modules/@lit/reactive-element/reactive-element.js",
      "@lit/reactive-element/": "./node_modules/@lit/reactive-element/",
      "lit-element": "./node_modules/lit-element/index.js",
      "lit-element/": "./node_modules/lit-element/",
      "lit-html": "./node_modules/lit-html/lit-html.js",
      "lit-html/": "./node_modules/lit-html/"
    }
  }
</script>

<script type="module" src="components/pf-button-shadow.js"></script>
<!-- and/or -->
<script type="module" src="components/pf-button-light.js"></script>
```

With a bundler:

```javascript
import 'components/pf-button-shadow.js';
// or
import 'components/pf-button-light.js';
```

## Shadow vs light DOM

### `<pf-button-shadow>`

- **Encapsulation:** Lit renders into an open shadow root. `this.shadowRoot` exists.
- **Styles:** Full button/spinner/badge CSS is adopted into the shadow root via `styles/pf-adopted-styles-shadow.js`. Global `patternfly.css` is still required for design tokens (`--pf-t--*`) to resolve inside shadow.
- **Slots:** Native `<slot>` and `<slot name="icon">` project host children into the shadow tree.
- **Theming:** `exportparts` on the activator enables `pf-button-shadow::part(control)` styling.
- **Queries:** Activator is found via `this.renderRoot`; slotted children are queried on the host (`this`).

### `<pf-button-light>`

- **Encapsulation:** Lit renders directly onto the host (`createRenderRoot()` returns `this`). No shadow root.
- **Styles:** Component CSS (`.pf-v6-c-button`, spinner, badge) must come from global `patternfly.css`. `styles/pf-adopted-styles-light.js` adds only scoped host overrides.
- **Slots:** Native `<slot>` does not work without a shadow root. Label and icon content are projected by passing host child nodes into the Lit template.
- **Theming:** `part` attributes are plain markup hooks — use `pf-button-light [part="control"]`, not `::part()`.
- **Queries:** Activator is found via `this.querySelector` on the host.

> **Note:** Avoid setting `textContent` on `<pf-button-light>` to change labels — it removes all host children and breaks icon/label projection. Update slotted content or use attributes/events instead.

## Usage

### Label (default slot)

```html
<pf-button-shadow variant="primary">Save changes</pf-button-shadow>
<pf-button-light variant="primary">Save changes</pf-button-light>
```

### Custom icon slot

```html
<pf-button-shadow variant="plain" aria-label="Custom action">
  <svg slot="icon" ...></svg>
</pf-button-shadow>
```

Built-in icons use the `icon` attribute: `notification`, `add-circle`, `copy`, `close`, `upload`.

### Controlled state via custom events

The component does not toggle favorite or loading state internally. Listen for events and update properties from your app:

```javascript
const btn = document.querySelector('#favorite-btn');

btn.addEventListener('pf-favorite-change', (event) => {
  btn.favorited = event.detail.favorited;
  btn.ariaLabel = event.detail.favorited ? 'Unfavorite' : 'Favorite';
});

btn.addEventListener('pf-loading-change', (event) => {
  btn.loading = event.detail.loading;
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

## Theming

**Shadow DOM** — `::part()` selectors:

```css
pf-button-shadow::part(control) {
  border-radius: 999px;
}

pf-button-shadow::part(icon) {
  color: var(--pf-t--global--icon--color--brand--default);
}
```

Exported parts: `control`, `icon`, `icon-favorite`, `icon-favorited`, `text`, `sr-text`, `progress`, `spinner`, `count`, `badge`.

**Light DOM** — attribute selectors:

```css
pf-button-light [part="control"] {
  border-radius: 999px;
}
```

**Brand tokens** — override in `styles/theme.css` on `:root` or a container. Tokens inherit into shadow DOM automatically.

## Styling architecture

| Concern | Shadow DOM | Light DOM |
|---------|------------|-----------|
| Component CSS | `styles/pf-adopted-styles-shadow.js` (bundles synced CSS) | Global `patternfly.css` |
| Host overrides | Inside shadow root (`:host` rules) | `styles/pf-adopted-styles-light.js` (scoped to `pf-button-light`) |
| Design tokens | Global `patternfly.css` on `:root` | Global `patternfly.css` on `:root` |
| Brand overrides | `styles/theme.css` | `styles/theme.css` |

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

### Form and behavior

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

See `index.html` for full PatternFly button doc examples (variants, sizes, progress, favorites, forms, icons).

## Accessibility

- Set `aria-label` on icon-only buttons.
- Use `sr-text` for visually hidden supplementary label text.
- `as="span"` inline buttons support **Enter** and **Space** activation.
- Call `focus()` on the host to focus the inner control.
- Progress spinners expose `spinner-aria-label`, `spinner-aria-labelledby`, and `spinner-aria-value-text`.

## Project structure

```
web-components-POC/
├── index.html                          # Demo page (shadow + light button variants)
├── package.json                        # Dependencies, scripts, module exports
├── package-lock.json
├── README.md
│
├── components/
│   ├── pf-button-shadow.js             # Shadow DOM button — full self-contained implementation
│   ├── pf-button-light.js              # Light DOM button — full self-contained implementation
│   └── pf-button/
│       ├── pf-button-class-names.js    # Maps props → PatternFly BEM classes (shared)
│       └── pf-button-icons.js          # SVG icon templates (shared)
│
├── styles/
│   ├── theme.css                       # Brand token overrides (e.g. primary button color)
│   ├── pf-adopted-styles-shadow.js     # Shadow: bundles host + button/spinner/badge CSS for adoption
│   ├── pf-adopted-styles-light.js      # Light: scoped pf-button-light host overrides only
│   ├── button-styles.js                # Auto-generated from @patternfly/patternfly (do not edit)
│   ├── spinner-styles.js               # Auto-generated from @patternfly/patternfly (do not edit)
│   └── badge-styles.js                 # Auto-generated from @patternfly/patternfly (do not edit)
│
└── scripts/
    └── sync-patternfly-styles.mjs      # Copies PF CSS from node_modules into styles/*.js
```

## File reference

### Root

| File | Purpose |
|------|---------|
| `index.html` | Interactive demo mirroring [PatternFly Button docs](https://www.patternfly.org/components/button). Side-by-side shadow and light DOM sections with variants, sizes, progress, favorites, forms, and icons. Includes Lit import map and demo scripts for controlled state. |
| `package.json` | Project metadata. Exports `./pf-button-shadow` and `./pf-button-light`. Scripts: `dev`, `sync-styles`, `postinstall`. |
| `package-lock.json` | Locked dependency versions. |

### `components/`

| File | Purpose |
|------|---------|
| `pf-button-shadow.js` | Registers `<pf-button-shadow>`. Creates a shadow root, adopts encapsulated PatternFly CSS, uses native `<slot>` for label/icon projection, and exposes `exportparts` for `::part()` theming. Form-associated (FACE). |
| `pf-button-light.js` | Registers `<pf-button-light>`. Renders into the light DOM (no shadow root), relies on global `patternfly.css` for component styles, manually projects host children as label/icon content, and adopts scoped host overrides once per document. Form-associated (FACE). |
| `pf-button/pf-button-class-names.js` | Shared utility: maps component properties to PatternFly `pf-v6-c-button` BEM modifier classes. Used by both shadow and light implementations. |
| `pf-button/pf-button-icons.js` | Shared SVG icon templates (star, settings, hamburger, built-in icon map). Used by both implementations. |

### `styles/`

| File | Purpose |
|------|---------|
| `theme.css` | Optional brand token overrides on `:root` or containers. Tokens inherit into shadow DOM. Linked globally in `index.html`. |
| `pf-adopted-styles-shadow.js` | Builds a constructable stylesheet from host overrides + synced button/spinner/badge CSS. Adopted into each `<pf-button-shadow>` shadow root via `adoptPatternFlyShadowStyles()`. |
| `pf-adopted-styles-light.js` | Scoped host overrides for `<pf-button-light>` only (`display`, `block`, circle button fixes, screen-reader utility). Adopted once onto `document.adoptedStyleSheets`. Does not include component CSS. |
| `button-styles.js` | Auto-generated PatternFly `button.css` as a JS string export. Source: `node_modules/@patternfly/patternfly/components/Button/button.css`. |
| `spinner-styles.js` | Auto-generated PatternFly `spinner.css`. Used inside shadow root for loading state. |
| `badge-styles.js` | Auto-generated PatternFly `badge.css`. Used inside shadow root for count badges. |

### `scripts/`

| File | Purpose |
|------|---------|
| `sync-patternfly-styles.mjs` | Reads button, spinner, and badge CSS from `@patternfly/patternfly` in `node_modules` and writes `styles/button-styles.js`, `styles/spinner-styles.js`, and `styles/badge-styles.js`. Run via `npm run sync-styles` or automatically on `npm install`. |

## npm scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npx http-server . -o -c-1` | Start local dev server and open browser |
| `sync-styles` | `node scripts/sync-patternfly-styles.mjs` | Regenerate `styles/*-styles.js` from PatternFly package |
| `postinstall` | `npm run sync-styles` | Runs automatically after `npm install` |

## Module exports

```json
{
  ".": "./components/pf-button-shadow.js",
  "./pf-button-shadow": "./components/pf-button-shadow.js",
  "./pf-button-light": "./components/pf-button-light.js"
}
```

## License

MIT
