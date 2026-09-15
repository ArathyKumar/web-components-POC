/**
 * Light DOM host overrides for pf-accordion-light / pf-accordion-item-light.
 *
 * display: contents on items keeps the accordion BEM structure flat (items are not
 * extra layout boxes). Heading reset prevents user-agent margins inside toggles.
 */
export const ACCORDION_LIGHT_HOST_STYLES = `
pf-accordion-light {
  display: block;
}

pf-accordion-item-light {
  display: contents;
}

pf-accordion-item-light .pf-v6-c-accordion__item h1,
pf-accordion-item-light .pf-v6-c-accordion__item h2,
pf-accordion-item-light .pf-v6-c-accordion__item h3,
pf-accordion-item-light .pf-v6-c-accordion__item h4,
pf-accordion-item-light .pf-v6-c-accordion__item h5,
pf-accordion-item-light .pf-v6-c-accordion__item h6 {
  margin: 0;
  font: inherit;
}
`;
