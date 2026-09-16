/**
 * Component catalog for the Web Components POC front page.
 * Add a new entry here and create demos/<id>.html to list another component.
 *
 * @typedef {Object} CatalogEntry
 * @property {string} id URL-safe slug (matches demos/<id>.html)
 * @property {string} name Display name
 * @property {string} description Short summary for the catalog card
 * @property {string} href Path to the component demo page
 * @property {string[]} tags Optional labels shown on the card
 * @property {string[]} elements Custom element tag names
 * @property {'ready' | 'coming-soon'} [status='ready']
 */

/** @type {CatalogEntry[]} */
export const componentCatalog = [
  {
    id: 'button',
    name: 'Button',
    description:
      'PatternFly button with shadow and light DOM implementations, form association, exportparts theming, and custom events.',
    href: 'demos/button.html',
    tags: ['PatternFly', 'Shadow DOM', 'Light DOM', 'Form'],
    elements: ['pf-button-shadow', 'pf-button-light'],
    status: 'ready',
  },
  {
    id: 'accordion',
    name: 'Accordion',
    description:
      'PatternFly accordion with shadow and light DOM implementations, definition list markup, single-expand, bordered, plain, and display size variants.',
    href: 'demos/accordion.html',
    tags: ['PatternFly', 'Shadow DOM', 'Light DOM', 'Expandable'],
    elements: [
      'pf-accordion-shadow',
      'pf-accordion-item-shadow',
      'pf-accordion-light',
      'pf-accordion-item-light',
    ],
    status: 'ready',
  },
  {
    id: 'badge',
    name: 'Badge',
    description:
      'PatternFly badge with shadow and light DOM implementations. Supports read, unread, and disabled states with an optional screen-reader label.',
    href: 'demos/badge.html',
    tags: ['PatternFly', 'Shadow DOM', 'Light DOM'],
    elements: ['pf-badge-shadow', 'pf-badge-light'],
    status: 'ready',
  },
  {
    id: 'card',
    name: 'Card',
    description:
      'PatternFly card with shadow and light DOM implementations. Demonstrates named-slot projection, expandable content, header actions, and theming differences (::part() vs BEM selectors).',
    href: 'demos/card.html',
    tags: ['PatternFly', 'Shadow DOM', 'Light DOM', 'Expandable'],
    elements: ['pf-card-shadow', 'pf-card-light'],
    status: 'ready',
  },
];
