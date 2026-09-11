/**
 * PatternFly v6 accordion BEM class names.
 * @see https://www.patternfly.org/components/accordion
 */

const ACCORDION_BLOCK = 'pf-v6-c-accordion';

/**
 * @param {Object} options
 * @param {boolean} [options.bordered]
 * @param {boolean} [options.plain]
 * @param {boolean} [options.noPlainOnGlass]
 * @param {boolean} [options.displayLg]
 * @param {boolean} [options.toggleStart]
 * @param {string} [options.extraClass]
 * @returns {string}
 */
export function getAccordionClassNames({
  bordered = false,
  plain = false,
  noPlainOnGlass = false,
  displayLg = false,
  toggleStart = false,
  extraClass = '',
} = {}) {
  const classes = [ACCORDION_BLOCK];

  if (bordered) {
    classes.push('pf-m-bordered');
  }
  if (plain) {
    classes.push('pf-m-plain');
  }
  if (noPlainOnGlass) {
    classes.push('pf-m-no-plain-on-glass');
  }
  if (displayLg) {
    classes.push('pf-m-display-lg');
  }
  if (toggleStart) {
    classes.push('pf-m-toggle-start');
  }
  if (extraClass) {
    classes.push(extraClass);
  }

  return classes.join(' ');
}

/**
 * @param {Object} options
 * @param {boolean} [options.expanded]
 * @param {string} [options.extraClass]
 * @returns {string}
 */
export function getAccordionItemClassNames({ expanded = false, extraClass = '' } = {}) {
  const classes = [`${ACCORDION_BLOCK}__item`];

  if (expanded) {
    classes.push('pf-m-expanded');
  }
  if (extraClass) {
    classes.push(extraClass);
  }

  return classes.join(' ');
}

/** @returns {string} */
export function getAccordionToggleClassNames() {
  return `${ACCORDION_BLOCK}__toggle`;
}

/** @returns {string} */
export function getAccordionToggleTextClassNames() {
  return `${ACCORDION_BLOCK}__toggle-text`;
}

/** @returns {string} */
export function getAccordionToggleIconClassNames() {
  return `${ACCORDION_BLOCK}__toggle-icon`;
}

/**
 * @param {Object} options
 * @param {boolean} [options.fixed]
 * @param {string} [options.extraClass]
 * @returns {string}
 */
export function getAccordionContentClassNames({ fixed = false, extraClass = '' } = {}) {
  const classes = [`${ACCORDION_BLOCK}__expandable-content`];

  if (fixed) {
    classes.push('pf-m-fixed');
  }
  if (extraClass) {
    classes.push(extraClass);
  }

  return classes.join(' ');
}

/** @returns {string} */
export function getAccordionContentBodyClassNames() {
  return `${ACCORDION_BLOCK}__expandable-content-body`;
}
