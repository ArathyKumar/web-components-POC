/** Dispatched by accordion items when the toggle is activated. */
export const ACCORDION_TOGGLE_EVENT = 'pf-accordion-toggle';

/**
 * @typedef {Object} AccordionToggleEventDetail
 * @property {HTMLElement} item The accordion item element that was toggled
 * @property {boolean} expanded Whether the item is expanded after the toggle
 * @property {string} toggleId The toggle button id
 */
