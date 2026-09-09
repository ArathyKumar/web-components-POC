/**
 * Scoped host overrides for <pf-button-light>.
 * Component CSS (.pf-v6-c-button, spinner, badge) must come from global patternfly.css.
 */

const LIGHT_HOST_STYLES = `
pf-button-light {
  display: inline-block;
  vertical-align: middle;
  font-family: var(--pf-t--global--font--family--body, sans-serif);
}

pf-button-light[hidden] {
  display: none;
}

pf-button-light[block] {
  display: block;
  width: 100%;
}

pf-button-light .pf-v6-screen-reader {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

pf-button-light .pf-v6-c-button.pf-m-circle {
  --pf-v6-c-button--AlignItems: center;
  width: var(--pf-v6-c-button--MinWidth);
  min-height: var(--pf-v6-c-button--MinWidth);
}

pf-button-light .pf-v6-c-button.pf-m-circle .pf-v6-c-button__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 1lh;
  min-width: 1lh;
  line-height: 0;
}

pf-button-light .pf-v6-c-button.pf-m-circle .pf-v6-svg {
  display: block;
}

pf-button-light[circle] {
  display: inline-block;
  line-height: 0;
}
`;

let lightSheet = null;
let lightHostStylesAdopted = false;

/**
 * Lazily creates and caches the constructable stylesheet for light DOM host overrides.
 * @returns {CSSStyleSheet}
 */
function getLightHostSheet() {
  if (!lightSheet) {
    lightSheet = new CSSStyleSheet();
    lightSheet.replaceSync(LIGHT_HOST_STYLES);
  }
  return lightSheet;
}

/**
 * Adopts scoped host overrides for light DOM buttons (once per document).
 * Load patternfly.css globally for component styles and design tokens.
 */
export function adoptPatternFlyLightHostStyles() {
  if (lightHostStylesAdopted || typeof document === 'undefined') {
    return;
  }

  if (typeof CSSStyleSheet !== 'undefined' && 'adoptedStyleSheets' in document) {
    const sheet = getLightHostSheet();
    if (!document.adoptedStyleSheets.includes(sheet)) {
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    }
  } else if (!document.head.querySelector('style[data-pf-adopted="light-host"]')) {
    const style = document.createElement('style');
    style.setAttribute('data-pf-adopted', 'light-host');
    style.textContent = LIGHT_HOST_STYLES;
    document.head.appendChild(style);
  }

  lightHostStylesAdopted = true;
}
