/**
 * pf-accordion-light / pf-accordion-item-light — PatternFly accordion (Light DOM).
 *
 * CONTENT PROJECTION — no shadow root, so slots are manual: non-`slot="content"`
 * host children → toggle label; `slot="content"` → panel. After first render, label
 * nodes may live under `.pf-v6-c-accordion__toggle-text`; getters preserve them on
 * re-render.
 *
 * THEMING — target PatternFly BEM classes under the host (e.g. .pf-v6-c-accordion__toggle).
 * Shadow items use ::part(); light items do not use part attributes.
 *
 * A11Y — keyboard nav via accordion-a11y.js; collapsed panels use hidden + inert.
 *
 * @see https://www.patternfly.org/components/accordion
 */
import { LitElement, html, nothing } from 'lit';
import { adoptPatternFlyLightHostStyles } from '../../styles/adopted-light.js';
import {
  getAccordionToggleButtons,
  handleAccordionToggleKeydown,
} from './accordion-a11y.js';

export const ACCORDION_TAG = 'pf-accordion-light';
export const ACCORDION_ITEM_TAG = 'pf-accordion-item-light';

const ACCORDION_TOGGLE_EVENT = 'pf-accordion-toggle';
const ACCORDION_BLOCK = 'pf-v6-c-accordion';
const ACCORDION_PARENT_TAG = 'PF-ACCORDION-LIGHT';

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
    };
  }

  return {
    asDefinitionList: readDefinitionList(parent),
    headingLevel: parent.getAttribute('heading-level') || parent.headingLevel || 'h3',
    togglePosition: modifiers.toggleStart ? 'start' : 'end',
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

class PFAccordionLight extends LitElement {
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
    this._handleToggleKeydown = (event) => {
      const toggles = getAccordionToggleButtons(this, ACCORDION_ITEM_TAG, false);
      handleAccordionToggleKeydown(event, toggles);
    };
  }

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    adoptPatternFlyLightHostStyles();
    super.connectedCallback();
    this.addEventListener(ACCORDION_TOGGLE_EVENT, this._handleItemToggle);
    this.addEventListener('keydown', this._handleToggleKeydown);
    queueMicrotask(() => this._syncItemUpdates());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(ACCORDION_TOGGLE_EVENT, this._handleItemToggle);
    this.removeEventListener('keydown', this._handleToggleKeydown);
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

class PFAccordionItemLight extends LitElement {
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
    return this;
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

  _isContentNode(node) {
    return node.nodeType === Node.ELEMENT_NODE && node.getAttribute('slot') === 'content';
  }

  _isToggleNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return Boolean(node.textContent?.trim());
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      return !this._isContentNode(node);
    }
    return false;
  }

  _getProjectableChildNodes() {
    return [...this.childNodes].filter((node) => {
      return !(
        node.nodeType === Node.ELEMENT_NODE && node.classList?.contains('pf-v6-c-accordion__item')
      );
    });
  }

  _getToggleNodes() {
    const fromHost = [...this._getProjectableChildNodes()].filter((node) =>
      this._isToggleNode(node)
    );
    if (fromHost.length) {
      return fromHost;
    }

    const region = this.querySelector('.pf-v6-c-accordion__toggle-text');
    return region ? [...region.childNodes] : [];
  }

  _getContentNodes() {
    const fromHost = [...this.querySelectorAll(':scope > [slot="content"]')];
    if (fromHost.length) {
      return fromHost;
    }

    const region = this.querySelector('.pf-v6-c-accordion__expandable-content-body');
    return region ? [...region.childNodes] : [];
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
      <span class="${ACCORDION_BLOCK}__toggle-icon">${accordionCaretDownIcon}</span>
    `;
    const toggleText = html`
      <span class="${ACCORDION_BLOCK}__toggle-text">${toggleContent}</span>
    `;
    const children =
      togglePosition === 'start' ? html`${icon}${toggleText}` : html`${toggleText}${icon}`;

    return html`
      <button
        class="${ACCORDION_BLOCK}__toggle"
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

  /**
   * Renders the expandable panel. Collapsed panels use hidden + inert so focus cannot
   * enter panel content while the section is closed.
   */
  _renderContent(content, asDefinitionList) {
    const contentClass = getAccordionContentClassNames(this.fixed, this.contentExtraClass);
    const contentBody = this._renderContentBody(content);
    const fixedExpanded = this.fixed && this.expanded;

    if (asDefinitionList) {
      return html`
        <dd
          class=${contentClass}
          id=${this.contentId}
          ?hidden=${!this.expanded}
          ?inert=${!this.expanded}
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
        ?inert=${!this.expanded}
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
    const { asDefinitionList, headingLevel, togglePosition } = getItemContext(this);
    const itemClass = getAccordionItemClassNames(this.expanded, this.extraClass);
    const toggleNodes = this._getToggleNodes();
    const contentNodes = this._getContentNodes();
    const toggleContent = toggleNodes.length ? toggleNodes : nothing;
    const panelContent = contentNodes.length ? contentNodes : nothing;
    const toggle = this._renderToggle(toggleContent, togglePosition);
    const content = this._renderContent(panelContent, asDefinitionList);

    if (asDefinitionList) {
      return html`
        <div class="${itemClass}">
          <dt>${toggle}</dt>
          ${content}
        </div>
      `;
    }

    return html`
      <div class="${itemClass}">
        ${renderHeadingToggle(headingLevel, toggle)}
        ${content}
      </div>
    `;
  }

  render() {
    return this._renderItemStructure();
  }
}

if (!customElements.get(ACCORDION_TAG)) {
  customElements.define(ACCORDION_TAG, PFAccordionLight);
}

if (!customElements.get(ACCORDION_ITEM_TAG)) {
  customElements.define(ACCORDION_ITEM_TAG, PFAccordionItemLight);
}

export { PFAccordionLight, PFAccordionItemLight };
