# Web Components POC — Light DOM Feasibility Study

A [PatternFly v6](https://www.patternfly.org/) proof of concept evaluating whether **light DOM web components with shared CSS** are a viable migration path for products.

Each component ships in two forms — a **shadow DOM** reference implementation (`pf-*-shadow`) and a **light DOM** candidate (`pf-*-light`). They expose the same attributes, events, and form behavior so you can compare them directly.

> **This is a demonstration codebase, not a production component library.**

---

## Why this POC exists

RHDS web components use shadow DOM (per W3C spec recommendations and RHDS team expertise). This is not in question. What *is* being validated is a different concern:

> *If shadow DOM requires forcing products to migrate, we have to maintain two separate CSS implementations — PF React and RHDS web components — for years. If light DOM components can share PF React CSS, existing consumers stay uninterrupted while styling is unified.*

| Scenario | CSS implementations | Product migration required |
|----------|---------------------|---------------------------|
| Shadow DOM web components only | Two (PF React + RHDS WC) | Yes — products must adopt RHDS WC |
| Light DOM with shared CSS | One (shared `pf-v6-*` classes) | No — products stay on PF React |

**Goal:** validate whether the light DOM approach is technically viable *enough* to serve as that migration path — or whether its tradeoffs make shadow DOM adoption the only defensible long-term choice regardless.

---

## Scope

Three component tiers cover the key structural patterns:

| Tier | Components | Patterns covered |
|------|-----------|-----------------|
| **Atom** | Button, Badge | Simple rendering, form association, icon slots |
| **Compound** | *(Card — planned)* | Nested structure, multiple regions |
| **Interactive** | Accordion | Keyboard navigation, expand/collapse state, compound items |

---

## How to run

**Prerequisites:** [Node.js](https://nodejs.org/) and a browser with shadow DOM support.

```bash
npm install   # also runs sync-styles via postinstall
npm run dev   # opens http://127.0.0.1:8080
```

ES modules require a dev server — they do not work over `file://`.

### Page setup (without a bundler)

```html
<link rel="stylesheet" href="node_modules/@patternfly/patternfly/patternfly.css" />
<link rel="stylesheet" href="styles/global/theme.css" />

<script type="importmap">
  {
    "imports": {
      "lit": "./node_modules/lit/index.js",
      "lit/":  "./node_modules/lit/"
    }
  }
</script>

<script type="module" src="components/button/pf-button-shadow.js"></script>
<script type="module" src="components/button/pf-button-light.js"></script>
```

With a bundler:

```js
import 'web-components-poc/pf-button-shadow';
import 'web-components-poc/pf-button-light';
```

---

## What the demos reveal

Open `demos/button.html`, `demos/accordion.html`, and `demos/badge.html`. Each page renders the **shadow DOM variant on the left** and the **light DOM variant on the right**. The differences below are **structural facts, not opinions** — use them to form your own conclusion.

### 1. Style isolation

Add a broad page rule targeting `.pf-v6-c-button` or `.pf-v6-c-accordion__toggle`:

```css
.pf-v6-c-button { background: red !important; }
```

- **Shadow DOM column:** unchanged — the shadow root's encapsulated stylesheet blocks the page rule.
- **Light DOM column:** affected — the component's markup is in the document tree and inherits page CSS.

**Relevance to adoption:** products with large existing stylesheets may unintentionally break light DOM components. Shadow DOM components are immune.

### 2. Content projection

Inspect how label text moves from the author's markup into the component's rendered output.

- **Shadow DOM:** native `<slot>` — the browser handles projection; no framework code required.
- **Light DOM:** Lit re-queries the host's child nodes after each render cycle and re-inserts them. Deleting the component's `textContent` from JS removes the label permanently.

**Relevance to adoption:** light DOM projection is fragile under direct DOM manipulation (common in legacy frameworks like jQuery or Backbone). Shadow DOM slots are mutation-safe.

### 3. Theming

Inspect `styles/global/theme.css` to compare both theming surfaces:

- **Shadow DOM:** `pf-button-shadow::part(control)` — explicit, scoped, requires no knowledge of internal markup.
- **Light DOM:** `pf-button-light .pf-v6-c-button.pf-m-primary` — requires knowledge of internal BEM class names; any internal rename is a breaking change.

**Relevance to adoption:** `::part()` creates a stable, versioned theming contract. BEM descendant selectors couple the consumer to implementation details.

### 4. Authoring API divergence (Badge)

The badge component exposes a difference in authoring syntax unavoidable without a shadow root:

```html
<!-- Shadow DOM: content via native slot -->
<pf-badge-shadow unread>7</pf-badge-shadow>

<!-- Light DOM: content via attribute — slots require a shadow root -->
<pf-badge-light unread count="7"></pf-badge-light>
```

**Relevance to adoption:** light DOM badge cannot match the React/shadow DOM authoring pattern of `<Badge>7</Badge>` — consumers must change their markup. This directly contradicts the "no migration required" premise.

### 5. Implementation complexity

Both entry files are kept intentionally parallel and unshared so the differences are visible. Examine:

- `components/button/pf-button-shadow.js` (~920 lines) vs `pf-button-light.js` (~980 lines)
- Light DOM carries extra DOM-scanning methods (`_getProjectableChildNodes`, `_getDefaultSlotNodes`, `_getContentNodes`) absent from the shadow variant.
- The shadow DOM button removed its icon hover workaround (`_syncIconHoverHandlers`) from the light variant because native CSS `:hover`/`:focus` handles it — **but** this means the light DOM relies on `patternfly.css` internals not to change.

---

## Implementation comparison

| Concern | Shadow DOM | Light DOM |
|---------|------------|-----------|
| **Render target** | Open shadow root | Host element (`createRenderRoot()` returns `this`) |
| **CSS scope** | Encapsulated per root | Global `patternfly.css` on the page |
| **Content projection** | Native `<slot>` — browser-managed | Host child nodes re-queried per render |
| **Authoring parity with React** | ✅ Same `children`/slot pattern | ❌ Attributes required for text-only content (Badge) |
| **Page style bleed** | ❌ Blocked by shadow boundary | ✅ Page CSS applies; can be an advantage or a hazard |
| **External theming** | `::part()` — explicit, version-stable | BEM descendant selectors — coupled to markup |
| **Form association** | `formAssociated` + `ElementInternals` | Same |
| **Box-sizing** | Requires explicit reset in shadow root | Inherits from `patternfly.css` |
| **Design tokens** | Resolved from page `:root` via `var()` | Same |
| **Keyboard nav (Accordion)** | `event.composedPath()[0]` needed to pierce shadow boundary | `event.target` works directly |
| **Bundle size (per component est.)** | < 10 KB | < 10 KB |
| **Legacy browser fallback** | `<style>` tag when Constructable Stylesheets unavailable | N/A |

---

## Success criteria tracker

### Technical viability

| Criterion | Shadow DOM | Light DOM |
|-----------|------------|-----------|
| Renders with shared PF CSS | ✅ | ✅ |
| Visual parity with React | ✅ | ✅ with caveats (box-sizing, slot API difference) |
| Works across frameworks | ✅ | ⚠️ Fragile under direct DOM mutation (jQuery, Backbone) |
| Bundle size < 10 KB avg | ✅ | ✅ |
| Authoring API matches React | ✅ | ⚠️ Badge requires `count=""` attribute — no slot without shadow |
| Immune to page style bleed | ✅ | ❌ |
| Stable theming contract | ✅ `::part()` | ⚠️ Depends on BEM class names staying stable |

### Open questions for product teams

These require feedback from **3–5 current RHDS web component consumers** to close:

1. **Migration effort:** is switching from current shadow DOM components to light DOM components *actually* lower effort than switching to PF React directly?
2. **Customization:** do the teams need `::part()` theming, or are host CSS variables and BEM selectors sufficient?
3. **DOM manipulation:** do their codebases mutate component children directly (jQuery patterns, test utilities)? If yes, light DOM projection breaks.
4. **Authoring parity:** does the `count=""` attribute pattern on Badge (and any similar divergence on other components) constitute an acceptable API difference?
5. **Long-term:** would they adopt light DOM over staying on RHDS shadow DOM components, or does the theming surface regression push them back to shadow DOM anyway?

---

## Component API

### Button — `<pf-button-shadow>` / `<pf-button-light>`

#### Content

| Attribute / slot | Description |
|-----------------|-------------|
| Default slot | Button label |
| `slot="icon"` | Custom icon markup |
| `icon` | Built-in icon: `notification`, `add-circle`, `copy`, `close`, `upload` |
| `sr-text` | Screen-reader-only text appended to the label |

#### Appearance

| Attribute | Values | Default |
|-----------|--------|---------|
| `variant` | `primary` `secondary` `tertiary` `danger` `warning` `link` `plain` `control` `stateful` | `primary` |
| `size` | `default` `sm` `lg` | `default` |
| `state` | `read` `unread` `attention` *(stateful variant only)* | `unread` |
| `block` `danger` `inline` `circle` `no-padding` | Boolean layout flags | `false` |
| `favorite` `loading` `clicked` `settings` `hamburger` `docked` `text-expanded` | Boolean state flags | `false` |
| `extra-class` | Additional BEM classes on the activator | — |

#### Behavior and forms

| Attribute | Description |
|-----------|-------------|
| `as` | Activator tag: `button` (default), `a`, or `span` |
| `href` `rel` `target` | Link attributes when `as="a"` |
| `type` | `button` `submit` `reset` |
| `name` `value` `form` | Form association |
| `disabled` | Native disabled; blocks submission |
| `aria-disabled` | Visible but announced as disabled |
| `idle-label` / `loading-label` | Progress label text (bypasses default slot) |
| `spinner-aria-label` `spinner-aria-labelledby` `spinner-aria-value-text` | Spinner accessibility |
| `auto-toggle-favorite` / `auto-toggle-loading` | `false` for controlled mode |
| `aria-label-favorited` / `aria-label-unfavorited` | Per-state favorite labels |
| `control-id` | `id` on the inner activator element |
| `hamburger-variant` | `expand` or `collapse` — hamburger animation direction |

#### Events

| Event | `detail` | When |
|-------|---------|------|
| `pf-activate` | `{ variant, type }` | Every activation |
| `pf-favorite-change` | `{ favorited }` | Favorite button activated |
| `pf-loading-change` | `{ loading }` | Progress-capable button activated |

All events bubble and are `composed: true`.

---

### Accordion — `<pf-accordion-shadow>` / `<pf-accordion-light>`

#### Container attributes

| Attribute | Description |
|-----------|-------------|
| `definition-list` | Use `<dl>`/`<dt>`/`<dd>` (default `true`); `false` for heading markup |
| `single-expand` | Only one item open at a time |
| `bordered` `plain` `no-plain-on-glass` `display-lg` `toggle-start` | PF layout modifiers |
| `heading-level` | `h1`–`h6` when `definition-list="false"` (default `h3`) |
| `aria-label` `extra-class` | Accessible name, extra classes |

#### Item attributes — `pf-accordion-item-shadow` / `pf-accordion-item-light`

| Attribute | Description |
|-----------|-------------|
| `expanded` | Open / closed |
| `toggle-id` `content-id` | ARIA ids (auto-generated if omitted) |
| `fixed` | Scrollable fixed-height panel |
| `custom-content` | Skip the default body wrapper `<div>` |
| `content-aria-label` `extra-class` `content-extra-class` | Panel labeling and classes |

**Content projection:** default slot → toggle label; `<div slot="content">` → panel body.

#### Events

| Event | `detail` | When |
|-------|---------|------|
| `pf-accordion-toggle` | `{ item, expanded, toggleId }` | Item expanded or collapsed |

---

### Badge — `<pf-badge-shadow>` / `<pf-badge-light>`

Mirrors the [PatternFly Badge](https://www.patternfly.org/components/badge).

| Attribute | Description |
|-----------|-------------|
| `read` | Grey background + high-contrast border (`pf-m-read`) |
| `unread` | Brand-color background (`pf-m-unread`) |
| `disabled` | Muted colors (`pf-m-disabled`); takes precedence |
| `screen-reader-text` | Visually hidden label announced after the count |
| `extra-class` | Additional BEM classes on the inner span |
| `count` *(light DOM only)* | Display value — required because native slots need a shadow root |

Shadow exported parts: `badge`.

> **Note:** Shadow DOM accepts count as child content (`<pf-badge-shadow>7</pf-badge-shadow>`). Light DOM requires the `count` attribute (`<pf-badge-light count="7">`). This API asymmetry is a direct consequence of the light DOM constraint and is preserved intentionally to make the difference observable.

---

## Theming

`styles/global/theme.css` contains working examples of both approaches.

### Shadow DOM — `::part()`

```css
/* Pill-shaped primary button */
pf-button-shadow::part(control) {
  border-radius: 999px;
}

/* Accordion toggle background override */
pf-accordion-item-shadow.fluid-heading-markup::part(toggle) {
  --pf-v6-c-accordion__toggle--BackgroundColor: #0066cc;
}
```

Shadow buttons use a **theme bridge** in `components/button/styles/adopted-shadow.js`: PatternFly sets modifier tokens directly on `.pf-m-primary` / `.pf-m-secondary`, blocking direct host inheritance. The bridge re-maps host/`::part()` overrides onto the inner control.

### Light DOM — host vars and BEM selectors

```css
/* Primary button background via host variable */
pf-button-light {
  --pf-v6-c-button--m-primary--BackgroundColor: #008768;
}

/* Accordion toggle via BEM descendant selector */
pf-accordion-item-light.fluid-heading-markup .pf-v6-c-accordion__toggle {
  --pf-v6-c-accordion__toggle--BackgroundColor: #0066cc;
}
```

Light buttons use a matching bridge in `components/button/styles/adopted-light.js`.

---

## Styling architecture

| Concern | Shadow DOM | Light DOM |
|---------|------------|-----------|
| Component CSS source | `components/*/styles/adopted-shadow.js` | Global `patternfly.css` |
| Per-instance adoption | Shared constructable stylesheet (one parse, many roots) | N/A |
| Host-level overrides | Inside the shadow root | `styles/adopted-light.js` (document-level) |
| External theming | `::part()` | Host CSS variables or BEM descendant selectors |
| Design tokens (`--pf-t--*`) | Resolved from page `:root` | Same |
| Brand overrides | `styles/global/theme.css` | Same |

Regenerate auto-synced CSS after upgrading PatternFly:

```bash
npm run sync-styles
```

---

## Accessibility

- Icon-only buttons require `aria-label`.
- `sr-text` appends a visually hidden label inside the button text region.
- `as="span"` buttons support **Enter** and **Space** activation.
- `focus()` on the host delegates to the inner activator.
- Spinners expose `spinner-aria-label`, `spinner-aria-labelledby`, `spinner-aria-value-text`.
- Accordion containers should carry `aria-label`. Items auto-wire `aria-expanded`, `aria-controls`, and toggle/content ids.
- Collapsed accordion panels are `hidden` + `inert` so focus cannot enter closed sections.
- Arrow / Home / End keyboard navigation is in `components/accordion/accordion-a11y.js`.
  - Shadow DOM items require `event.composedPath()[0]` to resolve the correct toggle across the shadow boundary (using `event.target` alone silently breaks keyboard nav).
  - Light DOM items use `event.target` directly — toggles are in the document tree.
- Hamburger buttons expose `aria-expanded` but do not auto-toggle — set `expanded` in your handler.
- `disabled` on Badge is purely visual (non-interactive element); use `screen-reader-text` to convey state to assistive technology.

---

## Known limitations and open issues

| Area | Shadow DOM | Light DOM |
|------|------------|-----------|
| Design tokens | Global `patternfly.css` required for `--pf-t--*` | Same |
| Style bleed from page | ❌ Blocked by shadow boundary | ✅ Page CSS reaches component internals |
| Authoring parity with React | ✅ Native slots match React `children` | ⚠️ Text-only content requires attributes (Badge) |
| Content projection safety | ✅ Slots are mutation-safe | ⚠️ Direct DOM manipulation can corrupt projected content |
| Theming contract stability | ✅ `::part()` is versioned API | ⚠️ BEM class names must not change |
| Accordion keyboard nav | Needs `composedPath()[0]` (planned fix) | Works with `event.target` |
| Plain/glass compat | `:root` PF selectors re-applied per item via `pf-m-item-host` | Global cascade handles it |
| Code size | ~2,900 lines across shadow entry files | ~3,100 lines (extra projection logic) |
| Testing | `npm run lint` — syntax only | Same |
| Legacy browsers | `<style>` fallback when Constructable Stylesheets unavailable | N/A |

---

## Project structure

```
web-components-POC/
├── index.html                          # Component catalog
├── package.json
├── demos/
│   ├── button.html                     # Shadow (left) vs light (right)
│   ├── accordion.html
│   └── badge.html
│
├── components/
│   ├── catalog.js
│   ├── button/
│   │   ├── pf-button-shadow.js         # Shadow DOM implementation
│   │   ├── pf-button-light.js          # Light DOM implementation
│   │   ├── index.js                    # Barrel export
│   │   └── styles/
│   │       ├── adopted-shadow.js       # Encapsulated stylesheet + theme bridge
│   │       ├── adopted-light.js        # Document-level host overrides + theme bridge
│   │       ├── button-styles.js        # ← auto-generated (do not edit)
│   │       ├── badge-styles.js         # ← auto-generated (do not edit)
│   │       └── spinner-styles.js       # ← auto-generated (do not edit)
│   ├── accordion/
│   │   ├── accordion-a11y.js           # Shared keyboard navigation helpers
│   │   ├── pf-accordion-shadow.js
│   │   ├── pf-accordion-light.js
│   │   ├── index.js
│   │   └── styles/
│   │       ├── adopted-shadow.js
│   │       ├── adopted-light.js
│   │       └── accordion-styles.js     # ← auto-generated (do not edit)
│   └── badge/
│       ├── pf-badge-shadow.js
│       ├── pf-badge-light.js
│       ├── index.js
│       └── styles/
│           ├── adopted-shadow.js
│           ├── adopted-light.js
│           └── badge-styles.js         # ← auto-generated (do not edit)
│
├── styles/
│   ├── adopted-light.js                # Aggregates all light host overrides
│   └── global/
│       ├── theme.css                   # Brand overrides (::part() + BEM)
│       ├── site.css                    # Catalog layout
│       └── demo.css                    # Side-by-side compare layout
│
└── scripts/
    ├── sync-patternfly-styles.mjs      # Writes *-styles.js from PF source CSS
    └── render-catalog.js              # Populates index.html catalog
```

`accordion-a11y.js` is the **only** shared module between shadow and light implementations. All other files are kept separate so the differences remain visible.

---

## npm scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npx http-server . -o -c-1` | Start dev server and open browser |
| `lint` | `node --check` on all JS | Syntax validation |
| `sync-styles` | `node scripts/sync-patternfly-styles.mjs` | Regenerate `*-styles.js` from PatternFly |
| `postinstall` | `npm run sync-styles` | Runs automatically after `npm install` |

---

## Module exports

```json
{
  ".":                      "./components/button/pf-button-shadow.js",
  "./pf-button-shadow":     "./components/button/pf-button-shadow.js",
  "./pf-button-light":      "./components/button/pf-button-light.js",
  "./button":               "./components/button/index.js",
  "./pf-accordion-shadow":  "./components/accordion/pf-accordion-shadow.js",
  "./pf-accordion-light":   "./components/accordion/pf-accordion-light.js",
  "./accordion":            "./components/accordion/index.js",
  "./pf-badge-shadow":      "./components/badge/pf-badge-shadow.js",
  "./pf-badge-light":       "./components/badge/pf-badge-light.js",
  "./badge":                "./components/badge/index.js"
}
```

The package default (`"."`) exports the **shadow DOM button** — this is the reference implementation.

---

## License

MIT
