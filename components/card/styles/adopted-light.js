/**
 * Host-level styles applied to <pf-card-light> in the regular document.
 *
 * Because light DOM components render directly into the page, they inherit global
 * PatternFly CSS (patternfly.css). These overrides only add what global CSS
 * cannot provide: :host display/layout, the toggle-icon animation, and the
 * utility "hidden" rule that some hosts omit.
 *
 * NOTE: "card-light-1" version token is used in styles/adopted-light.js to
 * bust cached constructable stylesheets across hot-reloads.
 */
export const CARD_LIGHT_HOST_STYLES = `
pf-card-light {
  display: block;
}

pf-card-light[hidden] {
  display: none;
}

/*
 * Expandable toggle icon rotation — when the host has [expanded], the caret
 * rotates 90°. In light DOM, the element is in the regular document tree, so
 * this selector resolves correctly without shadow penetration.
 */
pf-card-light[expanded] .pf-v6-c-card__header-toggle-icon {
  transform: rotate(90deg);
}

pf-card-light .pf-v6-c-card__header-toggle-icon {
  display: inline-flex;
  align-items: center;
  transition: transform 0.2s ease;
}

pf-card-light .pf-v6-svg {
  width: 1em;
  height: 1em;
  vertical-align: -0.125em;
}
`;
