import { PfButtonCore } from './pf-button/pf-button-core.js';
import { adoptPatternFlyLightHostStyles } from '../styles/pf-adopted-styles-light.js';

/** Custom element tag name for the light DOM button. */
export const ELEMENT_TAG = 'pf-button-light';

/**
 * PatternFly button rendered in the light DOM.
 * Requires global patternfly.css; projects label/icon content without shadow slots.
 */
export class PFButtonLight extends PfButtonCore {
  /** Adopts scoped host styles once, then runs core connect logic. */
  connectedCallback() {
    adoptPatternFlyLightHostStyles();
    super.connectedCallback();
  }

  /**
   * Light DOM has no shadow root, so native slots do not project host children.
   * @returns {false}
   */
  _usesNativeSlots() {
    return false;
  }

  /** Renders directly into the host element instead of a shadow root. */
  createRenderRoot() {
    return this;
  }

  /**
   * Excludes the rendered control element from projectable host children.
   * @returns {ChildNode[]}
   */
  _getProjectableChildNodes() {
    return [...this.childNodes].filter((node) => {
      return !(
        node.nodeType === Node.ELEMENT_NODE && node.getAttribute('part') === 'control'
      );
    });
  }

  /** Renders the activator without exportparts (not applicable in light DOM). */
  render() {
    return this._renderControl();
  }
}

if (!customElements.get(ELEMENT_TAG)) {
  customElements.define(ELEMENT_TAG, PFButtonLight);
}
