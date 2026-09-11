import { getAccordionClassNames } from './class-names.js';

const ACCORDION_TAGS = ['PF-ACCORDION-SHADOW', 'PF-ACCORDION-LIGHT'];

/**
 * @param {HTMLElement} item
 * @returns {HTMLElement | null}
 */
export function getAccordionParent(item) {
  let node = item.parentElement;

  while (node) {
    if (ACCORDION_TAGS.includes(node.tagName)) {
      return node;
    }
    node = node.parentElement;
  }

  return null;
}

/**
 * Reads definition-list mode from a Lit accordion host or plain HTML attributes.
 * @param {HTMLElement} parent
 * @returns {boolean}
 */
function readDefinitionList(parent) {
  if (typeof parent.definitionList === 'boolean') {
    return parent.definitionList;
  }

  if (!parent.hasAttribute('definition-list')) {
    return true;
  }

  return parent.getAttribute('definition-list') !== 'false';
}

/**
 * @param {HTMLElement | null} parent
 * @returns {{
 *   bordered: boolean,
 *   plain: boolean,
 *   noPlainOnGlass: boolean,
 *   displayLg: boolean,
 *   toggleStart: boolean,
 *   extraClass: string,
 * }}
 */
export function getAccordionModifierOptions(parent) {
  if (!parent) {
    return {
      bordered: false,
      plain: false,
      noPlainOnGlass: false,
      displayLg: false,
      toggleStart: false,
      extraClass: '',
    };
  }

  const hasAttr = (name) =>
    typeof parent.hasAttribute === 'function' && parent.hasAttribute(name);
  const getAttr = (name) =>
    typeof parent.getAttribute === 'function' ? parent.getAttribute(name) : '';

  return {
    bordered: Boolean(parent.bordered || hasAttr('bordered')),
    plain: Boolean(parent.plain || hasAttr('plain')),
    noPlainOnGlass: Boolean(parent.noPlainOnGlass || hasAttr('no-plain-on-glass')),
    displayLg: Boolean(parent.displayLg || hasAttr('display-lg')),
    toggleStart: Boolean(parent.toggleStart || hasAttr('toggle-start')),
    extraClass: parent.extraClass || getAttr('extra-class') || '',
  };
}

/**
 * @param {HTMLElement | null} parent
 * @returns {string}
 */
export function getAccordionModifierClassNames(parent) {
  return getAccordionClassNames(getAccordionModifierOptions(parent));
}

/**
 * @param {HTMLElement} item
 * @returns {{
 *   asDefinitionList: boolean,
 *   headingLevel: string,
 *   togglePosition: 'start' | 'end',
 *   singleExpand: boolean,
 *   accordionClassNames: string,
 * }}
 */
export function getAccordionContext(item) {
  const parent = getAccordionParent(item);
  const modifiers = getAccordionModifierOptions(parent);

  if (!parent) {
    return {
      asDefinitionList: true,
      headingLevel: 'h3',
      togglePosition: 'end',
      singleExpand: false,
      accordionClassNames: getAccordionClassNames(modifiers),
    };
  }

  return {
    asDefinitionList: readDefinitionList(parent),
    headingLevel: parent.getAttribute('heading-level') || parent.headingLevel || 'h3',
    togglePosition: modifiers.toggleStart ? 'start' : 'end',
    singleExpand: Boolean(parent.singleExpand || parent.hasAttribute('single-expand')),
    accordionClassNames: getAccordionClassNames(modifiers),
  };
}
