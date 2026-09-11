/**
 * Scoped host overrides for light DOM PatternFly web components.
 *
 * Does NOT include component CSS — that must come from global patternfly.css.
 * Adopted once per document; targets component hosts, not :host (no shadow root).
 */

const LIGHT_HOST_STYLES = `
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
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
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

pf-accordion-light,
pf-accordion-shadow {
  display: block;
}

pf-accordion-item-shadow {
  display: contents;
}

/* Transparent to parent <dl>/<div> so definition-list dt/dd structure is preserved */
pf-accordion-item-light {
  display: contents;
}

/* Match shadow item heading resets for fluid (non-definition-list) markup */
pf-accordion-item-light .pf-v6-c-accordion__item h1,
pf-accordion-item-light .pf-v6-c-accordion__item h2,
pf-accordion-item-light .pf-v6-c-accordion__item h3,
pf-accordion-item-light .pf-v6-c-accordion__item h4,
pf-accordion-item-light .pf-v6-c-accordion__item h5,
pf-accordion-item-light .pf-v6-c-accordion__item h6 {
  margin: 0;
  font: inherit;
}

/*
 * Resolve theme overrides from pf-button-light onto the inner control.
 * Global patternfly.css sets modifier tokens on .pf-v6-c-button directly,
 * which blocks inherited --pf-v6-c-* values from the host.
 */
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

/*
 * Resolve theme overrides from accordion hosts onto inner accordion markup.
 * Only read the PF token on accordion hosts — items sit under .pf-v6-c-accordion
 * where PatternFly already sets this token to transparent.
 */
pf-accordion-light,
pf-accordion-shadow {
  --pf-accordion-theme-expanded-toggle-bg: var(
    --pf-v6-c-accordion__item--m-expanded__toggle--BackgroundColor,
    transparent
  );
}

pf-accordion-light .pf-v6-c-accordion {
  --pf-v6-c-accordion__item--m-expanded__toggle--BackgroundColor: var(
    --pf-accordion-theme-expanded-toggle-bg
  );
}

pf-accordion-item-light .pf-v6-c-accordion__item.pf-m-expanded .pf-v6-c-accordion__toggle {
  --pf-v6-c-accordion__toggle--BackgroundColor: var(
    --pf-accordion-theme-expanded-toggle-bg
  );
}
`;

/** Bump when LIGHT_HOST_STYLES changes so dev reloads pick up adopted stylesheet updates. */
const LIGHT_HOST_STYLES_REVISION = 'light-theme-bridge-5';

let lightSheet = null;
let lightSheetRevision = null;
let adoptedLightSheet = null;

/**
 * Lazily creates and caches the constructable stylesheet for light DOM host overrides.
 * @returns {CSSStyleSheet}
 */
function getLightHostSheet() {
  if (!lightSheet || lightSheetRevision !== LIGHT_HOST_STYLES_REVISION) {
    lightSheet = new CSSStyleSheet();
    lightSheet.replaceSync(LIGHT_HOST_STYLES);
    lightSheetRevision = LIGHT_HOST_STYLES_REVISION;
  }
  return lightSheet;
}

/**
 * Adopts scoped host overrides for light DOM buttons (once per document).
 * Load patternfly.css globally for component styles and design tokens.
 */
export function adoptPatternFlyLightHostStyles() {
  if (typeof document === 'undefined') {
    return;
  }

  const sheet = getLightHostSheet();

  if (typeof CSSStyleSheet !== 'undefined' && 'adoptedStyleSheets' in document) {
    if (adoptedLightSheet && adoptedLightSheet !== sheet) {
      document.adoptedStyleSheets = document.adoptedStyleSheets.filter(
        (existing) => existing !== adoptedLightSheet
      );
    }

    if (!document.adoptedStyleSheets.includes(sheet)) {
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    }

    adoptedLightSheet = sheet;
    return;
  }

  const existing = document.head.querySelector('style[data-pf-adopted="light-host"]');
  if (existing) {
    if (existing.dataset.revision !== LIGHT_HOST_STYLES_REVISION) {
      existing.textContent = LIGHT_HOST_STYLES;
      existing.dataset.revision = LIGHT_HOST_STYLES_REVISION;
    }
    return;
  }

  const style = document.createElement('style');
  style.setAttribute('data-pf-adopted', 'light-host');
  style.dataset.revision = LIGHT_HOST_STYLES_REVISION;
  style.textContent = LIGHT_HOST_STYLES;
  document.head.appendChild(style);
}
