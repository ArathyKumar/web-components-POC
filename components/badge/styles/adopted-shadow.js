/**
 * Encapsulated styles for <pf-badge-shadow> shadow roots.
 *
 * Includes full PatternFly badge CSS plus :host layout overrides.
 * Adopted into each shadow root via a shared constructable stylesheet — one parse,
 * many instances. Global patternfly.css is still required on the page for design
 * tokens (--pf-t--*) to resolve inside shadow.
 */
import badgeStyles from './badge-styles.js';

const SHADOW_HOST_STYLES = `
/*
 * Box-sizing reset — patternfly.css applies "*, *::before, *::after { box-sizing: border-box }"
 * globally, but that rule does not cross shadow boundaries. Without this reset the shadow badge
 * uses content-box (browser default), making min-width a content-only measurement and producing
 * a wider element than the light DOM equivalent.
 */
*, *::before, *::after {
  box-sizing: border-box;
}

:host {
  display: inline-block;
  vertical-align: middle;
  font-family: var(--pf-t--global--font--family--body, sans-serif);
}

:host([hidden]) {
  display: none;
}

/* Screen-reader-only utility — mirrors patternfly.css .pf-v6-screen-reader */
.pf-v6-screen-reader {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
`;

const SHADOW_CSS = [SHADOW_HOST_STYLES, badgeStyles].join('\n');

let shadowSheet = null;

/**
 * Lazily creates and caches the shared constructable stylesheet.
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
 * Adopts the shared stylesheet on a shadow root, with a <style> fallback.
 * @param {ShadowRoot} shadowRoot
 */
function adoptSheetOnShadowRoot(shadowRoot) {
  if (typeof CSSStyleSheet !== 'undefined' && 'adoptedStyleSheets' in shadowRoot) {
    shadowRoot.adoptedStyleSheets = [getShadowSheet()];
    return;
  }

  if (shadowRoot.querySelector('style[data-pf-adopted="badge-shadow"]')) {
    return;
  }

  const style = document.createElement('style');
  style.setAttribute('data-pf-adopted', 'badge-shadow');
  style.textContent = SHADOW_CSS;
  shadowRoot.appendChild(style);
}

/**
 * Adopts encapsulated PatternFly badge styles into a shadow root.
 * @param {ShadowRoot} shadowRoot
 */
export function adoptPatternFlyBadgeShadowStyles(shadowRoot) {
  if (!shadowRoot) {
    return;
  }
  adoptSheetOnShadowRoot(shadowRoot);
}
