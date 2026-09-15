# Web Components POC

A [PatternFly v6](https://www.patternfly.org/) proof of concept built with [Lit](https://lit.dev/). Each component ships as **two parallel implementations** — shadow DOM and light DOM — so you can compare encapsulation, styling, and content projection side by side.

**Components:** [Button](https://www.patternfly.org/components/button) (`pf-button-shadow` / `pf-button-light`) and [Accordion](https://www.patternfly.org/components/accordion) (`pf-accordion-shadow` / `pf-accordion-light`).

This is a **demonstration codebase**, not a production component library. See [Known limitations](#known-limitations) for intentional tradeoffs and open issues.

## Overview

| Approach | Elements | Shadow root | PatternFly styles | Content projection | Theming |
|----------|----------|-------------|-------------------|--------------------|---------|
| Shadow DOM | `pf-*-shadow` | Yes | Encapsulated adopted stylesheet per shadow root | Native `<slot>` | `::part()` via `part` + `exportparts` |
| Light DOM | `pf-*-light` | No | Global `patternfly.css` + document-level host overrides | Manual DOM-node projection | Host CSS vars / BEM class selectors (no `part` attributes) |

Shadow and light variants share the same public API and behavior where possible. Implementation details differ — see [Shadow vs light DOM](#shadow-vs-light-dom).

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
<script type="module" src="components/button/pf-button-light.js"></script>
<script type="module" src="components/accordion/pf-accordion-shadow.js"></script>
<script type="module" src="components/accordion/pf-accordion-light.js"></script>
```

With a bundler:

```javascript
import 'web-components-poc/pf-button-shadow';
import 'web-components-poc/pf-button-light';
import 'web-components-poc/pf-accordion-shadow';
import 'web-components-poc/pf-accordion-light';
```

## Shadow vs light DOM

The POC exists to make these differences concrete. Use the compare layout in `demos/button.html` and `demos/accordion.html`.

### Button — `<pf-button-shadow>` / `<pf-button-light>`

| Concern | Shadow | Light |
|---------|--------|-------|
| Render target | Open shadow root (`this.shadowRoot` exists) | Host element (`createRenderRoot()` returns `this`) |
| Component CSS | Adopted into shadow root (`components/button/styles/adopted-shadow.js`) | Global `patternfly.css` on the page |
| Design tokens | Still need global `patternfly.css` for `--pf-t--*` inside shadow | Same global stylesheet |
| Content projection | Native `<slot>` and `<slot name="icon">` | Host child nodes passed into Lit template; recovered on re-render via BEM selectors |
| Theming from outside | `pf-button-shadow::part(control)` etc. (`exportparts` on activator) | `pf-button-light { --pf-v6-c-* }` or `pf-button-light .pf-v6-c-button` — **no `part` attributes** |
| Internal queries | `this.renderRoot.querySelector('[part="control"]')` | `this.querySelector('.pf-v6-c-button')` |

> **Light DOM caveat:** Avoid setting `textContent` on `<pf-button-light>` — it removes host children and breaks icon/label projection. Update slotted content or use attributes/events instead.

### Accordion — `<pf-accordion-shadow>` / `<pf-accordion-light>`

| Concern | Shadow | Light |
|---------|--------|-------|
| Structure | Container + item custom elements; each item has its own shadow root | Container + items render PatternFly BEM markup on the host |
| Content projection | Native slots: default → toggle label, `slot="content"` → panel | Manual: non-`slot="content"` children → toggle; `[slot="content"]` → panel |
| Theming from outside | `pf-accordion-item-shadow::part(toggle)` etc. (parts: `item`, `toggle`, `toggle-icon`, `content`) | BEM selectors under `pf-accordion-item-light` (e.g. `.pf-v6-c-accordion__toggle`) |
| Layout | Items use `display: contents`; parent modifiers re-applied per item inside shadow (`pf-m-item-host`) so plain/glass tokens resolve | Items use `display: contents` on the host for flat accordion layout |
| Keyboard nav | Shared `accordion-a11y.js`; see [known limitation](#known-limitations) for shadow retargeting | Arrow/Home/End between toggle buttons |

### What shadow DOM gives you here

- Style encapsulation — page CSS cannot accidentally restyle inner `.pf-v6-c-button` markup.
- `::part()` — theme internal regions without piercing the full shadow tree.
- Native slots — simpler, more robust content projection.

### What light DOM gives you here

- No shadow boundary — global PatternFly CSS applies directly; familiar BEM selectors.
- Simpler debugging — all markup visible in DevTools on the host.
- No `::part()` — theming is host CSS variables or descendant class selectors.

### What both approaches still share

- Global `patternfly.css` is required on every page (tokens, and light DOM component CSS).
- `styles/global/theme.css` for brand overrides.
- Form-associated button behavior via `ElementInternals`.

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

### Shadow DOM — `::part()` (shadow only)

```css
/* Button */
pf-button-shadow::part(control) {
  border-radius: 999px;
}

/* Accordion item */
pf-accordion-item-shadow.fluid-heading-markup::part(toggle) {
  --pf-v6-c-accordion__toggle--BackgroundColor: #0066cc;
}
```

Button exported parts: `control`, `icon`, `icon-favorite`, `icon-favorited`, `text`, `sr-text`, `progress`, `spinner`, `count`, `badge`.

Accordion exported parts: `item`, `toggle`, `toggle-icon`, `content`.

Shadow buttons use a **theme bridge** in `components/button/styles/adopted-shadow.js`: PatternFly sets modifier tokens on `.pf-m-primary` / `.pf-m-secondary`, which blocks host inheritance, so host/`::part()` overrides are re-mapped onto the inner control. Secondary borders require `--pf-v6-c-button--BorderColor` (drawn on `::after`), not raw `border-color`.

### Light DOM — host vars or BEM selectors (no `part`)

```css
/* Button — host tokens (preferred) */
pf-button-light {
  --pf-v6-c-button--m-primary--BackgroundColor: #008768;
}

/* Button — BEM descendant */
pf-button-light .pf-v6-c-button {
  border-radius: 999px;
}

/* Accordion */
pf-accordion-item-light.fluid-heading-markup .pf-v6-c-accordion__toggle {
  --pf-v6-c-accordion__toggle--BackgroundColor: #0066cc;
}
```

Light buttons use a matching theme bridge in `components/button/styles/adopted-light.js` (host vars → `.pf-m-primary` / `.pf-m-secondary`).

### Brand overrides

See `styles/global/theme.css` for scoped accordion + button examples. Tokens on `:root` or a container inherit into shadow DOM automatically.

## Styling architecture

| Concern | Shadow DOM | Light DOM |
|---------|------------|-----------|
| Component CSS | `components/*/styles/adopted-shadow.js` (shared constructable sheet per component type) | Global `patternfly.css` |
| Host overrides | Inside each component shadow root | `styles/adopted-light.js` (document-level) |
| External theming | `::part()` on `pf-*-shadow` elements | Host CSS vars or BEM selectors on `pf-*-light` |
| Theme bridge (buttons) | `adopted-shadow.js` maps host/`::part()` vars → `.pf-m-primary` / `.pf-m-secondary` | `adopted-light.js` maps host vars → modifier classes |
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
| `control-id` | `id` on the inner activator (`button`, `a`, or `span` activator) |

See `demos/button.html` for full PatternFly button doc examples (variants, sizes, progress, favorites, forms, icons).

### Accordion (`pf-accordion-shadow` / `pf-accordion-light`)

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

**Content projection:** default slot → toggle label; `<div slot="content">` → panel body. Light DOM items preserve rich toggle markup (not flattened to text).

| Event | Detail | When |
|-------|--------|------|
| `pf-accordion-toggle` | `{ item, expanded, toggleId }` | Item expanded/collapsed |

See `demos/accordion.html` for side-by-side shadow and light examples.

## Accessibility

- Set `aria-label` on icon-only buttons.
- Use `sr-text` for visually hidden supplementary label text.
- `as="span"` inline buttons support **Enter** and **Space** activation.
- Call `focus()` on the host to focus the inner control.
- Progress spinners expose `spinner-aria-label`, `spinner-aria-labelledby`, `spinner-aria-value-text`, `aria-valuemin`, and `aria-valuemax`.
- Accordion containers should have `aria-label` (or an associated visible heading). Items wire `aria-expanded`, `aria-controls`, and toggle/content ids automatically.
- Collapsed accordion panels use `hidden` and `inert` so focus cannot enter closed content.
- Arrow/Home/End keyboard navigation between accordion toggles is implemented in `components/accordion/accordion-a11y.js` (light DOM works; shadow has a known issue — see below).
- Hamburger buttons expose `aria-expanded` but do not auto-toggle `expanded` — set `expanded` in your click handler for animated menu icons.

## Known limitations

Intentional POC tradeoffs and open issues:

| Area | Issue | Notes |
|------|-------|-------|
| **Duplication** | ~2,900 lines duplicated across shadow/light entry files | Keeps each variant self-contained for side-by-side reading; fixes must be applied twice |
| **Shadow accordion keyboard** | Arrow/Home/End may not work on shadow toggles | `accordion-a11y.js` uses `event.target`, which is retargeted to the item host across shadow boundaries; needs `event.composedPath()` |
| **Light DOM projection** | Manual slot simulation is fragile | Re-renders rely on BEM queries to preserve author DOM; avoid `textContent` on light hosts |
| **Partial encapsulation** | Shadow components still need global `patternfly.css` | Design tokens (`--pf-t--*`) resolve from the document, not from adopted sheets alone |
| **Accordion layout** | `display: contents` on item hosts | Flattened layout for PatternFly structure; has known a11y/tree quirks in some browsers |
| **Shadow item modifiers** | `pf-m-item-host` wrapper per shadow item | Re-applies parent accordion modifiers inside each item shadow so plain/glass tokens work |
| **Demo compare** | Light accordion column uses `pf-button-shadow` in one section | `demos/accordion.html` fluid-heading-markup — should use `pf-button-light` for a fair comparison |
| **Testing** | Syntax lint only (`npm run lint`) | No unit, a11y, or visual regression tests |
| **Legacy fallback** | Per-shadow-root `<style>` injection | When Constructable Stylesheets are unavailable, full PF CSS is duplicated per instance |

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
│   │   ├── pf-button-shadow.js         # Shadow DOM button (self-contained)
│   │   ├── pf-button-light.js          # Light DOM button (self-contained)
│   │   ├── index.js                    # Package re-exports
│   │   └── styles/                     # Synced PF CSS + adopted shadow/light fragments
│   └── accordion/
│       ├── accordion-a11y.js           # Shared keyboard navigation helpers
│       ├── pf-accordion-shadow.js      # Shadow DOM accordion + item (self-contained)
│       ├── pf-accordion-light.js       # Light DOM accordion + item (self-contained)
│       ├── index.js
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

Each component folder is self-contained: entry files and `styles/` (synced PatternFly CSS plus adopted shadow/light rules). Button and accordion logic each live entirely in their shadow and light entry files, except accordion keyboard helpers in `accordion-a11y.js`.

## File reference

### `components/button/`

| Path | Purpose |
|------|---------|
| `pf-button-shadow.js` | Self-contained shadow DOM button: class names, icons, state, form association, slots, and `exportparts`. |
| `pf-button-light.js` | Self-contained light DOM button: same behavior with manual content projection (no `part` attributes). |
| `styles/adopted-shadow.js` | Shadow adopted stylesheet (host + button/spinner/badge CSS). |
| `styles/adopted-light.js` | Light host override CSS fragment for buttons. |
| `styles/*-styles.js` | Auto-generated from PatternFly (do not edit). |

### `components/accordion/`

| Path | Purpose |
|------|---------|
| `accordion-a11y.js` | Shared Arrow/Home/End keyboard navigation between accordion toggles. |
| `pf-accordion-shadow.js` | Self-contained shadow DOM accordion: container, items, class names, context, toggle behavior, shadow parts, and markup. |
| `pf-accordion-light.js` | Self-contained light DOM accordion: same behavior with manual content projection (no `part` attributes). |
| `styles/adopted-shadow.js` | Shadow adopted stylesheet and plain/glass compat rules. |
| `styles/adopted-light.js` | Light host override CSS fragment for accordions. |
| `styles/accordion-styles.js` | Auto-generated from PatternFly (do not edit). |

### `styles/`

| Path | Purpose |
|------|---------|
| `adopted-light.js` | Combines component light host fragments; adopted once per document. |
| `global/theme.css` | Brand/component token overrides; shadow uses `::part()`, light uses BEM/host vars. |
| `global/site.css` | Site layout and catalog styles. |
| `global/demo.css` | Demo page compare layout. |

### `scripts/`

| Path | Purpose |
|------|---------|
| `sync-patternfly-styles.mjs` | Writes synced CSS into `components/*/styles/*-styles.js`. |
| `render-catalog.js` | Renders the component catalog on `index.html` (safe DOM APIs, no `innerHTML` for dynamic tags). |

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
  "./accordion": "./components/accordion/index.js"
}
```

## License

MIT
