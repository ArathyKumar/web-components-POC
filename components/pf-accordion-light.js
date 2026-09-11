/**
 * pf-accordion-light / pf-accordion-item-light — PatternFly accordion in the light DOM.
 *
 * Requires global patternfly.css on the page. Slots are projected manually because
 * native <slot> does not work without a shadow root.
 *
 * ACCORDION ATTRIBUTES (pf-accordion-light)
 * -----------------------------------------
 * - definition-list (default true) — use <dl>/<dt>/<dd> markup; set to false for heading markup
 * - single-expand — only one item open at a time
 * - bordered — pf-m-bordered
 * - plain — pf-m-plain
 * - no-plain-on-glass — pf-m-no-plain-on-glass
 * - display-lg — pf-m-display-lg
 * - toggle-start — pf-m-toggle-start (caret before label)
 * - heading-level — h1–h6 when definition-list="false" (default h3)
 * - aria-label, extra-class
 *
 * ITEM ATTRIBUTES (pf-accordion-item-light)
 * ---------------------------------------
 * - expanded — open/closed state (pf-m-expanded)
 * - toggle-id, content-id — a11y ids (auto-generated if omitted)
 * - fixed — scrollable fixed-height panel (pf-m-fixed)
 * - custom-content — skip the body wrapper
 * - content-aria-label, extra-class, content-extra-class
 *
 * CONTENT PROJECTION
 * ------------------
 * Default slot text → toggle label; <div slot="content"> → panel body.
 */
import { LitElement, html, nothing } from 'lit';
import { AccordionMixin } from './pf-accordion/pf-accordion-base.js';
import { AccordionItemMixin } from './pf-accordion/pf-accordion-item-base.js';
import { adoptPatternFlyLightHostStyles } from '../styles/pf-adopted-styles-light.js';

export const ACCORDION_TAG = 'pf-accordion-light';
export const ACCORDION_ITEM_TAG = 'pf-accordion-item-light';

class PFAccordionLight extends AccordionMixin(LitElement, ACCORDION_ITEM_TAG) {
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    adoptPatternFlyLightHostStyles();
    super.connectedCallback();
  }

  _getItemElements() {
    const renderedRoot = this.querySelector('[data-accordion-root]');
    const fromHost = [...this.children].filter(
      (child) => child.tagName === ACCORDION_ITEM_TAG.toUpperCase()
    );

    if (fromHost.length) {
      return fromHost;
    }

    if (renderedRoot) {
      return [...renderedRoot.children].filter(
        (child) => child.tagName === ACCORDION_ITEM_TAG.toUpperCase()
      );
    }

    return [];
  }

  render() {
    const items = this._getItemElements();
    const rootClass = this._getRootClass();
    const label = this.ariaLabel || nothing;

    if (this.definitionList) {
      return html`
        <dl data-accordion-root class="${rootClass}" aria-label=${label}>
          ${items}
        </dl>
      `;
    }

    return html`
      <div data-accordion-root class="${rootClass}" aria-label=${label}>
        ${items}
      </div>
    `;
  }
}

class PFAccordionItemLight extends AccordionItemMixin(LitElement) {
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    this._captureHostProjection();
    super.connectedCallback();
  }

  _isContentNode(node) {
    return node.nodeType === Node.ELEMENT_NODE && node.getAttribute('slot') === 'content';
  }

  /**
   * Snapshot host children before Lit moves them into the rendered accordion markup.
   */
  _captureHostProjection() {
    if (this._projectionCaptured) {
      return;
    }

    const toggleNodes = [...this.childNodes].filter((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent?.trim();
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        return !this._isContentNode(node);
      }
      return false;
    });
    const contentNodes = [...this.querySelectorAll('[slot="content"]')];

    if (!toggleNodes.length && !contentNodes.length) {
      return;
    }

    this._toggleLabel = toggleNodes
      .map((node) => node.textContent ?? '')
      .join('')
      .trim();
    this._contentProjection = contentNodes;
    this._projectionCaptured = true;

    toggleNodes.forEach((node) => node.remove());
  }

  _cleanupOrphanHostNodes() {
    [...this.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        node.remove();
      }
    });
  }

  _useItemHostWrapper() {
    return false;
  }

  _getToggleLabel() {
    if (this._toggleLabel) {
      return this._toggleLabel;
    }

    const region = this.querySelector('.pf-v6-c-accordion__toggle-text');
    const label = region?.textContent?.trim();
    if (label) {
      this._toggleLabel = label;
    }

    return this._toggleLabel ?? '';
  }

  _getContentProjection() {
    if (this._contentProjection?.length) {
      return this._contentProjection;
    }

    const fromHost = [...this.querySelectorAll('[slot="content"]')];
    if (fromHost.length) {
      this._contentProjection = fromHost;
      return fromHost;
    }

    const region = this.querySelector('.pf-v6-c-accordion__expandable-content-body');
    return region ? [...region.childNodes] : [];
  }

  render() {
    this._captureHostProjection();
    this._cleanupOrphanHostNodes();

    return this._renderItemStructure(this._getToggleLabel(), this._getContentProjection());
  }
}

if (!customElements.get(ACCORDION_TAG)) {
  customElements.define(ACCORDION_TAG, PFAccordionLight);
}

if (!customElements.get(ACCORDION_ITEM_TAG)) {
  customElements.define(ACCORDION_ITEM_TAG, PFAccordionItemLight);
}

export { PFAccordionLight, PFAccordionItemLight };
