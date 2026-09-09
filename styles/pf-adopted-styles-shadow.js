import buttonStyles from './button-styles.js';
import spinnerStyles from './spinner-styles.js';
import badgeStyles from './badge-styles.js';

const COMPONENT_STYLES = [buttonStyles, spinnerStyles, badgeStyles].join('\n');

const SHADOW_HOST_STYLES = `
:host {
  display: inline-block;
  vertical-align: middle;
  font-family: var(--pf-t--global--font--family--body, sans-serif);
}

:host([hidden]) {
  display: none;
}

:host([block]) {
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

:host([circle]) {
  display: inline-block;
  line-height: 0;
}
`;

const SHADOW_CSS = [SHADOW_HOST_STYLES, COMPONENT_STYLES].join('\n');

let shadowSheet = null;

/**
 * Lazily creates and caches the shared constructable stylesheet for shadow roots.
 * @returns {CSSStyleSheet}
 */
function getShadowSheet() {
  if (!shadowSheet) {
    shadowSheet = new CSSStyleSheet();
    shadowSheet.replaceSync(SHADOW_CSS);
  }
  return shadowSheet;
}

/**
 * Adopts the shared stylesheet on a shadow root, with a <style> fallback for older browsers.
 * @param {ShadowRoot} shadowRoot
 */
function adoptSheetOnShadowRoot(shadowRoot) {
  if (typeof CSSStyleSheet !== 'undefined' && 'adoptedStyleSheets' in shadowRoot) {
    const sheet = getShadowSheet();
    if (!shadowRoot.adoptedStyleSheets.includes(sheet)) {
      shadowRoot.adoptedStyleSheets = [...shadowRoot.adoptedStyleSheets, sheet];
    }
    return;
  }

  if (shadowRoot.querySelector('style[data-pf-adopted="shadow"]')) {
    return;
  }

  const style = document.createElement('style');
  style.setAttribute('data-pf-adopted', 'shadow');
  style.textContent = SHADOW_CSS;
  shadowRoot.appendChild(style);
}

/**
 * Adopts encapsulated PatternFly button/spinner/badge styles into a shadow root.
 * Design tokens must be available on the document (load patternfly.css globally).
 * @param {ShadowRoot} shadowRoot
 */
export function adoptPatternFlyShadowStyles(shadowRoot) {
  if (!shadowRoot) {
    return;
  }

  adoptSheetOnShadowRoot(shadowRoot);
}
