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
<link rel="stylesheet" href="styles/global/theme.css" />

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

<script type="module" src="components/button/pf-button-shadow.js"></script>
<!-- and/or -->
<script type="module" src="components/button/pf-button-light.js"></script>
```

With a bundler:

```javascript
import 'web-components-poc/pf-button-shadow';
// or
import 'web-components-poc/pf-button-light';
```

## Shadow vs light DOM

### `<pf-button-shadow>`

- **Encapsulation:** Lit renders into an open shadow root. `this.shadowRoot` exists.
- **Styles:** Full button/spinner/badge CSS is adopted into the shadow root via `components/button/styles/adopted-shadow.js`. Global `patternfly.css` is still required for design tokens (`--pf-t--*`) to resolve inside shadow.
- **Slots:** Native `<slot>` and `<slot name="icon">` project host children into the shadow tree.
- **Theming:** `exportparts` on the activator enables `pf-button-shadow::part(control)` styling.
- **Queries:** Activator is found via `this.renderRoot`; slotted children are queried on the host (`this`).

### `<pf-button-light>`

- **Encapsulation:** Lit renders directly onto the host (`createRenderRoot()` returns `this`). No shadow root.
- **Styles:** Component CSS (`.pf-v6-c-button`, spinner, badge) must come from global `patternfly.css`. `styles/adopted-light.js` adds only scoped host overrides.
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

### Favorite and loading state

By default, favorite and progress-capable buttons are **uncontrolled**: they toggle `favorited` and `loading` internally on activation and keep aria/labels in sync. Listen for events to observe changes, or set properties programmatically — presentation syncs on external updates and form reset.

For **controlled** mode, disable internal toggling and apply state from event handlers:

```html
<pf-button-shadow
  favorite
  auto-toggle-favorite="false"
  aria-label-unfavorited="Favorite example not favorited"
  aria-label-favorited="Favorite example favorited"
></pf-button-shadow>
```

```javascript
btn.addEventListener('pf-favorite-change', (event) => {
  btn.favorited = event.detail.favorited;
});
```

Configure labels with attributes:

```html
<pf-button-shadow
  favorite
  aria-label-unfavorited="Favorite example not favorited"
  aria-label-favorited="Favorite example favorited"
></pf-button-shadow>

<pf-button-shadow
  loading
  idle-label="Click to start loading"
  loading-label="Click to stop loading"
  spinner-aria-label="Content being loaded"
></pf-button-shadow>
```

**Progress label attributes bypass the default slot.** When `idle-label` or `loading-label` is set, the component renders that text instead of projecting host children. Do not leave label text in the slot when using these attributes.

**Favorite aria-label fallback:** If `aria-label-favorited` is omitted, the favorited state uses `"Unfavorite"`. If `aria-label-unfavorited` is omitted, the unfavorited state falls back to `aria-label` (or `"Favorite"` if neither is set).

**Progress toggle opt-out:** Buttons with spinner attributes are progress-capable and toggle `loading` on every click by default. For display-only spinners, set `auto-toggle-loading="false"` — the button still emits `pf-loading-change` with the proposed next state, but does not update `loading` internally.

Icon-only progress buttons (plain upload, circle upload) clear `aria-label` while loading so the spinner's `spinner-aria-label` takes over, then restore the saved label when idle.

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

**Brand tokens** — override in `styles/global/theme.css` on `:root` or a container. Tokens inherit into shadow DOM automatically.

## Styling architecture

| Concern | Shadow DOM | Light DOM |
|---------|------------|-----------|
| Component CSS | `components/*/styles/adopted-shadow.js` | Global `patternfly.css` |
| Host overrides | Inside each component shadow root | `styles/adopted-light.js` (document-level) |
| Design tokens | Global `patternfly.css` on `:root` | Global `patternfly.css` on `:root` |
| Brand overrides | `styles/global/theme.css` | `styles/global/theme.css` |

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
| `idle-label` / `loading-label` | Progress button label text (bypasses default slot) |
| `aria-label-favorited` / `aria-label-unfavorited` | Favorite button aria labels per state |
| `auto-toggle-favorite` / `auto-toggle-loading` | Lit properties; set to `false` for controlled mode (default: toggle on activate). Also settable as `btn.autoToggleFavorite = false`. |
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
├── index.html
├── package.json
├── demos/                              # Per-component demo pages
│   ├── button.html
│   └── accordion.html
│
├── components/
│   ├── catalog.js                      # Front-page component registry
│   ├── button/
│   │   ├── pf-button-shadow.js         # Shadow DOM entry
│   │   ├── pf-button-light.js          # Light DOM entry
│   │   ├── index.js                    # Package re-exports
│   │   ├── lib/                        # Shared logic (class names, icons, state)
│   │   └── styles/                     # Synced PF CSS + adopted shadow/light fragments
│   └── accordion/
│       ├── pf-accordion-shadow.js
│       ├── pf-accordion-light.js
│       ├── index.js
│       ├── lib/                        # Shared logic (base, item, context, …)
│       └── styles/
│
├── styles/
│   ├── adopted-light.js                # Document-level light DOM host overrides
│   └── global/                         # Site-wide CSS (theme, layout, demo)
│       ├── theme.css
│       ├── site.css
│       └── demo.css
│
└── scripts/
    ├── sync-patternfly-styles.mjs      # Syncs PF CSS into component style modules
    └── render-catalog.js
```

Each component folder is self-contained: entry files, shared `lib/`, and `styles/` (synced PatternFly CSS plus adopted shadow/light rules).

## File reference

### `components/button/`

| Path | Purpose |
|------|---------|
| `pf-button-shadow.js` | Registers `<pf-button-shadow>` with shadow encapsulation and `exportparts`. |
| `pf-button-light.js` | Registers `<pf-button-light>` in the light DOM. |
| `lib/class-names.js` | Maps props → PatternFly BEM classes. |
| `lib/icons.js` | SVG icon templates. |
| `lib/state.js` | Favorite/loading state helpers. |
| `styles/adopted-shadow.js` | Shadow adopted stylesheet (host + button/spinner/badge CSS). |
| `styles/adopted-light.js` | Light host override CSS fragment for buttons. |
| `styles/*-styles.js` | Auto-generated from PatternFly (do not edit). |

### `components/accordion/`

| Path | Purpose |
|------|---------|
| `pf-accordion-shadow.js` | Registers `<pf-accordion-shadow>` and `<pf-accordion-item-shadow>`. |
| `pf-accordion-light.js` | Registers `<pf-accordion-light>` and `<pf-accordion-item-light>`. |
| `lib/` | Shared accordion behavior, context, class names, and icons. |
| `styles/adopted-shadow.js` | Shadow adopted stylesheet and plain/glass compat rules. |
| `styles/adopted-light.js` | Light host override CSS fragment for accordions. |
| `styles/accordion-styles.js` | Auto-generated from PatternFly (do not edit). |

### `styles/`

| Path | Purpose |
|------|---------|
| `adopted-light.js` | Combines component light host fragments; adopted once per document. |
| `global/theme.css` | Brand/component token overrides. |
| `global/site.css` | Site layout and catalog styles. |
| `global/demo.css` | Demo page compare layout. |

### `scripts/`

| Path | Purpose |
|------|---------|
| `sync-patternfly-styles.mjs` | Writes synced CSS into `components/*/styles/*-styles.js`. |
| `render-catalog.js` | Renders the component catalog on `index.html`. |

## npm scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npx http-server . -o -c-1` | Start local dev server and open browser |
| `sync-styles` | `node scripts/sync-patternfly-styles.mjs` | Regenerate `components/*/styles/*-styles.js` from PatternFly |
| `postinstall` | `npm run sync-styles` | Runs automatically after `npm install` |

## Module exports

```json
{
  ".": "./components/button/pf-button-shadow.js",
  "./pf-button-shadow": "./components/button/pf-button-shadow.js",
  "./pf-button-light": "./components/button/pf-button-light.js",
  "./button": "./components/button/index.js",
  "./pf-accordion-shadow": "./components/accordion/pf-accordion-shadow.js",
  "./pf-accordion-light": "./components/accordion/pf-accordion-light.js",
  "./accordion": "./components/accordion/index.js"
}
```

## License

MIT
