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
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

a.pf-v6-c-button[aria-disabled="true"] {
  pointer-events: none;
  cursor: not-allowed;
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

/**
 * Resolve theme overrides from :root / pf-button-shadow on :host, then map them onto
 * the inner control. Adopted component CSS sets modifier tokens on .pf-v6-c-button,
 * which blocks inherited --pf-v6-c-* values from the host.
 */
const SHADOW_THEME_BRIDGE = `
:host {
  --pf-button-theme-primary-color: var(--pf-v6-c-button--m-primary--Color, var(--pf-t--global--text--color--on-brand--default));
  --pf-button-theme-primary-bg: var(--pf-v6-c-button--m-primary--BackgroundColor, var(--pf-t--global--color--brand--default));
  --pf-button-theme-primary-icon-color: var(--pf-v6-c-button--m-primary__icon--Color, var(--pf-t--global--icon--color--on-brand--default));
  --pf-button-theme-primary-hover-color: var(--pf-v6-c-button--m-primary--hover--Color, var(--pf-t--global--text--color--on-brand--hover));
  --pf-button-theme-primary-hover-bg: var(--pf-v6-c-button--m-primary--hover--BackgroundColor, var(--pf-t--global--color--brand--hover));
  --pf-button-theme-primary-hover-icon-color: var(--pf-v6-c-button--m-primary--hover__icon--Color, var(--pf-t--global--icon--color--on-brand--hover));
  --pf-button-theme-primary-clicked-color: var(--pf-v6-c-button--m-primary--m-clicked--Color, var(--pf-t--global--text--color--on-brand--clicked));
  --pf-button-theme-primary-clicked-bg: var(--pf-v6-c-button--m-primary--m-clicked--BackgroundColor, var(--pf-t--global--color--brand--clicked));
  --pf-button-theme-primary-clicked-icon-color: var(--pf-v6-c-button--m-primary--m-clicked__icon--Color, var(--pf-t--global--icon--color--on-brand--clicked));
}

.pf-v6-c-button.pf-m-primary {
  --pf-v6-c-button--m-primary--Color: var(--pf-button-theme-primary-color);
  --pf-v6-c-button--m-primary--BackgroundColor: var(--pf-button-theme-primary-bg);
  --pf-v6-c-button--m-primary__icon--Color: var(--pf-button-theme-primary-icon-color);
  --pf-v6-c-button--m-primary--hover--Color: var(--pf-button-theme-primary-hover-color);
  --pf-v6-c-button--m-primary--hover--BackgroundColor: var(--pf-button-theme-primary-hover-bg);
  --pf-v6-c-button--m-primary--hover__icon--Color: var(--pf-button-theme-primary-hover-icon-color);
  --pf-v6-c-button--m-primary--m-clicked--Color: var(--pf-button-theme-primary-clicked-color);
  --pf-v6-c-button--m-primary--m-clicked--BackgroundColor: var(--pf-button-theme-primary-clicked-bg);
  --pf-v6-c-button--m-primary--m-clicked__icon--Color: var(--pf-button-theme-primary-clicked-icon-color);
}
`;

const SHADOW_CSS = [
  SHADOW_HOST_STYLES,
  COMPONENT_STYLES,
  SHADOW_INTERACTION_FIXES,
  SHADOW_THEME_BRIDGE,
].join('\n');

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
