import buttonStyles from './button-styles.js';
import spinnerStyles from './spinner-styles.js';
import badgeStyles from './badge-styles.js';

const HOST_STYLES = `
:host {
  display: inline-block;
  vertical-align: middle;
  font-family: var(--pf-t--global--font--family--body, sans-serif);
}

:host([hidden]) {
  display: none;
}

:host([is-block]) {
  display: block;
  width: 100%;
}

.pf-v6-screen-reader {
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

/* Circle buttons are icon-only squares; min-width is derived from 1lh + padding. */
.pf-v6-c-button.pf-m-circle {
  --pf-v6-c-button--AlignItems: center;
  width: var(--pf-v6-c-button--MinWidth);
  min-height: var(--pf-v6-c-button--MinWidth);
}

.pf-v6-c-button.pf-m-circle .pf-v6-c-button__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 1lh;
  min-width: 1lh;
  line-height: 0;
}

.pf-v6-c-button.pf-m-circle .pf-v6-svg {
  display: block;
}

:host([is-circle]) {
  display: inline-block;
  line-height: 0;
}
`;

const ALL_CSS = [HOST_STYLES, buttonStyles, spinnerStyles, badgeStyles].join('\n');

let sharedSheet = null;

function getSharedSheet() {
  if (!sharedSheet) {
    sharedSheet = new CSSStyleSheet();
    sharedSheet.replaceSync(ALL_CSS);
  }
  return sharedSheet;
}

function adoptWithConstructableStylesheet(shadowRoot) {
  const sheet = getSharedSheet();
  if (!shadowRoot.adoptedStyleSheets.includes(sheet)) {
    shadowRoot.adoptedStyleSheets = [...shadowRoot.adoptedStyleSheets, sheet];
  }
}

function adoptWithStyleElement(shadowRoot) {
  if (shadowRoot.querySelector('style[data-pf-adopted]')) {
    return;
  }

  const style = document.createElement('style');
  style.setAttribute('data-pf-adopted', '');
  style.textContent = ALL_CSS;
  shadowRoot.insertBefore(style, shadowRoot.firstChild);
}

/**
 * Adopts shared PatternFly component styles into a shadow root (once per root).
 * Design tokens must be available on the document (load patternfly-base.css or patternfly.css globally).
 */
export function adoptPatternFlyStyles(shadowRoot) {
  if (!shadowRoot) {
    return;
  }

  if (typeof CSSStyleSheet !== 'undefined' && 'adoptedStyleSheets' in shadowRoot) {
    adoptWithConstructableStylesheet(shadowRoot);
    return;
  }

  adoptWithStyleElement(shadowRoot);
}
