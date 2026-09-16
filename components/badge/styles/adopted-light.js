/**
 * Light DOM host overrides for pf-badge-light.
 *
 * Component CSS (.pf-v6-c-badge, modifiers, and .pf-v6-screen-reader) all come
 * from global patternfly.css which is loaded on the page. Because the light DOM
 * badge renders directly into the document tree, every descendant selector in
 * patternfly.css already matches — there is no need to re-declare them here.
 *
 * This sheet adds only host-level layout rules that have no equivalent in PF CSS:
 * the inline-block display and font-family on the custom element tag itself.
 */
export const BADGE_LIGHT_HOST_STYLES = `
pf-badge-light {
  display: inline-block;
  vertical-align: middle;
  font-family: var(--pf-t--global--font--family--body, sans-serif);
}

pf-badge-light[hidden] {
  display: none;
}
`;
