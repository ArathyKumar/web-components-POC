/**
 * pf-accordion-shadow / pf-accordion-item-shadow — PatternFly accordion with Shadow DOM.
 *
 * Requires global patternfly.css for design tokens. Component CSS is adopted into
 * each shadow root via adoptPatternFlyAccordionShadowStyles().
 */
import { LitElement, html, nothing } from 'lit';
import {
  adoptPatternFlyAccordionShadowStyles,
  adoptPatternFlyAccordionItemShadowStyles,
} from './styles/adopted-shadow.js';

export const ACCORDION_TAG = 'pf-accordion-shadow';
export const ACCORDION_ITEM_TAG = 'pf-accordion-item-shadow';

const ACCORDION_TOGGLE_EVENT = 'pf-accordion-toggle';
const ACCORDION_BLOCK = 'pf-v6-c-accordion';
const ACCORDION_PARENT_TAG = 'PF-ACCORDION-SHADOW';

let accordionIdCounter = 0;

function createAccordionId(prefix, instanceId) {
  accordionIdCounter += 1;
  return instanceId
    ? `${prefix}-${instanceId}-${accordionIdCounter}`
    : `${prefix}-${accordionIdCounter}`;
}

function createAccordionInstanceId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().slice(0, 8);
  }

  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function getAccordionRootClassNames({
  bordered = false,
  plain = false,
  noPlainOnGlass = false,
  displayLg = false,
  toggleStart = false,
  extraClass = '',
} = {}) {
  const classes = [ACCORDION_BLOCK];

  if (bordered) classes.push('pf-m-bordered');
  if (plain) classes.push('pf-m-plain');
  if (noPlainOnGlass) classes.push('pf-m-no-plain-on-glass');
  if (displayLg) classes.push('pf-m-display-lg');
  if (toggleStart) classes.push('pf-m-toggle-start');
  if (extraClass) classes.push(extraClass);

  return classes.join(' ');
}

function getAccordionItemClassNames(expanded, extraClass = '') {
  const classes = [`${ACCORDION_BLOCK}__item`];
  if (expanded) classes.push('pf-m-expanded');
  if (extraClass) classes.push(extraClass);
  return classes.join(' ');
}

function getAccordionContentClassNames(fixed, extraClass = '') {
  const classes = [`${ACCORDION_BLOCK}__expandable-content`];
  if (fixed) classes.push('pf-m-fixed');
  if (extraClass) classes.push(extraClass);
  return classes.join(' ');
}

const accordionCaretDownIcon = html`
  <svg
    class="pf-v6-svg"
    fill="currentColor"
    viewBox="0 0 20 20"
    aria-hidden="true"
    role="img"
    width="1em"
    height="1em"
  >
    <path
      d="M18.71 5.29a.996.996 0 0 0-1.41 0l-7.29 7.29-7.3-7.29a.987.987 0 0 0-1.41-.02.987.987 0 0 0-.02 1.41l.02.02 7.65 7.65c.29.29.68.44 1.06.44s.77-.15 1.06-.44l7.65-7.65a.996.996 0 0 0 0-1.41Z"
    />
  </svg>
`;

function getAccordionParent(item) {
  let node = item.parentElement;

  while (node) {
    if (node.tagName === ACCORDION_PARENT_TAG) {
      return node;
    }
    node = node.parentElement;
  }

  return null;
}

function readDefinitionList(parent) {
  if (typeof parent.definitionList === 'boolean') {
    return parent.definitionList;
  }

  if (!parent.hasAttribute('definition-list')) {
    return true;
  }

  return parent.getAttribute('definition-list') !== 'false';
}

function getAccordionModifierOptions(parent) {
  if (!parent) {
    return {
      bordered: false,
      plain: false,
      noPlainOnGlass: false,
      displayLg: false,
      toggleStart: false,
      extraClass: '',
    };
  }

  const hasAttr = (name) => parent.hasAttribute(name);
  const getAttr = (name) => parent.getAttribute(name) || '';

  return {
    bordered: Boolean(parent.bordered || hasAttr('bordered')),
    plain: Boolean(parent.plain || hasAttr('plain')),
    noPlainOnGlass: Boolean(parent.noPlainOnGlass || hasAttr('no-plain-on-glass')),
    displayLg: Boolean(parent.displayLg || hasAttr('display-lg')),
    toggleStart: Boolean(parent.toggleStart || hasAttr('toggle-start')),
    extraClass: parent.extraClass || getAttr('extra-class') || '',
  };
}

function getItemContext(item) {
  const parent = getAccordionParent(item);
  const modifiers = getAccordionModifierOptions(parent);

  if (!parent) {
    return {
      asDefinitionList: true,
      headingLevel: 'h3',
      togglePosition: 'end',
      accordionClassNames: getAccordionRootClassNames(modifiers),
    };
  }

  return {
    asDefinitionList: readDefinitionList(parent),
    headingLevel: parent.getAttribute('heading-level') || parent.headingLevel || 'h3',
    togglePosition: modifiers.toggleStart ? 'start' : 'end',
    accordionClassNames: getAccordionRootClassNames(modifiers),
  };
}

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

class PFAccordionShadow extends LitElement {
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

  createRenderRoot() {
    const root = super.createRenderRoot();
    adoptPatternFlyAccordionShadowStyles(root);
    return root;
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener(ACCORDION_TOGGLE_EVENT, this._handleItemToggle);
    queueMicrotask(() => this._syncItemUpdates());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(ACCORDION_TOGGLE_EVENT, this._handleItemToggle);
  }

  updated(changedProperties) {
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

  _syncItemUpdates() {
    this.querySelectorAll(ACCORDION_ITEM_TAG).forEach((item) => {
      item.requestUpdate?.();
    });
  }

  _handleItemToggle(event) {
    if (!this.singleExpand) {
      return;
    }

    const { item, expanded } = event.detail;
    if (!expanded) {
      return;
    }

    this.querySelectorAll(ACCORDION_ITEM_TAG).forEach((element) => {
      if (element !== item) {
        element.expanded = false;
      }
    });
  }

  _getRootClass() {
    return getAccordionRootClassNames({
      bordered: this.bordered,
      plain: this.plain,
      noPlainOnGlass: this.noPlainOnGlass,
      displayLg: this.displayLg,
      toggleStart: this.toggleStart,
      extraClass: this.extraClass,
    });
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

class PFAccordionItemShadow extends LitElement {
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
    this._idScope = createAccordionInstanceId();
  }

  createRenderRoot() {
    const root = super.createRenderRoot();
    adoptPatternFlyAccordionItemShadowStyles(root);
    return root;
  }

  connectedCallback() {
    super.connectedCallback();
    this._ensureIds();
  }

  _ensureIds() {
    if (!this.toggleId) {
      this.toggleId = createAccordionId('accordion-toggle', this._idScope);
    }
    if (!this.contentId) {
      this.contentId = createAccordionId('accordion-content', this._idScope);
    }
  }

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

  _renderToggle(toggleContent, togglePosition) {
    const icon = html`
      <span class="${ACCORDION_BLOCK}__toggle-icon" part="toggle-icon">${accordionCaretDownIcon}</span>
    `;
    const toggleText = html`
      <span class="${ACCORDION_BLOCK}__toggle-text">${toggleContent}</span>
    `;
    const children =
      togglePosition === 'start' ? html`${icon}${toggleText}` : html`${toggleText}${icon}`;

    return html`
      <button
        class="${ACCORDION_BLOCK}__toggle"
        part="toggle"
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

    return html`<div class="${ACCORDION_BLOCK}__expandable-content-body">${content}</div>`;
  }

  _renderContent(content, asDefinitionList) {
    const contentClass = getAccordionContentClassNames(this.fixed, this.contentExtraClass);
    const contentBody = this._renderContentBody(content);
    const fixedExpanded = this.fixed && this.expanded;

    if (asDefinitionList) {
      return html`
        <dd
          class=${contentClass}
          part="content"
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
        part="content"
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

  _renderItemStructure() {
    const { asDefinitionList, headingLevel, togglePosition, accordionClassNames } =
      getItemContext(this);
    const itemClass = getAccordionItemClassNames(this.expanded, this.extraClass);
    const toggle = this._renderToggle(html`<slot></slot>`, togglePosition);
    const content = this._renderContent(html`<slot name="content"></slot>`, asDefinitionList);

    const itemMarkup = asDefinitionList
      ? html`
          <div class="${itemClass}" part="item">
            <dt>${toggle}</dt>
            ${content}
          </div>
        `
      : html`
          <div class="${itemClass}" part="item">
            ${renderHeadingToggle(headingLevel, toggle)}
            ${content}
          </div>
        `;

    return html`
      <div class="${accordionClassNames} pf-m-item-host" style="display: contents">
        ${itemMarkup}
      </div>
    `;
  }

  render() {
    return this._renderItemStructure();
  }
}

if (!customElements.get(ACCORDION_TAG)) {
  customElements.define(ACCORDION_TAG, PFAccordionShadow);
}

if (!customElements.get(ACCORDION_ITEM_TAG)) {
  customElements.define(ACCORDION_ITEM_TAG, PFAccordionItemShadow);
}

export { PFAccordionShadow, PFAccordionItemShadow };
