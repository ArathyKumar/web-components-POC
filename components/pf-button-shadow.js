import { PfButtonCore } from './pf-button/pf-button-core.js';
import { adoptPatternFlyShadowStyles } from '../styles/pf-adopted-styles-shadow.js';

/** Custom element tag name for the shadow DOM button. */
export const ELEMENT_TAG = 'pf-button-shadow';

/** Shadow parts exported for ::part() external styling. */
const EXPORT_PARTS =
  'control, icon, icon-favorite, icon-favorited, text, sr-text, progress, spinner, count, badge';

/**
 * PatternFly button rendered inside a shadow root with encapsulated styles.
 */
export class PFButtonShadow extends PfButtonCore {
  /** Creates a shadow root and adopts shared PatternFly component styles into it. */
  createRenderRoot() {
    const root = super.createRenderRoot();
    adoptPatternFlyShadowStyles(root);
    return root;
  }

  /** Renders the activator with exportparts for external ::part() theming. */
  render() {
    return this._renderControl(EXPORT_PARTS);
  }
}

if (!customElements.get(ELEMENT_TAG)) {
  customElements.define(ELEMENT_TAG, PFButtonShadow);
}
