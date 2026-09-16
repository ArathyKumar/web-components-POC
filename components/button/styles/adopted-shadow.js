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
/*
 * Box-sizing reset: global patternfly.css sets * { box-sizing: border-box } on
 * the page, but that rule does not cross shadow boundaries. Without this reset,
 * padding is added to the element's declared width instead of being subtracted
 * from the content area, causing layout differences vs. the light DOM variant.
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
 * Theme bridge — maps host-level PatternFly custom properties onto the inner control.
 *
 * WHY NEEDED: Adopted PF CSS sets modifier tokens directly on .pf-v6-c-button.pf-m-*,
 * which prevents --pf-v6-c-* set on :host (or via ::part(control) from a parent) from
 * inheriting into the button. The bridge reads host vars into --pf-button-theme-* aliases,
 * then reassigns them on .pf-m-primary / .pf-m-secondary.
 *
 * Secondary also sets base --pf-v6-c-button--Color / --BorderColor because PF draws
 * borders on .pf-v6-c-button::after via --pf-v6-c-button--BorderColor.
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

:host {
  --pf-button-theme-secondary-color: var(--pf-v6-c-button--m-secondary--Color, var(--pf-t--global--text--color--brand--default));
  --pf-button-theme-secondary-border-color: var(--pf-v6-c-button--m-secondary--BorderColor, var(--pf-t--global--border--color--brand--default));
  --pf-button-theme-secondary-icon-color: var(--pf-v6-c-button--m-secondary__icon--Color, var(--pf-t--global--icon--color--brand--default));
  --pf-button-theme-secondary-hover-color: var(--pf-v6-c-button--m-secondary--hover--Color, var(--pf-t--global--text--color--brand--hover));
  --pf-button-theme-secondary-hover-border-color: var(--pf-v6-c-button--m-secondary--hover--BorderColor, var(--pf-t--global--border--color--brand--hover));
  --pf-button-theme-secondary-hover-icon-color: var(--pf-v6-c-button--m-secondary--hover__icon--Color, var(--pf-t--global--icon--color--brand--hover));
  --pf-button-theme-secondary-clicked-color: var(--pf-v6-c-button--m-secondary--m-clicked--Color, var(--pf-t--global--text--color--brand--clicked));
  --pf-button-theme-secondary-clicked-border-color: var(--pf-v6-c-button--m-secondary--m-clicked--BorderColor, var(--pf-t--global--border--color--brand--clicked));
  --pf-button-theme-secondary-clicked-icon-color: var(--pf-v6-c-button--m-secondary--m-clicked__icon--Color, var(--pf-t--global--icon--color--brand--clicked));
}

.pf-v6-c-button.pf-m-secondary {
  --pf-v6-c-button--m-secondary--Color: var(--pf-button-theme-secondary-color);
  --pf-v6-c-button--m-secondary--BorderColor: var(--pf-button-theme-secondary-border-color);
  --pf-v6-c-button--m-secondary__icon--Color: var(--pf-button-theme-secondary-icon-color);
  --pf-v6-c-button--Color: var(--pf-button-theme-secondary-color);
  --pf-v6-c-button--BorderColor: var(--pf-button-theme-secondary-border-color);
  --pf-v6-c-button__icon--Color: var(--pf-button-theme-secondary-icon-color);
  --pf-v6-c-button--m-secondary--hover--Color: var(--pf-button-theme-secondary-hover-color);
  --pf-v6-c-button--m-secondary--hover--BorderColor: var(--pf-button-theme-secondary-hover-border-color);
  --pf-v6-c-button--hover--Color: var(--pf-button-theme-secondary-hover-color);
  --pf-v6-c-button--hover--BorderColor: var(--pf-button-theme-secondary-hover-border-color);
  --pf-v6-c-button--hover__icon--Color: var(--pf-button-theme-secondary-hover-icon-color);
  --pf-v6-c-button--m-secondary--m-clicked--Color: var(--pf-button-theme-secondary-clicked-color);
  --pf-v6-c-button--m-secondary--m-clicked--BorderColor: var(--pf-button-theme-secondary-clicked-border-color);
  --pf-v6-c-button--m-clicked--Color: var(--pf-button-theme-secondary-clicked-color);
  --pf-v6-c-button--m-clicked--BorderColor: var(--pf-button-theme-secondary-clicked-border-color);
  --pf-v6-c-button--m-clicked__icon--Color: var(--pf-button-theme-secondary-clicked-icon-color);
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
