/** Light DOM host overrides for pf-accordion-light / pf-accordion-shadow hosts. */
export const ACCORDION_LIGHT_HOST_STYLES = `
pf-accordion-light,
pf-accordion-shadow {
  display: block;
  --pf-accordion-theme-expanded-toggle-bg: var(
    --pf-v6-c-accordion__item--m-expanded__toggle--BackgroundColor,
    transparent
  );
}

pf-accordion-item-shadow,
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

pf-accordion-item-light .pf-v6-c-accordion__item.pf-m-expanded {
  --pf-v6-c-accordion__item--m-expanded__toggle--BackgroundColor: var(
    --pf-accordion-theme-expanded-toggle-bg
  );
}
`;
