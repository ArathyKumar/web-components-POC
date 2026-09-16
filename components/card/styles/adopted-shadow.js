/**
 * Encapsulated styles for <pf-card-shadow> shadow roots.
 *
 * Includes full PatternFly card CSS plus :host layout overrides.
 * Adopted via a shared constructable stylesheet — one parse, many instances.
 * Global patternfly.css is still required on the page for design tokens (--pf-t--*).
 */
import cardStyles from './card-styles.js';

const SHADOW_HOST_STYLES = `
/*
 * Box-sizing reset: global patternfly.css sets * { box-sizing: border-box } on
 * the page, but that rule does not cross shadow boundaries. Without this reset,
 * padding is added to element widths instead of being subtracted from content area.
 */
*, *::before, *::after {
  box-sizing: border-box;
}

/*
 * Element margin reset: global patternfly.css includes a normalize that resets
 * browser-default margins on block elements (e.g., p { margin: 0 }).
 * That normalize does NOT cross the shadow boundary, so any <p> elements inside
 * the shadow root would have the browser default margin-block-start/end of 1em.
 *
 * Concrete impact: .pf-v6-c-card__subtitle is a <p> element. Without this reset,
 * its default 12px top and bottom margins inflate the card header height in shadow
 * DOM while the light DOM card (which inherits patternfly.css) stays at the
 * correct height. This is the same category of issue as the box-sizing reset above.
 */
p, h1, h2, h3, h4, h5, h6, ul, ol, dl, figure, blockquote, pre {
  margin: 0;
  padding: 0;
}

:host {
  display: block;
}

:host([hidden]) {
  display: none;
}

/*
 * Expandable toggle icon rotation — the caret rotates 90° when the card is expanded.
 * PatternFly drives this via CSS on .pf-v6-c-card.pf-m-expanded, but the inner button
 * is inside the shadow root so we apply it directly here.
 */
:host([expanded]) .pf-v6-c-card__header-toggle-icon {
  transform: rotate(90deg);
}

.pf-v6-c-card__header-toggle-icon {
  display: inline-flex;
  align-items: center;
  transition: transform 0.2s ease;
}

/* Utility: hide elements with the hidden attribute even if PF CSS doesn't cover it */
[hidden] {
  display: none !important;
}

.pf-v6-svg {
  width: 1em;
  height: 1em;
  vertical-align: -0.125em;
}
`;

const SHADOW_CSS = [SHADOW_HOST_STYLES, cardStyles].join('\n');

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

  if (shadowRoot.querySelector('style[data-pf-adopted="card-shadow"]')) {
    return;
  }

  const style = document.createElement('style');
  style.setAttribute('data-pf-adopted', 'card-shadow');
  style.textContent = SHADOW_CSS;
  shadowRoot.appendChild(style);
}

/**
 * Adopts encapsulated PatternFly card styles into a shadow root.
 * @param {ShadowRoot} shadowRoot
 */
export function adoptPatternFlyCardShadowStyles(shadowRoot) {
  if (!shadowRoot) {
    return;
  }
  adoptSheetOnShadowRoot(shadowRoot);
}
