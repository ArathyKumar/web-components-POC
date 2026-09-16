# Web Components POC

A [PatternFly v6](https://www.patternfly.org/) proof of concept built with [Lit](https://lit.dev/). Each component exists in two forms — **shadow DOM** (`pf-*-shadow`) and **light DOM** (`pf-*-light`) — with the same attributes, events, and form behavior.

**Components:** [Button](https://www.patternfly.org/components/button), [Accordion](https://www.patternfly.org/components/accordion), and [Badge](https://www.patternfly.org/components/badge).

Open the compare demos, inspect the source, and note where the implementations diverge. This is a **demonstration codebase**, not a production component library.

## Two implementations, one API

| | Shadow DOM | Light DOM |
|--|------------|-----------|
| **Tags** | `pf-button-shadow`, `pf-accordion-shadow`, `pf-accordion-item-shadow`, `pf-badge-shadow` | `pf-button-light`, `pf-accordion-light`, `pf-accordion-item-light`, `pf-badge-light` |
| **Render target** | Open shadow root per component | Host element (`createRenderRoot()` returns `this`) |
| **PatternFly CSS** | Adopted into shadow root (`components/*/styles/adopted-shadow.js`) | Global `patternfly.css` on the page |
| **Content projection** | Native `<slot>` | Host child nodes moved into Lit templates |
| **Theming from outside** | `::part()` via `part` + `exportparts` | Host CSS variables or BEM descendant selectors |
| **Package default** | `import 'web-components-poc'` → `pf-button-shadow.js` | `import 'web-components-poc/pf-button-light'` |

Both variants still require global `patternfly.css` for design tokens (`--pf-t--*`). Brand overrides live in `styles/global/theme.css`.

## What to look for in the demos

`demos/button.html` and `demos/accordion.html` render shadow and light variants side by side (shadow in the left column). While exploring, consider:

- **Style isolation** — Add a broad page rule targeting `.pf-v6-c-button` or `.pf-v6-c-accordion__toggle`. Which column changes?
- **Slots** — Inspect how label and icon content are projected. Shadow items use `<slot>`; light items re-query the DOM after each render.
- **Theming** — Compare `pf-button-shadow::part(control)` in `theme.css` with BEM selectors on `pf-accordion-item-light`. Which approach depends on internal markup?
- **Source size** — Shadow and light entry files are parallel, but light DOM carries extra projection logic for the same features.

The differences are intentional. The repo is structured so you can reach your own conclusion about which model fits reusable components.

## Prerequisites

- [Node.js](https://nodejs.org/) (npm included)
- A browser with shadow DOM and constructable stylesheets (fallback `<style>` tag when unavailable)

## Getting started

```bash
npm install   # also runs npm run sync-styles via postinstall
npm run dev
```

Open [http://127.0.0.1:8080](http://127.0.0.1:8080). ES modules require a dev server — they do not work over `file://`.

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
<script type="module" src="components/accordion/pf-accordion-shadow.js"></script>
<!-- Register light variants to enable the compare columns -->
<script type="module" src="components/button/pf-button-light.js"></script>
<script type="module" src="components/accordion/pf-accordion-light.js"></script>
```

With a bundler:

```javascript
import 'web-components-poc/pf-button-shadow';
import 'web-components-poc/pf-accordion-shadow';
```

## Shadow DOM

### Button — `<pf-button-shadow>`

Lit renders into an open shadow root. Button, spinner, and badge CSS are adopted via a shared constructable stylesheet in `components/button/styles/adopted-shadow.js` (one parse, many instances).

| Concern | Approach |
|---------|----------|
| Slots | Native `<slot>` and `<slot name="icon">` |
| Theming | `exportparts` on the activator — `pf-button-shadow::part(control)`, `::part(icon)`, etc. |
| Forms | `formAssociated` + `ElementInternals` |
| Internal queries | `this.renderRoot.querySelector('[part="control"]')` |

Exported parts: `control`, `icon`, `icon-favorite`, `icon-favorited`, `text`, `sr-text`, `progress`, `spinner`, `count`, `badge`.

### Accordion — `<pf-accordion-shadow>` / `<pf-accordion-item-shadow>`

Container + item elements; each item owns a shadow root.

| Concern | Approach |
|---------|----------|
| Slots | Default → toggle label; `slot="content"` → panel |
| Theming | Shadow parts: `item`, `toggle`, `toggle-icon`, `content` |
| Modifiers | Parent classes (plain, glass) re-applied per item via `pf-m-item-host` inside shadow |
| A11y | `aria-expanded`, `aria-controls`, `hidden` + `inert` on collapsed panels; keyboard nav in `accordion-a11y.js` |

## Light DOM

### Button — `<pf-button-light>`

Lit renders directly onto the host. Component CSS comes from global `patternfly.css`; `styles/adopted-light.js` adds document-level host overrides.

| Concern | Approach |
|---------|----------|
| Slots | Host children passed into the template; recovered on re-render via `.pf-v6-c-button__text` |
| Theming | CSS variables on `pf-button-light` or selectors on `.pf-v6-c-button` — no `part` attributes |
| Forms | Same `ElementInternals` API as shadow |
| Internal queries | `this.querySelector('.pf-v6-c-button')` |

> Setting `textContent` on `<pf-button-light>` removes host children and breaks label/icon projection.

### Accordion — `<pf-accordion-light>` / `<pf-accordion-item-light>`

Same attributes and events as shadow. Items use `display: contents` on the host so accordion BEM structure stays flat.

| Concern | Approach |
|---------|----------|
| Slots | Non-`slot="content"` children → toggle; `[slot="content"]` → panel |
| Theming | BEM selectors under `pf-accordion-item-light` (e.g. `.pf-v6-c-accordion__toggle`) |
| A11y | Same panel and ARIA wiring; keyboard nav shares `accordion-a11y.js` |

## Usage

Examples below use `pf-button-shadow`. Replace `-shadow` with `-light` to exercise the other implementation.

### Label (default slot)

```html
<pf-button-shadow variant="primary">Save changes</pf-button-shadow>
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

Both button variants are [form-associated custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Element/attachInternals). Use `type`, `name`, `value`, and `form` like a native button. Submit uses `SubmitEvent` with the host as `submitter`.

```html
<form id="demo-form">
  <pf-button-shadow type="submit" name="action" value="save" variant="primary">
    Submit
  </pf-button-shadow>
  <pf-button-shadow type="reset" variant="secondary">Reset</pf-button-shadow>
</form>
```

## Theming

See `styles/global/theme.css` for working examples of both approaches.

### Shadow DOM — `::part()`

```css
pf-button-shadow::part(control) {
  border-radius: 999px;
}

pf-accordion-item-shadow.fluid-heading-markup::part(toggle) {
  --pf-v6-c-accordion__toggle--BackgroundColor: #0066cc;
}
```

Shadow buttons use a theme bridge in `components/button/styles/adopted-shadow.js`: PatternFly sets modifier tokens on `.pf-m-primary` / `.pf-m-secondary`, which blocks host inheritance, so host/`::part()` overrides are re-mapped onto the inner control. Secondary borders require `--pf-v6-c-button--BorderColor` (drawn on `::after`), not raw `border-color`.

### Light DOM — host vars and BEM selectors

```css
pf-button-light {
  --pf-v6-c-button--m-primary--BackgroundColor: #008768;
}

pf-accordion-item-light.fluid-heading-markup .pf-v6-c-accordion__toggle {
  --pf-v6-c-accordion__toggle--BackgroundColor: #0066cc;
}
```

Light buttons use a matching bridge in `components/button/styles/adopted-light.js`.

## Styling architecture

| Concern | Shadow DOM | Light DOM |
|---------|------------|-----------|
| Component CSS | `components/*/styles/adopted-shadow.js` (shared constructable sheet) | Global `patternfly.css` |
| Host overrides | Inside each shadow root | `styles/adopted-light.js` (document-level) |
| External theming | `::part()` on `pf-*-shadow` | Host vars or BEM on `pf-*-light` |
| Theme bridge (buttons) | `adopted-shadow.js` | `adopted-light.js` |
| Design tokens | Global `patternfly.css` on `:root` | Same |
| Brand overrides | `styles/global/theme.css` | Same |

Sync vendored CSS after upgrading PatternFly:

```bash
npm run sync-styles
```

## API reference

### Button — content

| Attribute / slot | Description |
|------------------|-------------|
| Default slot | Button label (required for visible text) |
| `slot="icon"` | Custom icon markup |
| `icon` | Built-in icon name |
| `sr-text` | Screen-reader-only text appended to label |

### Button — appearance

| Attribute | Values | Default |
|-----------|--------|---------|
| `variant` | `primary`, `secondary`, `tertiary`, `danger`, `warning`, `link`, `plain`, `control`, `stateful` | `primary` |
| `size` | `default`, `sm`, `lg` | `default` |
| `state` | `read`, `unread`, `attention` (stateful) | `unread` |
| `block`, `danger`, `inline`, `circle`, `favorite`, `loading`, … | Boolean flags | `false` |

### Button — form and behavior

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
| `control-id` | `id` on the inner activator (`button`, `a`, or `span` activator) |

See `demos/button.html` for full PatternFly button doc examples.

### Accordion

| Attribute | Description |
|-----------|-------------|
| `definition-list` | Use `<dl>`/`<dt>`/`<dd>` markup (default `true`); set `false` for heading markup |
| `single-expand` | Only one item open at a time |
| `bordered`, `plain`, `no-plain-on-glass`, `display-lg`, `toggle-start` | PatternFly layout modifiers |
| `heading-level` | `h1`–`h6` when `definition-list="false"` (default `h3`) |
| `aria-label`, `extra-class` | Accessible name and additional BEM classes |

**Item attributes** (`pf-accordion-item-shadow` / `pf-accordion-item-light`):

| Attribute | Description |
|-----------|-------------|
| `expanded` | Open/closed state |
| `toggle-id`, `content-id` | ARIA ids (auto-generated if omitted) |
| `fixed` | Scrollable fixed-height panel |
| `custom-content` | Skip the default body wrapper |
| `content-aria-label`, `extra-class`, `content-extra-class` | Panel labeling and classes |

**Content projection:** default slot → toggle label; `<div slot="content">` → panel body.

| Event | Detail | When |
|-------|--------|------|
| `pf-accordion-toggle` | `{ item, expanded, toggleId }` | Item expanded/collapsed |

See `demos/accordion.html` for the side-by-side layout.

### Badge — `pf-badge-shadow` / `pf-badge-light`

A numeric annotation badge. Mirrors the [PatternFly Badge](https://www.patternfly.org/components/badge).

| Attribute | Description |
|-----------|-------------|
| `read` | Grey background with high-contrast border (`pf-m-read`) |
| `unread` | Brand-color background (`pf-m-unread`) |
| `disabled` | Muted disabled colors (`pf-m-disabled`); takes precedence over read/unread |
| `screen-reader-text` | Visually hidden label announced after the count (e.g. `"Unread Messages"`) |
| `class-name` | Additional BEM classes appended to `pf-v6-c-badge` |

Shadow exported parts: `badge`.

See `demos/badge.html` for variants and a theming example.

## Accessibility

- Set `aria-label` on icon-only buttons.
- Use `sr-text` for visually hidden supplementary label text.
- `as="span"` inline buttons support **Enter** and **Space** activation.
- Call `focus()` on the host to focus the inner control.
- Progress spinners expose `spinner-aria-label`, `spinner-aria-labelledby`, `spinner-aria-value-text`, `aria-valuemin`, and `aria-valuemax`.
- Accordion containers should have `aria-label` (or an associated visible heading). Items wire `aria-expanded`, `aria-controls`, and toggle/content ids automatically.
- Collapsed accordion panels use `hidden` and `inert` so focus cannot enter closed content.
- Arrow/Home/End keyboard navigation between accordion toggles is implemented in `components/accordion/accordion-a11y.js`.
- Hamburger buttons expose `aria-expanded` but do not auto-toggle `expanded` — set `expanded` in your click handler for animated menu icons.

## Known limitations

| Area | Shadow DOM | Light DOM |
|------|------------|-----------|
| Design tokens | Global `patternfly.css` required for `--pf-t--*` | Same |
| Accordion keyboard | Arrow/Home/End may not work on shadow toggles — `accordion-a11y.js` uses `event.target`, which is retargeted across shadow boundaries | Works — toggles are in the document tree |
| Accordion layout | `display: contents` + `pf-m-item-host` per item for PatternFly modifiers inside shadow | `display: contents` on item host |
| Content projection | Native slots | Manual; re-renders query BEM nodes to preserve author DOM |
| Theming surface | `::part()` + theme bridge | BEM classes / host CSS variables |
| Style scope | Encapsulated adopted stylesheet | Depends on global `patternfly.css`; page CSS can reach internals |
| Code duplication | ~2,900 lines mirrored across `-shadow` and `-light` entry files | Same |
| Testing | `npm run lint` — syntax only | Same |
| Legacy browsers | Per-shadow-root `<style>` fallback when Constructable Stylesheets unavailable | N/A |

## Project structure

```
web-components-POC/
├── index.html
├── package.json
├── demos/
│   ├── button.html                     # Shadow (left) vs light (right)
│   ├── accordion.html
│   └── badge.html
│
├── components/
│   ├── catalog.js
│   ├── button/
│   │   ├── pf-button-shadow.js
│   │   ├── pf-button-light.js
│   │   ├── index.js
│   │   └── styles/
│   ├── accordion/
│   │   ├── accordion-a11y.js
│   │   ├── pf-accordion-shadow.js
│   │   ├── pf-accordion-light.js
│   │   ├── index.js
│   │   └── styles/
│   └── badge/
│       ├── pf-badge-shadow.js
│       ├── pf-badge-light.js
│       ├── index.js
│       └── styles/
│
├── styles/
│   ├── adopted-light.js
│   └── global/
│       ├── theme.css
│       ├── site.css
│       └── demo.css
│
└── scripts/
    ├── sync-patternfly-styles.mjs
    └── render-catalog.js
```

Each component folder is self-contained. Shadow and light entry files implement the same API independently; `accordion-a11y.js` is the only shared behavior module.

## File reference

### `components/button/`

| Path | Purpose |
|------|---------|
| `pf-button-shadow.js` | Shadow DOM button: slots, `exportparts`, form association, adopted styles. |
| `pf-button-light.js` | Light DOM button: manual content projection, global CSS dependency. |
| `styles/adopted-shadow.js` | Encapsulated stylesheet (shared constructable sheet + theme bridge). |
| `styles/adopted-light.js` | Document-level host overrides for light variant. |
| `styles/*-styles.js` | Auto-generated from PatternFly (do not edit). |

### `components/accordion/`

| Path | Purpose |
|------|---------|
| `accordion-a11y.js` | Arrow/Home/End keyboard navigation between accordion toggles. |
| `pf-accordion-shadow.js` | Shadow DOM accordion with `::part()` theming. |
| `pf-accordion-light.js` | Light DOM accordion with BEM-based theming. |
| `styles/adopted-shadow.js` | Encapsulated stylesheet and plain/glass compat rules. |
| `styles/adopted-light.js` | Document-level host overrides for light variant. |
| `styles/accordion-styles.js` | Auto-generated from PatternFly (do not edit). |

### `components/badge/`

| Path | Purpose |
|------|---------|
| `pf-badge-shadow.js` | Shadow DOM badge: encapsulated styles, native slot, `part="badge"`. |
| `pf-badge-light.js` | Light DOM badge: manual content projection, global CSS dependency. |
| `styles/adopted-shadow.js` | Encapsulated stylesheet for shadow badge. |
| `styles/adopted-light.js` | Document-level host overrides for light badge. |
| `styles/badge-styles.js` | Auto-generated from PatternFly (do not edit). |

### `styles/`

| Path | Purpose |
|------|---------|
| `adopted-light.js` | Combines light host fragments; adopted once per document. |
| `global/theme.css` | Brand overrides — `::part()` for shadow, BEM/host vars for light. |
| `global/site.css` | Site layout and catalog styles. |
| `global/demo.css` | Compare layout for demo pages. |

### `scripts/`

| Path | Purpose |
|------|---------|
| `sync-patternfly-styles.mjs` | Writes synced CSS into `components/*/styles/*-styles.js`. |
| `render-catalog.js` | Renders the component catalog on `index.html`. |

## npm scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npx http-server . -o -c-1` | Start local dev server and open browser |
| `lint` | `node --check` on all `components/`, `scripts/`, `styles/` JS | Syntax validation only |
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
  "./accordion": "./components/accordion/index.js",
  "./pf-badge-shadow": "./components/badge/pf-badge-shadow.js",
  "./pf-badge-light": "./components/badge/pf-badge-light.js",
  "./badge": "./components/badge/index.js"
}
```

## License

MIT
