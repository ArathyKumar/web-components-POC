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

/*
 * full-height: same host-height bridge as the shadow card. The light DOM host
 * sits between the sized container and .pf-v6-c-card.pf-m-full-height, so the
 * host must stretch to 100% for the PatternFly height: 100% rule to take effect.
 */
pf-card-light[full-height] {
  height: 100%;
}

pf-card-light[full-height] .pf-v6-c-card {
  height: 100%;
}

pf-card-light[hidden] {
  display: none;
}

/*
 * Caret rotation comes from PatternFly’s .pf-v6-c-card.pf-m-expanded rule
 * (-180deg). Do not override with a host-level 90deg transform.
 */

/*
 * Collapsed expandable cards keep a [hidden] expandable-content sibling (light
 * DOM must retain projected nodes). That makes header:not(:last-child) and
 * shrinks bottom padding vs PatternFly (which unmounts the region). Restore
 * full card-child bottom padding when every following sibling is [hidden].
 *
 * IMPORTANT: only target *direct* children of .pf-v6-c-card. Titles nested in
 * .pf-v6-c-card__header-main must keep padding: 0 from PatternFly's
 * .pf-v6-c-card__header .pf-v6-c-card__title rule — a broader title selector
 * was incorrectly adding 24px under selectable/expandable header titles.
 */
pf-card-light .pf-v6-c-card > .pf-v6-c-card__header:not(:has(~ :not([hidden]))),
pf-card-light .pf-v6-c-card > .pf-v6-c-card__title:not(:has(~ :not([hidden]))) {
  padding-block-end: var(--pf-v6-c-card--child--PaddingBlockEnd);
}

pf-card-light .pf-v6-svg {
  width: 1em;
  height: 1em;
  vertical-align: -0.125em;
}
`;
