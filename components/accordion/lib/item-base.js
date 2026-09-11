import { LitElement, html, nothing } from 'lit';
import {
  getAccordionItemClassNames,
  getAccordionToggleClassNames,
  getAccordionToggleTextClassNames,
  getAccordionToggleIconClassNames,
  getAccordionContentClassNames,
  getAccordionContentBodyClassNames,
} from './class-names.js';
import { accordionCaretDownIcon } from './icons.js';
import { createAccordionId } from './id.js';
import { ACCORDION_TOGGLE_EVENT } from './events.js';
import { getAccordionContext } from './context.js';

/**
 * Lit cannot reliably render table/list section elements via dynamic tag names.
 * Use explicit templates for heading levels instead.
 * @param {string} headingLevel
 * @param {import('lit').TemplateResult} toggle
 */
function renderHeadingToggle(headingLevel, toggle) {
  switch (headingLevel) {
    case 'h1':
      return html`<h1>${toggle}</h1>`;
    case 'h2':
      return html`<h2>${toggle}</h2>`;
    case 'h4':
      return html`<h4>${toggle}</h4>`;
    case 'h5':
      return html`<h5>${toggle}</h5>`;
    case 'h6':
      return html`<h6>${toggle}</h6>`;
    case 'h3':
    default:
      return html`<h3>${toggle}</h3>`;
  }
}

/**
 * Shared accordion item behavior for shadow and light DOM variants.
 * @param {typeof LitElement} Base
 */
export function AccordionItemMixin(Base) {
  return class PFAccordionItemBase extends Base {
    static properties = {
      expanded: { type: Boolean, reflect: true },
      toggleId: { type: String, attribute: 'toggle-id' },
      contentId: { type: String, attribute: 'content-id' },
      fixed: { type: Boolean, reflect: true },
      customContent: { type: Boolean, attribute: 'custom-content', reflect: true },
      contentAriaLabel: { type: String, attribute: 'content-aria-label' },
      extraClass: { type: String, attribute: 'extra-class' },
      contentExtraClass: { type: String, attribute: 'content-extra-class' },
    };

    constructor() {
      super();
      this.expanded = false;
      this.fixed = false;
      this.customContent = false;
    }

    connectedCallback() {
      super.connectedCallback();
      this._ensureIds();
    }

    _ensureIds() {
      if (!this.toggleId) {
        this.toggleId = createAccordionId('accordion-toggle');
      }
      if (!this.contentId) {
        this.contentId = createAccordionId('accordion-content');
      }
    }

    /** @param {Event} event */
    _handleToggleClick(event) {
      event.preventDefault();
      const nextExpanded = !this.expanded;
      this.expanded = nextExpanded;

      this.dispatchEvent(
        new CustomEvent(ACCORDION_TOGGLE_EVENT, {
          bubbles: true,
          composed: true,
          detail: {
            item: this,
            expanded: nextExpanded,
            toggleId: this.toggleId,
          },
        })
      );
    }

    _getContext() {
      return getAccordionContext(this);
    }

    /** Shadow items need an inner .pf-v6-c-accordion wrapper for CSS variables. */
    _useItemHostWrapper() {
      return true;
    }

    _renderToggle(toggleContent, togglePosition) {
      const icon = html`
        <span class="${getAccordionToggleIconClassNames()}">${accordionCaretDownIcon}</span>
      `;

      const toggleText = html`
        <span class="${getAccordionToggleTextClassNames()}">${toggleContent}</span>
      `;

      const children =
        togglePosition === 'start' ? html`${icon}${toggleText}` : html`${toggleText}${icon}`;

      return html`
        <button
          class="${getAccordionToggleClassNames()}"
          type="button"
          id=${this.toggleId}
          aria-expanded=${this.expanded ? 'true' : 'false'}
          aria-controls=${this.contentId}
          @click=${this._handleToggleClick}
        >
          ${children}
        </button>
      `;
    }

    _renderContentBody(content) {
      if (this.customContent) {
        return content;
      }

      return html`<div class="${getAccordionContentBodyClassNames()}">${content}</div>`;
    }

    _renderContent(content) {
      const { asDefinitionList } = this._getContext();
      const contentClass = getAccordionContentClassNames({
        fixed: this.fixed,
        extraClass: this.contentExtraClass,
      });
      const contentBody = this._renderContentBody(content);
      const fixedExpanded = this.fixed && this.expanded;

      if (asDefinitionList) {
        return html`
          <dd
            class=${contentClass}
            id=${this.contentId}
            ?hidden=${!this.expanded}
            role=${fixedExpanded ? 'region' : nothing}
            tabindex=${fixedExpanded ? '0' : nothing}
            aria-labelledby=${fixedExpanded ? this.toggleId : nothing}
            aria-label=${this.contentAriaLabel || nothing}
          >
            ${contentBody}
          </dd>
        `;
      }

      return html`
        <div
          class=${contentClass}
          id=${this.contentId}
          ?hidden=${!this.expanded}
          role=${fixedExpanded ? 'region' : nothing}
          tabindex=${fixedExpanded ? '0' : nothing}
          aria-labelledby=${fixedExpanded ? this.toggleId : nothing}
          aria-label=${this.contentAriaLabel || nothing}
        >
          ${contentBody}
        </div>
      `;
    }

    _renderItemStructure(toggleContent, panelContent) {
      const { asDefinitionList, headingLevel, togglePosition } = this._getContext();
      const itemClass = getAccordionItemClassNames({
        expanded: this.expanded,
        extraClass: this.extraClass,
      });

      const toggle = this._renderToggle(toggleContent, togglePosition);
      const content = this._renderContent(panelContent);

      const itemMarkup = asDefinitionList
        ? html`
            <div class="${itemClass}">
              <dt>${toggle}</dt>
              ${content}
            </div>
          `
        : html`
            <div class="${itemClass}">
              ${renderHeadingToggle(headingLevel, toggle)}
              ${content}
            </div>
          `;

      if (!this._useItemHostWrapper()) {
        return itemMarkup;
      }

      const { accordionClassNames } = this._getContext();

      // Mirror parent accordion modifiers inside shadow roots so variant styles apply.
      return html`
        <div class="${accordionClassNames} pf-m-item-host" style="display: contents">
          ${itemMarkup}
        </div>
      `;
    }
  };
}
