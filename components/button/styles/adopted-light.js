/**
 * Light DOM host overrides for pf-button-light.
 *
 * Component structure/states come from global patternfly.css. This sheet only adds:
 * - Host layout (inline-block, block, hidden)
 * - Circle button icon centering
 * - Disabled link pointer-events
 * - Theme bridge: host --pf-v6-c-button--* → .pf-m-primary / .pf-m-secondary
 *
 * Secondary borders use --pf-v6-c-button--BorderColor (drawn on ::after), not border-color.
 */
export const BUTTON_LIGHT_HOST_STYLES = `
pf-button-light {
  display: inline-block;
  vertical-align: middle;
  font-family: var(--pf-t--global--font--family--body, sans-serif);
}

pf-button-light[hidden] {
  display: none;
}

pf-button-light[block] {
  display: block;
  width: 100%;
}

pf-button-light .pf-v6-screen-reader {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

pf-button-light a.pf-v6-c-button[aria-disabled="true"] {
  pointer-events: none;
  cursor: not-allowed;
}

pf-button-light .pf-v6-c-button.pf-m-circle {
  --pf-v6-c-button--AlignItems: center;
  width: var(--pf-v6-c-button--MinWidth);
  min-height: var(--pf-v6-c-button--MinWidth);
}

pf-button-light .pf-v6-c-button.pf-m-circle .pf-v6-c-button__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 1lh;
  min-width: 1lh;
  line-height: 0;
}

pf-button-light .pf-v6-c-button.pf-m-circle .pf-v6-svg {
  display: block;
}

pf-button-light[circle] {
  display: inline-block;
  line-height: 0;
}

pf-button-light {
  --pf-button-theme-primary-color: var(--pf-v6-c-button--m-primary--Color, var(--pf-t--global--text--color--on-brand--default));
  --pf-button-theme-primary-bg: var(--pf-v6-c-button--m-primary--BackgroundColor, var(--pf-t--global--color--brand--default));
  --pf-button-theme-primary-icon-color: var(--pf-v6-c-button--m-primary__icon--Color, var(--pf-t--global--icon--color--on-brand--default));
  --pf-button-theme-primary-hover-color: var(--pf-v6-c-button--m-primary--hover--Color, var(--pf-t--global--text--color--on-brand--hover));
  --pf-button-theme-primary-hover-bg: var(--pf-v6-c-button--m-primary--hover--BackgroundColor, var(--pf-t--global--color--brand--hover));
  --pf-button-theme-primary-hover-icon-color: var(--pf-v6-c-button--m-primary--hover__icon--Color, var(--pf-t--global--icon--color--on-brand--hover));
  --pf-button-theme-primary-clicked-color: var(--pf-v6-c-button--m-primary--m-clicked--Color, var(--pf-t--global--text--color--on-brand--clicked));
  --pf-button-theme-primary-clicked-bg: var(--pf-v6-c-button--m-primary--m-clicked--BackgroundColor, var(--pf-t--global--color--brand--clicked));
  --pf-button-theme-primary-clicked-icon-color: var(--pf-v6-c-button--m-primary--m-clicked__icon--Color, var(--pf-t--global--icon--color--on-brand--clicked));
}

pf-button-light .pf-v6-c-button.pf-m-primary {
  --pf-v6-c-button--m-primary--Color: var(--pf-button-theme-primary-color);
  --pf-v6-c-button--m-primary--BackgroundColor: var(--pf-button-theme-primary-bg);
  --pf-v6-c-button--m-primary__icon--Color: var(--pf-button-theme-primary-icon-color);
  --pf-v6-c-button--m-primary--hover--Color: var(--pf-button-theme-primary-hover-color);
  --pf-v6-c-button--m-primary--hover--BackgroundColor: var(--pf-button-theme-primary-hover-bg);
  --pf-v6-c-button--m-primary--hover__icon--Color: var(--pf-button-theme-primary-hover-icon-color);
  --pf-v6-c-button--m-primary--m-clicked--Color: var(--pf-button-theme-primary-clicked-color);
  --pf-v6-c-button--m-primary--m-clicked--BackgroundColor: var(--pf-button-theme-primary-clicked-bg);
  --pf-v6-c-button--m-primary--m-clicked__icon--Color: var(--pf-button-theme-primary-clicked-icon-color);
}

pf-button-light {
  --pf-button-theme-secondary-color: var(--pf-v6-c-button--m-secondary--Color, var(--pf-t--global--text--color--brand--default));
  --pf-button-theme-secondary-border-color: var(--pf-v6-c-button--m-secondary--BorderColor, var(--pf-t--global--border--color--brand--default));
  --pf-button-theme-secondary-icon-color: var(--pf-v6-c-button--m-secondary__icon--Color, var(--pf-t--global--icon--color--brand--default));
  --pf-button-theme-secondary-hover-color: var(--pf-v6-c-button--m-secondary--hover--Color, var(--pf-t--global--text--color--brand--hover));
  --pf-button-theme-secondary-hover-border-color: var(--pf-v6-c-button--m-secondary--hover--BorderColor, var(--pf-t--global--border--color--brand--hover));
  --pf-button-theme-secondary-hover-icon-color: var(--pf-v6-c-button--m-secondary--hover__icon--Color, var(--pf-t--global--icon--color--brand--hover));
  --pf-button-theme-secondary-clicked-color: var(--pf-v6-c-button--m-secondary--m-clicked--Color, var(--pf-t--global--text--color--brand--clicked));
  --pf-button-theme-secondary-clicked-border-color: var(--pf-v6-c-button--m-secondary--m-clicked--BorderColor, var(--pf-t--global--border--color--brand--clicked));
  --pf-button-theme-secondary-clicked-icon-color: var(--pf-v6-c-button--m-secondary--m-clicked__icon--Color, var(--pf-t--global--icon--color--brand--clicked));
}

pf-button-light .pf-v6-c-button.pf-m-secondary {
  --pf-v6-c-button--m-secondary--Color: var(--pf-button-theme-secondary-color);
  --pf-v6-c-button--m-secondary--BorderColor: var(--pf-button-theme-secondary-border-color);
  --pf-v6-c-button--m-secondary__icon--Color: var(--pf-button-theme-secondary-icon-color);
  --pf-v6-c-button--Color: var(--pf-button-theme-secondary-color);
  --pf-v6-c-button--BorderColor: var(--pf-button-theme-secondary-border-color);
  --pf-v6-c-button__icon--Color: var(--pf-button-theme-secondary-icon-color);
  --pf-v6-c-button--m-secondary--hover--Color: var(--pf-button-theme-secondary-hover-color);
  --pf-v6-c-button--m-secondary--hover--BorderColor: var(--pf-button-theme-secondary-hover-border-color);
  --pf-v6-c-button--hover--Color: var(--pf-button-theme-secondary-hover-color);
  --pf-v6-c-button--hover--BorderColor: var(--pf-button-theme-secondary-hover-border-color);
  --pf-v6-c-button--hover__icon--Color: var(--pf-button-theme-secondary-hover-icon-color);
  --pf-v6-c-button--m-secondary--m-clicked--Color: var(--pf-button-theme-secondary-clicked-color);
  --pf-v6-c-button--m-secondary--m-clicked--BorderColor: var(--pf-button-theme-secondary-clicked-border-color);
  --pf-v6-c-button--m-clicked--Color: var(--pf-button-theme-secondary-clicked-color);
  --pf-v6-c-button--m-clicked--BorderColor: var(--pf-button-theme-secondary-clicked-border-color);
  --pf-v6-c-button--m-clicked__icon--Color: var(--pf-button-theme-secondary-clicked-icon-color);
}
`;
