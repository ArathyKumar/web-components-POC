import { LitElement, html, css, unsafeCSS } from 'lit';
import { getPatternFlyButtonClassNames } from './pf-button-class-names.js';
import spinnerStyles from './spinner-styles.js';
import {
  rhUiStarIcon,
  rhUiStarFillIcon,
  rhUiSettingsFillIcon,
  rhUiAddCircleFillIcon,
  hamburgerIcon,
  getButtonIcon,
} from './pf-button-icons.js';

const DEFAULT_LABEL = 'Shadow DOM Button';
const PATTERNFLY_CSS = 'node_modules/@patternfly/patternfly/patternfly.css';

export class ShadowDomButton extends LitElement {
  static styles = css`${unsafeCSS(spinnerStyles)}`;

  static properties = {
    label: { type: String },
    icon: { type: String },
    srText: { type: String, attribute: 'sr-text' },
    variant: { type: String },
    size: { type: String },
    state: { type: String },
    buttonType: { type: String, attribute: 'button-type' },
    component: { type: String },
    href: { type: String },
    extraClass: { type: String, attribute: 'extra-class' },
    ariaLabel: { type: String, attribute: 'aria-label' },
    iconPosition: { type: String, attribute: 'icon-position' },
    hamburgerVariant: { type: String, attribute: 'hamburger-variant' },
    count: { type: Number },
    isBlock: { type: Boolean, attribute: 'is-block' },
    isDisabled: { type: Boolean, attribute: 'is-disabled' },
    isAriaDisabled: { type: Boolean, attribute: 'is-aria-disabled' },
    isLoading: { type: Boolean, attribute: 'is-loading' },
    isClicked: { type: Boolean, attribute: 'is-clicked' },
    isInline: { type: Boolean, attribute: 'is-inline' },
    isDanger: { type: Boolean, attribute: 'is-danger' },
    isFavorite: { type: Boolean, attribute: 'is-favorite' },
    isFavorited: { type: Boolean, attribute: 'is-favorited' },
    hasNoPadding: { type: Boolean, attribute: 'has-no-padding' },
    isSettings: { type: Boolean, attribute: 'is-settings' },
    isHamburger: { type: Boolean, attribute: 'is-hamburger' },
    isCircle: { type: Boolean, attribute: 'is-circle' },
    isDocked: { type: Boolean, attribute: 'is-docked' },
    isTextExpanded: { type: Boolean, attribute: 'is-text-expanded' },
    isExpanded: { type: Boolean, attribute: 'is-expanded' },
    countRead: { type: Boolean, attribute: 'count-read' },
    spinnerAriaLabel: { type: String, attribute: 'spinner-aria-label' },
    spinnerAriaLabelledBy: { type: String, attribute: 'spinner-aria-labelledby' },
    spinnerAriaValueText: { type: String, attribute: 'spinner-aria-value-text' },
    buttonId: { type: String, attribute: 'button-id' },
  };

  createRenderRoot() {
    const root = super.createRenderRoot();
    const patternfly = document.createElement('link');
    patternfly.rel = 'stylesheet';
    patternfly.href = PATTERNFLY_CSS;
    root.appendChild(patternfly);
    return root;
  }

  updated(changedProperties) {
    if (
      changedProperties.has('isFavorited') &&
      this.isFavorite &&
      this.isFavorited
    ) {
      this._replayFavoriteAnimation();
    }
  }

  _replayFavoriteAnimation() {
    requestAnimationFrame(() => {
      const icon = this.renderRoot?.querySelector('.pf-v6-c-button__icon');
      if (!icon) {
        return;
      }

      icon.style.animation = 'none';
      void icon.offsetWidth;
      icon.style.removeProperty('animation');
    });
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

  _handleFavoriteClick() {
    if (!this.isFavorite || this.isDisabled || this.isAriaDisabled) {
      return;
    }

    this.isFavorited = !this.isFavorited;

    this.dispatchEvent(
      new CustomEvent('favorite-change', {
        detail: { isFavorited: this.isFavorited },
        bubbles: true,
        composed: true,
      })
    );
  }

  _getClickHandler() {
    return this.isFavorite ? this._handleFavoriteClick : undefined;
  }

  _iconPositionAtEnd() {
    return this.iconPosition === 'end' || this.iconPosition === 'right';
  }

  _renderProgress() {
    const valueText = this.spinnerAriaValueText || 'Loading...';
    const hasLabelledBy = Boolean(this.spinnerAriaLabelledBy);
    const spinnerLabel = hasLabelledBy ? undefined : this.spinnerAriaLabel || 'Loading';
    const spinnerClass = this.isInline
      ? 'pf-v6-c-spinner pf-m-inline'
      : 'pf-v6-c-spinner pf-m-md';

    return html`
      <span class="pf-v6-c-button__progress">
        <svg
          class=${spinnerClass}
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
    const hasLabel = Boolean(this.label);
    const isIconOnly =
      this.isFavorite ||
      this.isSettings ||
      this.isHamburger ||
      (this.isCircle && !hasLabel) ||
      (Boolean(this.icon) && !hasLabel);

    if (!hasLabel && isIconOnly) {
      return '';
    }

    return this._iconPositionAtEnd() ? 'pf-m-end' : 'pf-m-start';
  }

  _renderIcon() {
    const position = this._getIconPositionClass();
    let iconContent = null;

    if (this.isFavorite) {
      iconContent = html`
        <span class="pf-v6-c-button__icon-favorite">${rhUiStarIcon}</span>
        <span class="pf-v6-c-button__icon-favorited">${rhUiStarFillIcon}</span>
      `;
    } else if (this.isSettings) {
      iconContent = rhUiSettingsFillIcon;
    } else if (this.isHamburger) {
      iconContent = hamburgerIcon;
    } else if (this.icon) {
      iconContent = getButtonIcon(this.icon);
    } else if (this.isCircle) {
      iconContent = rhUiAddCircleFillIcon;
    }

    if (!iconContent) {
      return null;
    }

    return html`
      <span class="pf-v6-c-button__icon ${position}" aria-hidden="true">
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
      <span class="pf-v6-c-button__count">
        <span class=${badgeClass}>${this.count}</span>
      </span>
    `;
  }

  _renderLabel() {
    if (this.isCircle) {
      return null;
    }

    if (this.label) {
      const srText = this.srText
        ? html` <span class="pf-v6-screen-reader">${this.srText}</span>`
        : null;

      return html`<span class="pf-v6-c-button__text">${this.label}${srText}</span>`;
    }

    if (this.variant === 'plain' && this.ariaLabel) {
      return null;
    }

    return html`<span class="pf-v6-c-button__text"><slot></slot></span>`;
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

    if (component === 'a') {
      return html`
        <a
          class=${classes}
          href=${this.href || '#'}
          aria-disabled=${ariaDisabled}
          aria-label=${ariaLabel}
          tabindex=${tabIndex}
          @click=${this._getClickHandler()}
        >
          ${content}
        </a>
      `;
    }

    if (component === 'span') {
      return html`
        <span
          class=${classes}
          role="button"
          aria-disabled=${ariaDisabled}
          aria-label=${ariaLabel}
          tabindex=${tabIndex}
          @click=${this._getClickHandler()}
        >
          ${content}
        </span>
      `;
    }

    return html`
      <button
        class=${classes}
        id=${this.buttonId || undefined}
        type=${this.buttonType || 'button'}
        ?disabled=${this.isDisabled}
        aria-disabled=${ariaDisabled}
        aria-label=${ariaLabel}
        aria-expanded=${ariaExpanded}
        tabindex=${tabIndex}
        @click=${this._getClickHandler()}
      >
        ${content}
      </button>
    `;
  }
}

customElements.define('shadow-dom-button', ShadowDomButton);
