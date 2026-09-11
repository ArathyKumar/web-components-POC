/**
 * Document-level adopted host overrides for all light DOM PatternFly components.
 * Component CSS must still come from global patternfly.css.
 */
import { BUTTON_LIGHT_HOST_STYLES } from '../components/button/styles/adopted-light.js';
import { ACCORDION_LIGHT_HOST_STYLES } from '../components/accordion/styles/adopted-light.js';

const LIGHT_HOST_STYLES = [BUTTON_LIGHT_HOST_STYLES, ACCORDION_LIGHT_HOST_STYLES].join('\n');

const LIGHT_HOST_STYLES_REVISION = 'light-host-8';

let lightSheet = null;
let lightSheetRevision = null;
let adoptedLightSheet = null;

function getLightHostSheet() {
  if (!lightSheet || lightSheetRevision !== LIGHT_HOST_STYLES_REVISION) {
    lightSheet = new CSSStyleSheet();
    lightSheet.replaceSync(LIGHT_HOST_STYLES);
    lightSheetRevision = LIGHT_HOST_STYLES_REVISION;
  }
  return lightSheet;
}

/** Adopts scoped host overrides once per document. */
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
