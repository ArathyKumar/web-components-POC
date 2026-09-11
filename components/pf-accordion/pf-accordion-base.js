import { LitElement } from 'lit';
import { getAccordionClassNames } from './pf-accordion-class-names.js';
import { ACCORDION_TOGGLE_EVENT } from './pf-accordion-events.js';

/**
 * Shared accordion container behavior.
 * @param {typeof LitElement} Base
 * @param {string} itemTagName
 */
export function AccordionMixin(Base, itemTagName) {
  return class PFAccordionBase extends Base {
    static properties = {
      definitionList: {
        type: Boolean,
        attribute: 'definition-list',
        reflect: true,
        converter: {
          fromAttribute: (value) => value !== 'false',
          toAttribute: (value) => (value ? '' : null),
        },
      },
      bordered: { type: Boolean, reflect: true },
      plain: { type: Boolean, reflect: true },
      noPlainOnGlass: { type: Boolean, attribute: 'no-plain-on-glass', reflect: true },
      displayLg: { type: Boolean, attribute: 'display-lg', reflect: true },
      toggleStart: { type: Boolean, attribute: 'toggle-start', reflect: true },
      headingLevel: { type: String, attribute: 'heading-level' },
      singleExpand: { type: Boolean, attribute: 'single-expand', reflect: true },
      ariaLabel: { type: String, attribute: 'aria-label' },
      extraClass: { type: String, attribute: 'extra-class' },
    };

    constructor() {
      super();
      this.definitionList = true;
      this.headingLevel = 'h3';
    }

    connectedCallback() {
      super.connectedCallback();
      this.addEventListener(ACCORDION_TOGGLE_EVENT, this._handleItemToggle);
      queueMicrotask(() => this._syncItemUpdates());
    }

    /** Re-render items after the accordion host attributes/properties are ready. */
    _syncItemUpdates() {
      this.querySelectorAll(itemTagName).forEach((item) => {
        if (typeof item.requestUpdate === 'function') {
          item.requestUpdate();
        }
      });
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener(ACCORDION_TOGGLE_EVENT, this._handleItemToggle);
    }

    updated(changedProperties) {
      super.updated?.(changedProperties);

      const modifierProps = [
        'bordered',
        'plain',
        'noPlainOnGlass',
        'displayLg',
        'toggleStart',
        'extraClass',
        'definitionList',
        'headingLevel',
      ];

      if (modifierProps.some((prop) => changedProperties.has(prop))) {
        this._syncItemUpdates();
      }
    }

    /** @param {CustomEvent} event */
    _handleItemToggle(event) {
      if (!this.singleExpand) {
        return;
      }

      const { item, expanded } = event.detail;
      if (!expanded) {
        return;
      }

      this.querySelectorAll(itemTagName).forEach((element) => {
        if (element !== item) {
          element.expanded = false;
        }
      });
    }

    _getRootClass() {
      return getAccordionClassNames({
        bordered: this.bordered,
        plain: this.plain,
        noPlainOnGlass: this.noPlainOnGlass,
        displayLg: this.displayLg,
        toggleStart: this.toggleStart,
        extraClass: this.extraClass,
      });
    }
  };
}
