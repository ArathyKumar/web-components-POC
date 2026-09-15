/**
 * Encapsulated styles for <pf-accordion-shadow> and <pf-accordion-item-shadow>.
 */
import accordionStyles from './accordion-styles.js';

const ACCORDION_HOST_STYLES = `
:host {
  display: block;
  font-family: var(--pf-t--global--font--family--body, sans-serif);
}

:host([hidden]) {
  display: none;
}

.pf-v6-svg {
  width: 1em;
  height: 1em;
  vertical-align: -0.125em;
}
`;

/**
 * PatternFly plain/glass rules use :root selectors that do not match inside shadow trees.
 */
const ACCORDION_SHADOW_COMPAT_STYLES = `
.pf-v6-c-accordion.pf-m-plain {
  --pf-v6-c-accordion--BackgroundColor: transparent;
  --pf-v6-c-accordion__expandable-content--BackgroundColor: transparent;
  --pf-v6-c-accordion__item--m-expanded--BackgroundColor: transparent;
  --pf-v6-c-accordion__item--m-expanded__toggle--BackgroundColor: var(--pf-v6-c-accordion--m-plain__item--m-expanded__toggle--BackgroundColor);
}

:host-context(.pf-v6-theme-glass) .pf-v6-c-accordion:not(.pf-m-no-plain-on-glass),
:host-context(html.pf-v6-theme-glass) .pf-v6-c-accordion:not(.pf-m-no-plain-on-glass) {
  --pf-v6-c-accordion--BackgroundColor: transparent;
  --pf-v6-c-accordion__expandable-content--BackgroundColor: transparent;
  --pf-v6-c-accordion__item--m-expanded--BackgroundColor: transparent;
  --pf-v6-c-accordion__item--m-expanded__toggle--BackgroundColor: var(--pf-v6-c-accordion--m-plain__item--m-expanded__toggle--BackgroundColor);
}
`;

const ACCORDION_ITEM_HOST_STYLES = `
:host {
  display: contents;
}

:host([hidden]) {
  display: none;
}

.pf-v6-svg {
  width: 1em;
  height: 1em;
  vertical-align: -0.125em;
}

.pf-v6-c-accordion__item h1,
.pf-v6-c-accordion__item h2,
.pf-v6-c-accordion__item h3,
.pf-v6-c-accordion__item h4,
.pf-v6-c-accordion__item h5,
.pf-v6-c-accordion__item h6 {
  margin: 0;
  font: inherit;
}
`;

const ACCORDION_SHADOW_CSS = [
  ACCORDION_HOST_STYLES,
  ACCORDION_SHADOW_COMPAT_STYLES,
  accordionStyles,
].join('\n');
const ACCORDION_ITEM_SHADOW_CSS = [
  ACCORDION_ITEM_HOST_STYLES,
  ACCORDION_SHADOW_COMPAT_STYLES,
  accordionStyles,
].join('\n');

let accordionSheet = null;
let accordionItemSheet = null;

function getAccordionSheet() {
  if (!accordionSheet) {
    accordionSheet = new CSSStyleSheet();
    accordionSheet.replaceSync(ACCORDION_SHADOW_CSS);
  }
  return accordionSheet;
}

function getAccordionItemSheet() {
  if (!accordionItemSheet) {
    accordionItemSheet = new CSSStyleSheet();
    accordionItemSheet.replaceSync(ACCORDION_ITEM_SHADOW_CSS);
  }
  return accordionItemSheet;
}

/**
 * @param {ShadowRoot} shadowRoot
 * @param {CSSStyleSheet} sheet
 * @param {string} cssText
 */
function adoptSheet(shadowRoot, sheet, cssText) {
  if (typeof CSSStyleSheet !== 'undefined' && 'adoptedStyleSheets' in shadowRoot) {
    shadowRoot.adoptedStyleSheets = [sheet];
    return;
  }

  const existing = shadowRoot.querySelector('style[data-pf-adopted="accordion-shadow"]');
  if (existing) {
    existing.textContent = cssText;
    return;
  }

  const style = document.createElement('style');
  style.setAttribute('data-pf-adopted', 'accordion-shadow');
  style.textContent = cssText;
  shadowRoot.appendChild(style);
}

/**
 * @param {ShadowRoot} shadowRoot
 */
export function adoptPatternFlyAccordionShadowStyles(shadowRoot) {
  if (!shadowRoot) {
    return;
  }

  adoptSheet(shadowRoot, getAccordionSheet(), ACCORDION_SHADOW_CSS);
}

/**
 * @param {ShadowRoot} shadowRoot
 */
export function adoptPatternFlyAccordionItemShadowStyles(shadowRoot) {
  if (!shadowRoot) {
    return;
  }

  adoptSheet(shadowRoot, getAccordionItemSheet(), ACCORDION_ITEM_SHADOW_CSS);
}
