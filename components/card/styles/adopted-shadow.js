/**
 * Encapsulated styles for <pf-card-shadow> shadow roots.
 *
 * Includes full PatternFly card CSS plus :host layout overrides.
 * Adopted via a shared constructable stylesheet — one parse, many instances.
 * Global patternfly.css is still required on the page for design tokens (--pf-t--*).
 */
import cardStyles from './card-styles.js';
import checkStyles from './check-styles.js';
import radioStyles from './radio-styles.js';

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

/*
 * full-height: PatternFly’s pf-m-full-height sets height: 100% on .pf-v6-c-card.
 * That only works if every ancestor up to the sized container also resolves a
 * height. In React/HTML demos the card IS the direct child of the 15rem wrapper;
 * here the custom element sits in between, so the host must also be height: 100%
 * when [full-height] is present — otherwise the inner card’s 100% collapses to
 * content height.
 */
:host([full-height]) {
  height: 100%;
}

:host([full-height]) .pf-v6-c-card {
  height: 100%;
}

:host([hidden]) {
  display: none;
}

/*
 * Caret rotation is driven by PatternFly card CSS:
 *   .pf-v6-c-card.pf-m-expanded .pf-v6-c-card__header-toggle-icon { transform: rotate(-180deg) }
 * Do not override with a custom angle — that misaligns the toggle vs PF demos.
 */

/* Utility: hide elements with the hidden attribute even if PF CSS doesn't cover it */
[hidden] {
  display: none !important;
}

/*
 * Minimal plain-button chrome for the expandable toggle. Full button.css is not
 * adopted here; these rules keep the caret control visually aligned with PF.
 */
.pf-v6-c-card__header-toggle > .pf-v6-c-button.pf-m-plain {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--pf-t--global--spacer--sm, 0.5rem);
  margin: 0;
  color: inherit;
  background: transparent;
  border: 0;
  border-radius: var(--pf-t--global--border--radius--small, 3px);
  cursor: pointer;
}

.pf-v6-svg {
  width: 1em;
  height: 1em;
  vertical-align: -0.125em;
}
`;

const SHADOW_CSS = [SHADOW_HOST_STYLES, cardStyles, checkStyles, radioStyles].join('\n');

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
