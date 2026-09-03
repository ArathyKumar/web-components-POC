# Web Components POC

A proof of concept for building PatternFly-styled UI with [Lit](https://lit.dev/) web components. The demo compares plain HTML, a light DOM Lit element, and a shadow DOM Lit element rendering the same PatternFly primary button.

## Overview

This project explores how PatternFly CSS interacts with web components in two encapsulation models:

| Approach | Element | Shadow DOM | PatternFly styles |
|----------|---------|------------|-------------------|
| Plain HTML | `<button>` | No | Global CSS from `index.html` |
| Light DOM | `<light-dom-button>` | No | Inherited from global CSS |
| Shadow DOM | `<shadow-dom-button>` | Yes | CDN CSS loaded inside the shadow root |

**Light DOM** keeps component markup in the document tree (`createRenderRoot()` returns `this`), so global styles apply the same way they do to plain HTML.

**Shadow DOM** encapsulates markup behind a boundary. Global styles do not cross that boundary, so PatternFly CSS must be loaded inside the shadow root.

## Prerequisites

- [Node.js](https://nodejs.org/) (npm included)

## Getting Started

```bash
# Install dependencies (Lit and PatternFly)
npm install

# Start the dev server (opens browser automatically)
npm run dev
```

The app is served at [http://127.0.0.1:8080](http://127.0.0.1:8080).

The dev script uses `http-server` with `-c-1` to disable caching so changes to HTML and JS are picked up on refresh during development.

## Opening `index.html` directly

Components are loaded as ES modules (`type="module"`) and depend on Lit via an import map in `index.html`. Browsers block module scripts on `file://` URLs, so custom elements will not register when opening the file directly.

Use `npm run dev` for local development.

## Project Structure

```
web-components-POC/
├── components/
│   ├── light-dom-button.js    # Lit element without shadow DOM
│   └── shadow-dom-button.js   # Lit element with shadow DOM (treat as external)
├── styles/
│   └── theme.css              # Global PatternFly token overrides
├── index.html                 # Demo page, import map, global PatternFly CSS
├── package.json
├── package-lock.json
├── README.md
└── .gitignore
```

## Components

Both custom elements extend `LitElement` and accept a `label` attribute for the button text.

### `<light-dom-button>`

Lit element that renders in the light DOM by overriding `createRenderRoot()` to return `this` instead of a shadow root.

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

Lit element that uses the default shadow root and loads PatternFly CSS inside it via a `<link>` element.

**Attributes**

| Attribute | Description | Default |
|-----------|-------------|---------|
| `label` | Button label text | `Shadow DOM Button` |

**Example**

```html
<shadow-dom-button label="Shadow DOM Button"></shadow-dom-button>
```

## PatternFly CSS

This POC uses the full `patternfly.css` bundle (base styles, tokens, fonts, and component CSS including buttons) from two sources:

| Location | Source |
|----------|--------|
| **`index.html`** | Local: `node_modules/@patternfly/patternfly/patternfly.css` |
| **`shadow-dom-button.js`** | CDN: `https://cdn.jsdelivr.net/npm/@patternfly/patternfly/patternfly.css` |

The page and light DOM button use the local npm package. The shadow DOM component loads PatternFly from jsDelivr inside its shadow root, since global styles do not penetrate the shadow boundary.

If you prefer a smaller CSS payload, you can use `patternfly-base.css` plus individual component files (for example `components/Button/button.css`) instead of the full bundle.

## Global theming (without editing shadow DOM packages)

To change `pf-m-primary` background color globally, edit `styles/theme.css` and load it from `index.html` after PatternFly:

```html
<link rel="stylesheet" href="styles/theme.css" />
```

Override PatternFly **brand tokens** on `:root`:

```css
:root {
  --pf-t--global--color--brand--default: #008768;
  --pf-t--global--color--brand--hover: #006d54;
  --pf-t--global--color--brand--clicked: #004d3d;
}
```

This updates the HTML button, light DOM components, and **packaged shadow DOM components** (such as `shadow-dom-button.js`) without modifying their source. CSS custom properties inherit across the shadow boundary; PatternFly primary buttons resolve these tokens via `var(--pf-t--global--color--brand--*)`.

Rules in `theme.css` cannot style selectors inside a shadow root (for example `.pf-v6-c-button`), but token overrides on `:root` do reach shadow DOM when the component uses PatternFly variables.

## Lit and ES modules

Components import Lit from `node_modules` using a browser [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap) in `index.html`:

```html
<script type="importmap">
  {
    "imports": {
      "lit": "./node_modules/lit/index.js",
      "lit/": "./node_modules/lit/",
      ...
    }
  }
</script>
<script type="module" src="components/light-dom-button.js"></script>
<script type="module" src="components/shadow-dom-button.js"></script>
```

No bundler is required; `http-server` serves the modules directly.

## Customizing button labels

Set the `label` attribute on the custom elements in `index.html`:

```html
<light-dom-button label="My light DOM label"></light-dom-button>
<shadow-dom-button label="My shadow DOM label"></shadow-dom-button>
```

The plain HTML button label is set directly in `index.html` inside the `<span class="pf-v6-c-button__text">` element.

## Resources

- [Lit](https://lit.dev/)
- [MDN: Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)
- [MDN: Using shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM)
- [PatternFly](https://www.patternfly.org/)
- [web.dev: Web Components](https://web.dev/articles/web-components)

## License

MIT
