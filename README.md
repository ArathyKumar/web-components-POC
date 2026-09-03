# Web Components POC

A proof of concept for building PatternFly-styled UI with native [Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components). The demo compares plain HTML, a light DOM custom element, and a shadow DOM custom element rendering the same PatternFly primary button.

## Overview

This project explores how PatternFly CSS interacts with web components in two encapsulation models:

| Approach | Element | Shadow DOM | PatternFly styles |
|----------|---------|------------|-------------------|
| Plain HTML | `<button>` | No | Global CSS from `index.html` |
| Light DOM | `<light-dom-button>` | No | Inherited from global CSS |
| Shadow DOM | `<shadow-dom-button>` | Yes | Loaded inside the shadow root |

**Light DOM** keeps component markup in the document tree, so global styles apply the same way they do to plain HTML.

**Shadow DOM** encapsulates markup behind a boundary. Global styles do not cross that boundary, so PatternFly CSS must be loaded inside the shadow root.

## Prerequisites

- [Node.js](https://nodejs.org/) (npm included)

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server (opens browser automatically)
npm run dev
```

The app is served at [http://127.0.0.1:8080](http://127.0.0.1:8080).

The dev script uses `http-server` with `-c-1` to disable caching so changes to HTML and JS are picked up on refresh during development.

## Opening `index.html` directly

You can open `index.html` via `file://`, but use classic `<script>` tags (not `type="module"`). Browsers block ES module scripts on `file://` URLs, which prevents custom elements from registering.

For day-to-day development, prefer `npm run dev` to avoid `file://` limitations around modules and asset loading.

## Project Structure

```
web-components-POC/
├── components/
│   ├── light-dom-button.js    # Custom element without shadow DOM
│   └── shadow-dom-button.js   # Custom element with shadow DOM
├── index.html                 # Demo page
├── package.json
├── package-lock.json
├── README.md
└── .gitignore
```

## Components

### `<light-dom-button>`

Renders a PatternFly primary button in the light DOM (no `attachShadow()`).

**Attributes**

| Attribute | Description | Default |
|-----------|-------------|---------|
| `label` | Button label text | `Light DOM Button` |

**Example**

```html
<light-dom-button label="Light DOM Button"></light-dom-button>
```

Global PatternFly CSS linked in `index.html` styles the inner `<button>` because the markup lives in the document tree.

### `<shadow-dom-button>`

Renders a PatternFly primary button inside an open shadow root.

**Attributes**

| Attribute | Description | Default |
|-----------|-------------|---------|
| `label` | Button label text | `Shadow DOM Button` |

**Example**

```html
<shadow-dom-button label="Shadow DOM Button"></shadow-dom-button>
```

The component attaches a shadow root and loads `patternfly.css` inside it via a `<link>` element so button styles apply within the shadow boundary.

## PatternFly CSS

This POC uses the full PatternFly bundle:

- **`index.html`** — `node_modules/@patternfly/patternfly/patternfly.css`
- **`shadow-dom-button.js`** — same file linked inside the shadow root

`patternfly.css` includes base styles (resets, tokens, fonts) and component styles (including buttons).

If you prefer a smaller CSS payload, you can use `patternfly-base.css` plus individual component files (for example `components/Button/button.css`) in both places instead of the full bundle.

## Customizing button labels

Set the `label` attribute on the custom elements in `index.html`:

```html
<light-dom-button label="My light DOM label"></light-dom-button>
<shadow-dom-button label="My shadow DOM label"></shadow-dom-button>
```

The plain HTML button label is set directly in `index.html` inside the `<span class="pf-v6-c-button__text">` element.

## Resources

- [MDN: Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)
- [MDN: Using shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM)
- [PatternFly](https://www.patternfly.org/)
- [web.dev: Web Components](https://web.dev/articles/web-components)

## License

MIT
