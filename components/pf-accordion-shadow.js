/**
 * pf-accordion-shadow / pf-accordion-item-shadow — PatternFly accordion with Shadow DOM.
 *
 * Requires global patternfly.css for design tokens. Component CSS is adopted into
 * each shadow root via adoptPatternFlyAccordionShadowStyles().
 */
import { LitElement, html, nothing } from 'lit';
import { AccordionMixin } from './pf-accordion/pf-accordion-base.js';
import { AccordionItemMixin } from './pf-accordion/pf-accordion-item-base.js';
import {
  adoptPatternFlyAccordionShadowStyles,
  adoptPatternFlyAccordionItemShadowStyles,
} from '../styles/pf-adopted-styles-shadow-accordion.js';

export const ACCORDION_TAG = 'pf-accordion-shadow';
export const ACCORDION_ITEM_TAG = 'pf-accordion-item-shadow';

class PFAccordionShadow extends AccordionMixin(LitElement, ACCORDION_ITEM_TAG) {
  createRenderRoot() {
    const root = super.createRenderRoot();
    adoptPatternFlyAccordionShadowStyles(root);
    return root;
  }

  render() {
    const rootClass = this._getRootClass();
    const label = this.ariaLabel || nothing;

    if (this.definitionList) {
      return html`
        <dl class="${rootClass}" aria-label=${label}>
          <slot></slot>
        </dl>
      `;
    }

    return html`
      <div class="${rootClass}" aria-label=${label}>
        <slot></slot>
      </div>
    `;
  }
}

class PFAccordionItemShadow extends AccordionItemMixin(LitElement) {
  createRenderRoot() {
    const root = super.createRenderRoot();
    adoptPatternFlyAccordionItemShadowStyles(root);
    return root;
  }

  render() {
    return this._renderItemStructure(
      html`<slot></slot>`,
      html`<slot name="content"></slot>`
    );
  }
}

if (!customElements.get(ACCORDION_TAG)) {
  customElements.define(ACCORDION_TAG, PFAccordionShadow);
}

if (!customElements.get(ACCORDION_ITEM_TAG)) {
  customElements.define(ACCORDION_ITEM_TAG, PFAccordionItemShadow);
}

export { PFAccordionShadow, PFAccordionItemShadow };
