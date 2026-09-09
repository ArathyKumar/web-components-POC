import { PfButtonCore } from './pf-button-core.js';
import { adoptPatternFlyShadowStyles } from './pf-adopted-styles-shadow.js';

export const ELEMENT_TAG = 'pf-button-shadow';

const EXPORT_PARTS =
  'control, icon, icon-favorite, icon-favorited, text, sr-text, progress, spinner, count, badge';

export class PFButtonShadow extends PfButtonCore {
  createRenderRoot() {
    const root = super.createRenderRoot();
    adoptPatternFlyShadowStyles(root);
    return root;
  }

  render() {
    return this._renderControl(EXPORT_PARTS);
  }
}

if (!customElements.get(ELEMENT_TAG)) {
  customElements.define(ELEMENT_TAG, PFButtonShadow);
}
