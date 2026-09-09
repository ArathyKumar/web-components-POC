import { LitElement, html } from 'lit';
import { getPatternFlyButtonClassNames } from './pf-button-class-names.js';
import { adoptPatternFlyStyles } from './pf-adopted-styles.js';
import {
  rhUiStarIcon,
  rhUiStarFillIcon,
  rhUiSettingsFillIcon,
  rhUiAddCircleFillIcon,
  hamburgerIcon,
  getButtonIcon,
} from './pf-button-icons.js';

export const ELEMENT_TAG = 'pf-button-shadow';

const LEGACY_PF_BUTTON_TAG = 'pf-button';

export class PfButton extends LitElement {
  static formAssociated = true;

  static properties = {
    label: { type: String },
    icon: { type: String },
    srText: { type: String, attribute: 'sr-text' },
    variant: { type: String, reflect: true },
    size: { type: String, reflect: true },
    state: { type: String, reflect: true },
    type: { type: String, reflect: true },
    buttonType: { type: String, attribute: 'button-type' },
    name: { type: String, reflect: true },
    form: { type: String, reflect: true },
    value: { type: String, reflect: true },
    component: { type: String, reflect: true },
    href: { type: String },
    extraClass: { type: String, attribute: 'extra-class' },
    ariaLabel: { type: String, attribute: 'aria-label' },
    iconPosition: { type: String, attribute: 'icon-position' },
    hamburgerVariant: { type: String, attribute: 'hamburger-variant' },
    count: { type: Number },
    isBlock: { type: Boolean, attribute: 'is-block', reflect: true },
    isDisabled: { type: Boolean, attribute: 'is-disabled', reflect: true },
    isAriaDisabled: { type: Boolean, attribute: 'is-aria-disabled', reflect: true },
    isLoading: { type: Boolean, attribute: 'is-loading', reflect: true },
    isClicked: { type: Boolean, attribute: 'is-clicked', reflect: true },
    isInline: { type: Boolean, attribute: 'is-inline', reflect: true },
    isDanger: { type: Boolean, attribute: 'is-danger', reflect: true },
    isFavorite: { type: Boolean, attribute: 'is-favorite', reflect: true },
    isFavorited: { type: Boolean, attribute: 'is-favorited', reflect: true },
    hasNoPadding: { type: Boolean, attribute: 'has-no-padding', reflect: true },
    isSettings: { type: Boolean, attribute: 'is-settings', reflect: true },
    isHamburger: { type: Boolean, attribute: 'is-hamburger', reflect: true },
    isCircle: { type: Boolean, attribute: 'is-circle', reflect: true },
    isDocked: { type: Boolean, attribute: 'is-docked', reflect: true },
    isTextExpanded: { type: Boolean, attribute: 'is-text-expanded', reflect: true },
    isExpanded: { type: Boolean, attribute: 'is-expanded', reflect: true },
    countRead: { type: Boolean, attribute: 'count-read', reflect: true },
    spinnerAriaLabel: { type: String, attribute: 'spinner-aria-label' },
    spinnerAriaLabelledBy: { type: String, attribute: 'spinner-aria-labelledby' },
    spinnerAriaValueText: { type: String, attribute: 'spinner-aria-value-text' },
    buttonId: { type: String, attribute: 'button-id' },
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

  createRenderRoot() {
    const root = super.createRenderRoot();
    adoptPatternFlyStyles(root);
    return root;
  }

  formDisabledCallback(disabled) {
    this.isDisabled = disabled;
  }

  formResetCallback() {
    this.isLoading = false;
    this.isFavorited = false;
    this.isClicked = false;
  }

  updated(changedProperties) {
    if (
      changedProperties.has('isFavorited') &&
      this.isFavorite &&
      this.isFavorited
    ) {
      this._replayFavoriteAnimation();
    }

    if (
      changedProperties.has('isDisabled') ||
      changedProperties.has('isAriaDisabled')
    ) {
      this._syncFormDisabledState();
    }

    if (changedProperties.has('value') || changedProperties.has('name')) {
      this._syncFormValue();
    }
  }

  _syncFormDisabledState() {
    const disabled = this.isDisabled || this.isAriaDisabled;
    this.internals.ariaDisabled = disabled;
  }

  _syncFormValue() {
    if (this.name) {
      this.internals.setFormValue(this.value ?? '');
    }
  }

  _replayFavoriteAnimation() {
    requestAnimationFrame(() => {
      const icon = this.renderRoot?.querySelector('[part="icon"]');
      if (!icon) {
        return;
      }

      icon.style.animation = 'none';
      void icon.offsetWidth;
      icon.style.removeProperty('animation');
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
      this.isLoading ||
      this.hasAttribute('is-loading') ||
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

    if (this.isFavorite) {
      this._dispatchComponentEvent('pf-favorite-change', {
        isFavorited: !this.isFavorited,
      });
    }

    if (this._isProgressCapable()) {
      this._dispatchComponentEvent('pf-loading-change', {
        isLoading: !this.isLoading,
      });
    }
  }

  _getClassNames() {
    return getPatternFlyButtonClassNames({
      variant: this.variant || 'primary',
      size: this.size || 'default',
      state: this.state || 'unread',
      className: this.extraClass || '',
      isBlock: this.isBlock,
      isDisabled: this.isDisabled,
      isAriaDisabled: this.isAriaDisabled,
      isLoading: this.isLoading,
      isClicked: this.isClicked,
      isInline: this.isInline,
      isDanger: this.isDanger,
      isFavorite: this.isFavorite,
      isFavorited: this.isFavorited,
      hasNoPadding: this.hasNoPadding,
      isSettings: this.isSettings,
      isHamburger: this.isHamburger,
      hamburgerVariant: this.hamburgerVariant,
      isCircle: this.isCircle,
      isDocked: this.isDocked,
      isTextExpanded: this.isTextExpanded,
    });
  }

  _getTagName() {
    return this.component || 'button';
  }

  _getButtonType() {
    return this.type || this.buttonType || 'button';
  }

  _shouldRenderAriaDisabled() {
    const tag = this._getTagName();
    return this.isAriaDisabled || (tag !== 'button' && this.isDisabled);
  }

  _getTabIndex() {
    const tag = this._getTagName();
    if (this.isDisabled) {
      return tag === 'button' ? null : -1;
    }
    if (this.isAriaDisabled) {
      return null;
    }
    if (this.isInline && tag === 'span') {
      return 0;
    }
    return null;
  }

  _iconPositionAtEnd() {
    return this.iconPosition === 'end' || this.iconPosition === 'right';
  }

  _hasDefaultSlotContent() {
    return [...this.childNodes].some((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent?.trim();
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        const slotName = node.getAttribute('slot');
        return !slotName || slotName === '';
      }
      return false;
    });
  }

  _hasIconSlotContent() {
    return Boolean(this.querySelector('[slot="icon"]'));
  }

  _shouldRenderIcon() {
    return (
      this.isFavorite ||
      this.isSettings ||
      this.isHamburger ||
      Boolean(this.icon) ||
      this.isCircle ||
      this._hasIconSlotContent()
    );
  }

  _renderProgress() {
    const valueText = this.spinnerAriaValueText || 'Loading...';
    const hasLabelledBy = Boolean(this.spinnerAriaLabelledBy);
    const spinnerLabel = hasLabelledBy ? undefined : this.spinnerAriaLabel || 'Loading';
    const spinnerClass = this.isInline
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
    const hasLabel = Boolean(this.label) || this._hasDefaultSlotContent();
    const isIconOnly =
      this.isFavorite ||
      this.isSettings ||
      this.isHamburger ||
      (this.isCircle && !hasLabel) ||
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

    if (this.isFavorite) {
      iconContent = html`
        <span class="pf-v6-c-button__icon-favorite" part="icon-favorite">${rhUiStarIcon}</span>
        <span class="pf-v6-c-button__icon-favorited" part="icon-favorited">${rhUiStarFillIcon}</span>
      `;
    } else if (this.isSettings) {
      iconContent = rhUiSettingsFillIcon;
    } else if (this.isHamburger) {
      iconContent = hamburgerIcon;
    } else if (this.icon) {
      iconContent = getButtonIcon(this.icon);
    } else if (this.isCircle) {
      iconContent = rhUiAddCircleFillIcon;
    } else {
      iconContent = html`<slot name="icon"></slot>`;
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
    if (this.isCircle) {
      return null;
    }

    const srText = this.srText
      ? html` <span class="pf-v6-screen-reader" part="sr-text">${this.srText}</span>`
      : null;

    if (this.label) {
      return html`<span class="pf-v6-c-button__text" part="text">${this.label}${srText}</span>`;
    }

    if (this.variant === 'plain' && this.ariaLabel && !this._hasDefaultSlotContent()) {
      return null;
    }

    return html`<span class="pf-v6-c-button__text" part="text"><slot></slot>${srText}</span>`;
  }

  _renderButtonContent() {
    const progress = this.isLoading ? this._renderProgress() : null;
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
    if (this.isDisabled || this.isAriaDisabled) {
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

  render() {
    const classes = this._getClassNames();
    const content = this._renderButtonContent();
    const component = this.component || 'button';
    const ariaDisabled = this._shouldRenderAriaDisabled() ? 'true' : undefined;
    const ariaLabel = this.ariaLabel || undefined;
    const tabIndex = this._getTabIndex() ?? undefined;
    const ariaExpanded = this.isHamburger
      ? String(this.isExpanded ?? false)
      : undefined;
    const exportparts =
      'control, icon, icon-favorite, icon-favorited, text, sr-text, progress, spinner, count, badge';

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
        id=${this.buttonId || undefined}
        type="button"
        ?disabled=${this.isDisabled}
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

function defineLegacyTag(tag) {
  if (!customElements.get(tag)) {
    customElements.define(tag, class extends PfButton {});
  }
}

if (!customElements.get(ELEMENT_TAG)) {
  customElements.define(ELEMENT_TAG, PfButton);
}

defineLegacyTag(LEGACY_PF_BUTTON_TAG);
