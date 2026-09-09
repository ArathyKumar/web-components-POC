import { LitElement, html, nothing } from 'lit';
import { getPatternFlyButtonClassNames } from './pf-button-class-names.js';
import {
  rhUiStarIcon,
  rhUiStarFillIcon,
  rhUiSettingsFillIcon,
  rhUiAddCircleFillIcon,
  hamburgerIcon,
  getButtonIcon,
} from './pf-button-icons.js';

/**
 * Shared button logic. Not registered as a custom element — use pf-button-shadow or pf-button-light.
 */
export class PfButtonCore extends LitElement {
  static formAssociated = true;

  static properties = {
    icon: { type: String },
    srText: { type: String, attribute: 'sr-text' },
    variant: { type: String, reflect: true },
    size: { type: String, reflect: true },
    state: { type: String, reflect: true },
    type: { type: String, reflect: true },
    name: { type: String, reflect: true },
    form: { type: String, reflect: true },
    value: { type: String, reflect: true },
    as: { type: String, reflect: true },
    href: { type: String },
    extraClass: { type: String, attribute: 'extra-class' },
    ariaLabel: { type: String, attribute: 'aria-label' },
    iconPosition: { type: String, attribute: 'icon-position' },
    hamburgerVariant: { type: String, attribute: 'hamburger-variant' },
    count: { type: Number },
    block: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    ariaDisabled: { type: Boolean, attribute: 'aria-disabled', reflect: true },
    loading: { type: Boolean, reflect: true },
    clicked: { type: Boolean, reflect: true },
    inline: { type: Boolean, reflect: true },
    danger: { type: Boolean, reflect: true },
    favorite: { type: Boolean, reflect: true },
    favorited: { type: Boolean, reflect: true },
    noPadding: { type: Boolean, attribute: 'no-padding', reflect: true },
    settings: { type: Boolean, reflect: true },
    hamburger: { type: Boolean, reflect: true },
    circle: { type: Boolean, reflect: true },
    docked: { type: Boolean, reflect: true },
    textExpanded: { type: Boolean, attribute: 'text-expanded', reflect: true },
    expanded: { type: Boolean, reflect: true },
    countRead: { type: Boolean, attribute: 'count-read', reflect: true },
    spinnerAriaLabel: { type: String, attribute: 'spinner-aria-label' },
    spinnerAriaLabelledBy: { type: String, attribute: 'spinner-aria-labelledby' },
    spinnerAriaValueText: { type: String, attribute: 'spinner-aria-value-text' },
    controlId: { type: String, attribute: 'control-id' },
  };

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  connectedCallback() {
    super.connectedCallback();
    this._syncFormDisabledState();
    this._syncFormValue();
  }

  focus(options) {
    this._getControlElement()?.focus(options);
  }

  blur() {
    this._getControlElement()?.blur();
  }

  formDisabledCallback(disabled) {
    this.disabled = disabled;
  }

  formResetCallback() {
    this.loading = false;
    this.favorited = false;
    this.clicked = false;
    this.expanded = false;
  }

  updated(changedProperties) {
    if (changedProperties.has('favorited') && this.favorite && this.favorited) {
      this._replayFavoriteAnimation();
    }

    if (changedProperties.has('disabled') || changedProperties.has('ariaDisabled')) {
      this._syncFormDisabledState();
    }

    if (changedProperties.has('value') || changedProperties.has('name')) {
      this._syncFormValue();
    }
  }

  _syncFormDisabledState() {
    const disabled = this.disabled || this.ariaDisabled;
    this.internals.ariaDisabled = disabled;
  }

  _syncFormValue() {
    if (this.name) {
      this.internals.setFormValue(this.value ?? '');
      return;
    }

    this.internals.setFormValue(null);
  }

  _usesNativeSlots() {
    return true;
  }

  _getProjectableChildNodes() {
    return this.childNodes;
  }

  _isDefaultSlotNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return Boolean(node.textContent?.trim());
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const slotName = node.getAttribute('slot');
      return !slotName || slotName === '';
    }
    return false;
  }

  _getDefaultSlotNodes() {
    const fromHost = [...this._getProjectableChildNodes()].filter((node) =>
      this._isDefaultSlotNode(node)
    );
    if (fromHost.length) {
      return fromHost;
    }

    const textPart = this._getControlElement()?.querySelector('[part="text"]');
    if (!textPart) {
      return [];
    }

    return [...textPart.childNodes].filter((node) => {
      return !(
        node.nodeType === Node.ELEMENT_NODE && node.getAttribute('part') === 'sr-text'
      );
    });
  }

  _getIconSlotNode() {
    return (
      this.querySelector('[slot="icon"]') ||
      this._getControlElement()?.querySelector('.pf-v6-c-button__icon [slot="icon"]')
    );
  }

  _getControlElement() {
    return this.renderRoot?.querySelector('[part="control"]');
  }

  _replayFavoriteAnimation() {
    requestAnimationFrame(() => {
      const control = this._getControlElement();
      if (!control?.classList.contains('pf-m-favorited')) {
        return;
      }

      control.classList.remove('pf-m-favorited');
      void control.offsetWidth;
      control.classList.add('pf-m-favorited');
    });
  }

  _getAssociatedForm() {
    if (this.internals.form) {
      return this.internals.form;
    }

    if (this.form) {
      return document.getElementById(this.form);
    }

    return null;
  }

  _submitForm() {
    const form = this._getAssociatedForm();
    if (!form) {
      return;
    }

    if (typeof SubmitEvent !== 'undefined') {
      form.dispatchEvent(
        new SubmitEvent('submit', {
          bubbles: true,
          cancelable: true,
          submitter: this,
        })
      );
      return;
    }

    try {
      form.requestSubmit(this);
    } catch {
      form.requestSubmit();
    }
  }

  _resetForm() {
    const form = this._getAssociatedForm();
    form?.reset();
  }

  _dispatchComponentEvent(name, detail) {
    this.dispatchEvent(
      new CustomEvent(name, {
        detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  _isProgressCapable() {
    return (
      this.loading ||
      Boolean(this.spinnerAriaLabel) ||
      Boolean(this.spinnerAriaLabelledBy) ||
      Boolean(this.spinnerAriaValueText)
    );
  }

  _dispatchActivateEvents() {
    this._dispatchComponentEvent('pf-activate', {
      variant: this.variant || 'primary',
      type: this._getButtonType(),
    });

    if (this.favorite) {
      this._dispatchComponentEvent('pf-favorite-change', {
        favorited: !this.favorited,
      });
    }

    if (this._isProgressCapable()) {
      this._dispatchComponentEvent('pf-loading-change', {
        loading: !this.loading,
      });
    }
  }

  _getClassNames() {
    return getPatternFlyButtonClassNames({
      variant: this.variant || 'primary',
      size: this.size || 'default',
      state: this.state || 'unread',
      className: this.extraClass || '',
      block: this.block,
      disabled: this.disabled,
      ariaDisabled: this.ariaDisabled,
      loading: this.loading,
      clicked: this.clicked,
      inline: this.inline,
      danger: this.danger,
      favorite: this.favorite,
      favorited: this.favorited,
      noPadding: this.noPadding,
      settings: this.settings,
      hamburger: this.hamburger,
      hamburgerVariant: this.hamburgerVariant,
      circle: this.circle,
      docked: this.docked,
      textExpanded: this.textExpanded,
    });
  }

  _getTagName() {
    return this.as || 'button';
  }

  _getButtonType() {
    return this.type || 'button';
  }

  _shouldRenderAriaDisabled() {
    const tag = this._getTagName();
    return this.ariaDisabled || (tag !== 'button' && this.disabled);
  }

  _getTabIndex() {
    const tag = this._getTagName();
    if (this.disabled) {
      return tag === 'button' ? null : -1;
    }
    if (this.ariaDisabled) {
      return null;
    }
    if (this.inline && tag === 'span') {
      return 0;
    }
    return null;
  }

  _iconPositionAtEnd() {
    return this.iconPosition === 'end' || this.iconPosition === 'right';
  }

  _hasDefaultSlotContent() {
    if (!this._usesNativeSlots()) {
      return this._getDefaultSlotNodes().length > 0;
    }

    return [...this._getProjectableChildNodes()].some((node) => this._isDefaultSlotNode(node));
  }

  _hasIconSlotContent() {
    return Boolean(this._getIconSlotNode());
  }

  _renderDefaultSlotContent() {
    if (this._usesNativeSlots()) {
      return html`<slot></slot>`;
    }

    const nodes = this._getDefaultSlotNodes();
    return nodes.length ? nodes : nothing;
  }

  _renderIconSlotContent() {
    if (this._usesNativeSlots()) {
      return html`<slot name="icon"></slot>`;
    }

    const iconNode = this._getIconSlotNode();
    return iconNode ?? nothing;
  }

  _shouldRenderIcon() {
    return (
      this.favorite ||
      this.settings ||
      this.hamburger ||
      Boolean(this.icon) ||
      this.circle ||
      this._hasIconSlotContent()
    );
  }

  _renderProgress() {
    const valueText = this.spinnerAriaValueText || 'Loading...';
    const hasLabelledBy = Boolean(this.spinnerAriaLabelledBy);
    const spinnerLabel = hasLabelledBy ? undefined : this.spinnerAriaLabel || 'Loading';
    const spinnerClass = this.inline
      ? 'pf-v6-c-spinner pf-m-inline'
      : 'pf-v6-c-spinner pf-m-md';

    return html`
      <span class="pf-v6-c-button__progress" part="progress">
        <svg
          class=${spinnerClass}
          part="spinner"
          role="progressbar"
          viewBox="0 0 100 100"
          aria-label=${spinnerLabel}
          aria-labelledby=${hasLabelledBy ? this.spinnerAriaLabelledBy : undefined}
          aria-valuetext=${valueText}
        >
          <circle class="pf-v6-c-spinner__path" cx="50" cy="50" r="45" fill="none"></circle>
        </svg>
      </span>
    `;
  }

  _getIconPositionClass() {
    const hasLabel = this._hasDefaultSlotContent();
    const isIconOnly =
      this.favorite ||
      this.settings ||
      this.hamburger ||
      (this.circle && !hasLabel) ||
      (Boolean(this.icon) && !hasLabel) ||
      (this._hasIconSlotContent() && !hasLabel);

    if (!hasLabel && isIconOnly) {
      return '';
    }

    return this._iconPositionAtEnd() ? 'pf-m-end' : 'pf-m-start';
  }

  _renderIcon() {
    if (!this._shouldRenderIcon()) {
      return null;
    }

    const position = this._getIconPositionClass();
    let iconContent = null;

    if (this.favorite) {
      iconContent = html`
        <span class="pf-v6-c-button__icon-favorite" part="icon-favorite">${rhUiStarIcon}</span>
        <span class="pf-v6-c-button__icon-favorited" part="icon-favorited">${rhUiStarFillIcon}</span>
      `;
    } else if (this.settings) {
      iconContent = rhUiSettingsFillIcon;
    } else if (this.hamburger) {
      iconContent = hamburgerIcon;
    } else if (this.icon) {
      iconContent = getButtonIcon(this.icon);
    } else if (this.circle) {
      iconContent = rhUiAddCircleFillIcon;
    } else {
      iconContent = this._renderIconSlotContent();
    }

    return html`
      <span class="pf-v6-c-button__icon ${position}" part="icon" aria-hidden="true">
        ${iconContent}
      </span>
    `;
  }

  _renderCount() {
    if (this.count == null) {
      return null;
    }

    const badgeClass = this.countRead ? 'pf-v6-c-badge pf-m-read' : 'pf-v6-c-badge pf-m-unread';

    return html`
      <span class="pf-v6-c-button__count" part="count">
        <span class=${badgeClass} part="badge">${this.count}</span>
      </span>
    `;
  }

  _renderLabel() {
    if (this.circle) {
      return null;
    }

    const srText = this.srText
      ? html` <span class="pf-v6-screen-reader" part="sr-text">${this.srText}</span>`
      : null;

    if (this.variant === 'plain' && this.ariaLabel && !this._hasDefaultSlotContent()) {
      return null;
    }

    return html`<span class="pf-v6-c-button__text" part="text">${this._renderDefaultSlotContent()}${srText}</span>`;
  }

  _renderButtonContent() {
    const progress = this.loading ? this._renderProgress() : null;
    const icon = this._renderIcon();
    const label = this._renderLabel();
    const count = this._renderCount();

    if (this._iconPositionAtEnd()) {
      return html`${progress}${label}${icon}${count}`;
    }

    return html`${progress}${icon}${label}${count}`;
  }

  _handleSpanKeydown(event) {
    if (this._getTagName() !== 'span') {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.currentTarget.click();
    }
  }

  _handleActivatorClick(event) {
    if (this.disabled || this.ariaDisabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const component = this._getTagName();
    const buttonType = this._getButtonType();

    if (component === 'button') {
      if (buttonType === 'submit') {
        event.preventDefault();
        this._submitForm();
      } else if (buttonType === 'reset') {
        event.preventDefault();
        this._resetForm();
      }
    }

    this._dispatchActivateEvents();
  }

  _renderControl(exportParts) {
    const classes = this._getClassNames();
    const content = this._renderButtonContent();
    const component = this._getTagName();
    const ariaDisabled = this._shouldRenderAriaDisabled() ? 'true' : undefined;
    const ariaLabel = this.ariaLabel || undefined;
    const tabIndex = this._getTabIndex() ?? undefined;
    const ariaExpanded = this.hamburger ? String(this.expanded ?? false) : undefined;
    const exportparts = exportParts ?? nothing;

    if (component === 'a') {
      return html`
        <a
          class=${classes}
          part="control"
          exportparts=${exportparts}
          href=${this.href || undefined}
          aria-disabled=${ariaDisabled}
          aria-label=${ariaLabel}
          tabindex=${tabIndex}
          @click=${this._handleActivatorClick}
        >
          ${content}
        </a>
      `;
    }

    if (component === 'span') {
      return html`
        <span
          class=${classes}
          part="control"
          exportparts=${exportparts}
          role="button"
          aria-disabled=${ariaDisabled}
          aria-label=${ariaLabel}
          tabindex=${tabIndex}
          @click=${this._handleActivatorClick}
          @keydown=${this._handleSpanKeydown}
        >
          ${content}
        </span>
      `;
    }

    return html`
      <button
        class=${classes}
        part="control"
        exportparts=${exportparts}
        id=${this.controlId || undefined}
        type="button"
        ?disabled=${this.disabled}
        aria-disabled=${ariaDisabled}
        aria-label=${ariaLabel}
        aria-expanded=${ariaExpanded}
        tabindex=${tabIndex}
        @click=${this._handleActivatorClick}
      >
        ${content}
      </button>
    `;
  }
}
