/**
 * accordion-a11y.js — Keyboard navigation helpers for PatternFly accordions.
 *
 * PURPOSE
 * -------
 * Implements the roving-focus portion of the WAI-ARIA accordion pattern:
 * https://www.w3.org/WAI/ARIA/apg/patterns/accordion/
 *
 * Parent accordions (`pf-accordion-shadow`, `pf-accordion-light`) attach a single
 * `keydown` listener and delegate here. Toggle activation (Enter/Space) is handled
 * natively by each `<button type="button">` toggle — this module only moves focus
 * between headers.
 *
 * SHADOW VS LIGHT
 * ---------------
 * Shadow items render toggles inside each item's shadow root, so lookups use
 * `item.shadowRoot.querySelector`. Light items render toggles in the document
 * tree and use `item.querySelector` instead.
 *
 * @module accordion-a11y
 */

/** PatternFly BEM class on every accordion header button. */
export const ACCORDION_TOGGLE_SELECTOR = '.pf-v6-c-accordion__toggle';

/**
 * Returns the focusable toggle `<button>` inside one accordion item.
 *
 * @param {Element} item - `pf-accordion-item-shadow` or `pf-accordion-item-light`
 * @param {boolean} useShadowRoot - Pass `true` for shadow items
 * @returns {HTMLButtonElement | null}
 */
export function getItemToggleButton(item, useShadowRoot) {
  if (useShadowRoot) {
    return item.shadowRoot?.querySelector(ACCORDION_TOGGLE_SELECTOR) ?? null;
  }

  return item.querySelector(ACCORDION_TOGGLE_SELECTOR);
}

/**
 * Collects toggle buttons for all direct child items of an accordion host.
 *
 * Order matches DOM order, which defines Arrow/Home/End navigation sequence.
 * Items without a resolved toggle (e.g. not yet rendered) are omitted.
 *
 * @param {Element} accordion - `pf-accordion-shadow` or `pf-accordion-light`
 * @param {string} itemTag - Lowercase tag, e.g. `pf-accordion-item-shadow`
 * @param {boolean} useShadowRoot
 * @returns {HTMLButtonElement[]}
 */
export function getAccordionToggleButtons(accordion, itemTag, useShadowRoot) {
  return [...accordion.querySelectorAll(`:scope > ${itemTag}`)]
    .map((item) => getItemToggleButton(item, useShadowRoot))
    .filter(Boolean);
}

/**
 * Moves focus between accordion toggles on Arrow/Home/End keys.
 *
 * Intentionally no-op when `event.target` is not a known toggle — focus inside
 * panel content must not trigger header navigation.
 *
 * @param {KeyboardEvent} event
 * @param {HTMLButtonElement[]} toggles - From getAccordionToggleButtons()
 */
export function handleAccordionToggleKeydown(event, toggles) {
  const currentIndex = toggles.indexOf(event.target);
  if (currentIndex === -1) {
    return;
  }

  let nextIndex = currentIndex;

  switch (event.key) {
    case 'ArrowDown':
    case 'ArrowRight':
      event.preventDefault();
      nextIndex = (currentIndex + 1) % toggles.length;
      break;
    case 'ArrowUp':
    case 'ArrowLeft':
      event.preventDefault();
      nextIndex = (currentIndex - 1 + toggles.length) % toggles.length;
      break;
    case 'Home':
      event.preventDefault();
      nextIndex = 0;
      break;
    case 'End':
      event.preventDefault();
      nextIndex = toggles.length - 1;
      break;
    default:
      return;
  }

  toggles[nextIndex]?.focus();
}
