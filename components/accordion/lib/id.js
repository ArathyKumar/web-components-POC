let accordionIdCounter = 0;

/**
 * Generates a unique id for accordion toggles and content regions.
 * @param {string} [prefix]
 * @returns {string}
 */
export function createAccordionId(prefix = 'pf-accordion') {
  accordionIdCounter += 1;
  return `${prefix}-${accordionIdCounter}`;
}
