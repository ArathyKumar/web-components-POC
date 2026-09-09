import { PfButtonCore } from './pf-button-core.js';
import { adoptPatternFlyLightHostStyles } from './pf-adopted-styles-light.js';

export const ELEMENT_TAG = 'pf-button-light';

export class PFButtonLight extends PfButtonCore {
  connectedCallback() {
    adoptPatternFlyLightHostStyles();
    super.connectedCallback();
  }

  _usesNativeSlots() {
    return false;
  }

  createRenderRoot() {
    return this;
  }

  _getProjectableChildNodes() {
    return [...this.childNodes].filter((node) => {
      return !(
        node.nodeType === Node.ELEMENT_NODE && node.getAttribute('part') === 'control'
      );
    });
  }

  render() {
    return this._renderControl();
  }
}

if (!customElements.get(ELEMENT_TAG)) {
  customElements.define(ELEMENT_TAG, PFButtonLight);
}
