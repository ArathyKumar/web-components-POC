/**
 * Encapsulated styles for <pf-button-shadow> shadow roots.
 *
 * Includes full PatternFly button/spinner/badge CSS plus :host overrides.
 * Adopted into each component's shadow root — global patternfly.css is still
 * required on the page for design tokens (--pf-t--*) to resolve.
 */
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

/* Base SVG sizing from patternfly.css (not included in button.css). */
.pf-v6-svg {
  width: 1em;
  height: 1em;
  vertical-align: -0.125em;
}
`;

/**
 * Shadow-only interaction fixes for icon animations driven by :hover/:focus.
 * PatternFly sets rotate/scale via custom properties on the button; in shadow
 * roots, also target the icon directly from :host() so pointer and keyboard
 * focus reliably trigger the transition.
 */
const SHADOW_INTERACTION_FIXES = `
:host(:hover:not([disabled]):not([aria-disabled])) .pf-v6-c-button.pf-m-settings .pf-v6-c-button__icon,
:host(:focus-within:not([disabled]):not([aria-disabled])) .pf-v6-c-button.pf-m-settings .pf-v6-c-button__icon,
.pf-v6-c-button.pf-m-settings:hover .pf-v6-c-button__icon,
.pf-v6-c-button.pf-m-settings:focus .pf-v6-c-button__icon,
.pf-v6-c-button.pf-m-settings.pf-m-shadow-hover .pf-v6-c-button__icon {
  rotate: var(--pf-v6-c-button--m-settings--hover__icon--Rotate, 60deg);
  transition-property: rotate;
  transition-duration: var(--pf-v6-c-button--m-settings--hover__icon--TransitionDuration);
  transition-timing-function: var(--pf-v6-c-button--m-settings--hover__icon--TransitionTimingFunction);
}

:host(:hover:not([disabled]):not([aria-disabled])) .pf-v6-c-button.pf-m-hamburger .pf-v6-c-button__icon,
:host(:focus-within:not([disabled]):not([aria-disabled])) .pf-v6-c-button.pf-m-hamburger .pf-v6-c-button__icon,
.pf-v6-c-button.pf-m-hamburger:hover .pf-v6-c-button__icon,
.pf-v6-c-button.pf-m-hamburger:focus .pf-v6-c-button__icon,
.pf-v6-c-button.pf-m-hamburger.pf-m-shadow-hover .pf-v6-c-button__icon {
  scale: var(--pf-v6-c-button--hover__icon--ScaleX, 1) var(--pf-v6-c-button--hover__icon--ScaleY, 1);
  transition-property: scale;
  transition-duration: var(--pf-v6-c-button--hover__icon--TransitionDuration);
  transition-timing-function: var(--pf-v6-c-button--hover__icon--TransitionTimingFunction);
}
`;

const SHADOW_CSS = [SHADOW_HOST_STYLES, COMPONENT_STYLES, SHADOW_INTERACTION_FIXES].join('\n');

/** Bump when SHADOW_CSS changes so dev reloads pick up adopted stylesheet updates. */
const SHADOW_STYLES_REVISION = 'settings-icon-hover-1';

let shadowSheet = null;
let shadowSheetRevision = null;

/**
 * Lazily creates and caches the shared constructable stylesheet for shadow roots.
 * @returns {CSSStyleSheet}
 */
function getShadowSheet() {
  if (!shadowSheet || shadowSheetRevision !== SHADOW_STYLES_REVISION) {
    shadowSheet = new CSSStyleSheet();
    shadowSheet.replaceSync(SHADOW_CSS);
    shadowSheetRevision = SHADOW_STYLES_REVISION;
  }
  return shadowSheet;
}

/**
 * Adopts the shared stylesheet on a shadow root, with a <style> fallback for older browsers.
 * @param {ShadowRoot} shadowRoot
 */
function adoptSheetOnShadowRoot(shadowRoot) {
  if (typeof CSSStyleSheet !== 'undefined' && 'adoptedStyleSheets' in shadowRoot) {
    shadowRoot.adoptedStyleSheets = [getShadowSheet()];
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
