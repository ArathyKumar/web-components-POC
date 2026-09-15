/**
 * pf-button-light — PatternFly button rendered in the light DOM (no shadow root).
 *
 * LIGHT DOM REQUIREMENTS
 * ----------------------
 * 1. No encapsulation: Lit renders directly onto the host element (createRenderRoot
 *    returns this). this.shadowRoot is always null.
 * 2. Styles: Global patternfly.css MUST be loaded on the page — component CSS
 *    (.pf-v6-c-button, spinner, badge) reaches inner markup through the document
 *    cascade. adoptPatternFlyLightHostStyles() adds only scoped host overrides.
 * 3. Slots: Native <slot> does NOT work without a shadow root. Label and icon
 *    content are projected by passing host child nodes into the Lit template.
 * 4. Theming: Use attribute/selector hooks (pf-button-light [part="control"]),
 *    NOT ::part() — part attributes here are plain markup hooks, not shadow parts.
 *
 * CONTENT PROJECTION NOTE
 * -----------------------
 * After the first render, label nodes move from the host into [part="text"].
 * _getDefaultSlotNodes() checks the host first, then falls back to the rendered
 * text region so re-renders (e.g. toggling loading) preserve slotted content.
 */
import { LitElement, html, nothing } from 'lit';
import { adoptPatternFlyLightHostStyles } from '../../styles/adopted-light.js';

/** Custom element tag name for the light DOM button. */
export const ELEMENT_TAG = 'pf-button-light';

/**
 * Maps button options to PatternFly core (pf-v6-c-button) class names.
 * @see https://www.patternfly.org/components/button
 */
function getPatternFlyButtonClassNames({
  variant = 'primary',
  size = 'default',
  state = 'unread',
  className = '',
  block = false,
  disabled = false,
  ariaDisabled = false,
  loading = false,
  clicked = false,
  inline = false,
  danger = false,
  favorite = false,
  favorited = false,
  noPadding = false,
  settings = false,
  hamburger = false,
  hamburgerVariant,
  circle = false,
  docked = false,
  textExpanded = false,
} = {}) {
  const classes = ['pf-v6-c-button'];

  if (variant === 'stateful') {
    classes.push('pf-m-stateful');
    if (state === 'read') classes.push('pf-m-read');
    else if (state === 'attention') classes.push('pf-m-attention');
    else classes.push('pf-m-unread');
  } else {
    classes.push(`pf-m-${variant}`);
  }

  if (size === 'sm') classes.push('pf-m-small');
  if (size === 'lg') classes.push('pf-m-display-lg');

  if (block) classes.push('pf-m-block');
  if (disabled) classes.push('pf-m-disabled');
  if (ariaDisabled) classes.push('pf-m-aria-disabled');
  if (clicked) classes.push('pf-m-clicked');
  if (loading && variant !== 'plain') classes.push('pf-m-progress');
  if (loading) classes.push('pf-m-in-progress');
  if (inline) classes.push('pf-m-inline');
  if (danger) classes.push('pf-m-danger');
  if (favorite) classes.push('pf-m-favorite');
  if (favorite && favorited) classes.push('pf-m-favorited');
  if (settings) classes.push('pf-m-settings');
  if (hamburger) {
    classes.push('pf-m-hamburger');
    if (hamburgerVariant === 'expand') classes.push('pf-m-expand');
    if (hamburgerVariant === 'collapse') classes.push('pf-m-collapse');
  }
  if (circle) classes.push('pf-m-circle');
  if (docked) classes.push('pf-m-docked');
  if (textExpanded) classes.push('pf-m-text-expanded');
  if (noPadding) classes.push('pf-m-no-padding');

  if (className) classes.push(className);

  return classes.join(' ');
}

function pfIconSvg(pathData, viewBox = '0 0 32 32') {
  return html`
    <svg
      class="pf-v6-svg"
      fill="currentColor"
      viewBox=${viewBox}
      aria-hidden="true"
      role="img"
      width="1em"
      height="1em"
    >
      <path d=${pathData}></path>
    </svg>
  `;
}

const rhUiStarIcon = pfIconSvg(
  'M24 30c-.184 0-.368-.051-.53-.152L16 25.18l-7.47 4.668a.998.998 0 0 1-1.51-1.044l1.885-9.425-7.749-6.619a1 1 0 0 1 .557-1.756l10.245-.945 3.119-7.446a1 1 0 0 1 1.844 0l3.119 7.446 10.245.945a1 1 0 0 1 .557 1.756l-7.749 6.619 1.885 9.425a.998.998 0 0 1-.98 1.197Zm-8-7c.184 0 .368.051.53.152l6.035 3.771-1.545-7.728a1.002 1.002 0 0 1 .331-.957l6.394-5.461-8.485-.783a1 1 0 0 1-.831-.609L16 5.587l-2.429 5.798a.998.998 0 0 1-.831.609l-8.485.783 6.394 5.461c.275.235.402.602.331.957l-1.545 7.728 6.035-3.771A.993.993 0 0 1 16 23Z'
);

const rhUiStarFillIcon = pfIconSvg(
  'm30.844 12.76-7.749 6.619 1.885 9.425a.998.998 0 0 1-.98 1.197c-.184 0-.368-.051-.53-.152L16 25.181l-7.47 4.668a.998.998 0 0 1-1.51-1.044l1.885-9.425-7.749-6.62a1 1 0 0 1 .557-1.756l10.245-.945 3.119-7.446a1 1 0 0 1 1.844 0l3.119 7.446 10.245.945a1 1 0 0 1 .557 1.756Z'
);

const rhUiSettingsFillIcon = pfIconSvg(
  'M26.463 16.845a9.635 9.635 0 0 0-.002-1.688l3.41-1.974a.5.5 0 0 0 .235-.548 14.47 14.47 0 0 0-4.142-7.167.5.5 0 0 0-.594-.07l-3.404 1.97c-.469-.326-.96-.61-1.466-.85V2.58a.5.5 0 0 0-.356-.48 14.662 14.662 0 0 0-8.288 0 .5.5 0 0 0-.356.48v3.944c-.513.245-1.003.528-1.462.846L6.63 5.397a.5.5 0 0 0-.594.07 14.47 14.47 0 0 0-4.142 7.168.5.5 0 0 0 .236.548l3.407 1.972a9.635 9.635 0 0 0 .002 1.688l-3.41 1.974a.5.5 0 0 0-.235.548 14.47 14.47 0 0 0 4.142 7.167c.16.154.405.18.594.07l3.404-1.97c.469.326.96.61 1.466.85v3.938a.5.5 0 0 0 .356.48c1.333.398 2.728.6 4.144.6s2.81-.202 4.144-.6a.5.5 0 0 0 .356-.48v-3.944a10.449 10.449 0 0 0 1.462-.846l3.408 1.973a.5.5 0 0 0 .594-.07 14.47 14.47 0 0 0 4.142-7.168.5.5 0 0 0-.236-.548l-3.407-1.972ZM16 21c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5Z'
);

const rhUiAddCircleFillIcon = pfIconSvg(
  'M16 1C7.729 1 1 7.729 1 16s6.729 15 15 15 15-6.729 15-15S24.271 1 16 1Zm7 16.125h-5.875V23a1.125 1.125 0 0 1-2.25 0v-5.875H9a1.125 1.125 0 0 1 0-2.25h5.875V9a1.125 1.125 0 0 1 2.25 0v5.875H23a1.125 1.125 0 0 1 0 2.25Z'
);

const rhUiNotificationFillIcon = pfIconSvg(
  'M28.75 22v3.5c0 .689-.561 1.25-1.25 1.25h-7.521c.005.084.021.166.021.25 0 2.206-1.794 4-4 4s-4-1.794-4-4c0-.084.016-.166.021-.25H4.5c-.689 0-1.25-.561-1.25-1.25V22a.75.75 0 0 1 .75-.75c1.24 0 2.25-1.009 2.25-2.25v-4c0-4.826 3.528-8.833 8.138-9.605A2.482 2.482 0 0 1 13.5 3.5C13.5 2.122 14.621 1 16 1s2.5 1.122 2.5 2.5c0 .761-.349 1.436-.888 1.895 4.61.772 8.138 4.779 8.138 9.605v4c0 1.241 1.01 2.25 2.25 2.25a.75.75 0 0 1 .75.75Z'
);

const rhUiCopyFillIcon = pfIconSvg(
  'M28 7v22.607c0 .768-.622 1.393-1.387 1.393H10a1 1 0 1 1 0-2h16V7a1 1 0 1 1 2 0Zm-5.25 17.5v-22c0-.689-.561-1.25-1.25-1.25h-8.375v7.364c0 .833-.678 1.511-1.512 1.511H4.25V24.5c0 .689.561 1.25 1.25 1.25h16c.689 0 1.25-.561 1.25-1.25ZM10.875 1.275a.738.738 0 0 0-.405.195l-6 6a.738.738 0 0 0-.195.405h6.6v-6.6Z'
);

const rhMicronsCloseIcon = pfIconSvg(
  'M17.8 16.2 11.59 10l6.21-6.21c.42-.46.39-1.17-.07-1.59-.43-.4-1.09-.4-1.52 0l-6.2 6.2-6.22-6.19c-.44-.44-1.15-.44-1.59 0-.44.44-.44 1.15 0 1.59l6.2 6.21-6.2 6.2c-.42.46-.39 1.17.07 1.59.43.4 1.09.4 1.52 0L10 11.59l6.2 6.2c.44.44 1.15.44 1.59 0 .44-.45.44-1.16 0-1.6Z',
  '0 0 20 20'
);

const uploadIcon = pfIconSvg(
  'M296 384h-80c-13.3 0-24-10.7-24-24V192h-87.7c-17.8 0-26.7-21.5-14.1-34.1L242.3 5.7c7.5-7.5 19.8-7.5 27.3 0l152.2 152.2c12.6 12.6 3.7 34.1-14.1 34.1H320v168c0 13.3-10.7 24-24 24zm216-8v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h136v8c0 30.9 25.1 56 56 56h80c30.9 0 56-25.1 56-56v-8h136c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z',
  '0 0 512 512'
);

const hamburgerIcon = html`
  <svg
    viewBox="0 0 10 10"
    class="pf-v6-c-button--hamburger-icon pf-v6-svg"
    width="1em"
    height="1em"
    aria-hidden="true"
    role="img"
  >
    <path class="pf-v6-c-button--hamburger-icon--top" d="M1,1 L9,1"></path>
    <path class="pf-v6-c-button--hamburger-icon--middle" d="M1,5 L9,5"></path>
    <path class="pf-v6-c-button--hamburger-icon--arrow" d="M1,5 L1,5 L1,5"></path>
    <path class="pf-v6-c-button--hamburger-icon--bottom" d="M9,9 L1,9"></path>
  </svg>
`;

const buttonIconMap = {
  'add-circle': rhUiAddCircleFillIcon,
  notification: rhUiNotificationFillIcon,
  copy: rhUiCopyFillIcon,
  close: rhMicronsCloseIcon,
  upload: uploadIcon,
};

function getButtonIcon(name) {
  return buttonIconMap[name] ?? null;
}

const autoToggleConverter = {
  fromAttribute(value) {
    return value !== 'false';
  },
  toAttribute(value) {
    return value ? null : 'false';
  },
};

function isProgressCapable(button) {
  return (
    button.loading ||
    Boolean(button.spinnerAriaLabel) ||
    Boolean(button.spinnerAriaLabelledBy) ||
    Boolean(button.spinnerAriaValueText)
  );
}

function usesProgressLabels(button) {
  return Boolean(button.idleLabel || button.loadingLabel);
}

function getProgressLabelText(button) {
  if (!usesProgressLabels(button)) {
    return null;
  }

  if (button.loading) {
    return button.loadingLabel ?? button.idleLabel ?? '';
  }

  return button.idleLabel ?? button.loadingLabel ?? '';
}

function isIconOnlyProgressButton(button, hasDefaultSlotContent) {
  return isProgressCapable(button) && !usesProgressLabels(button) && !hasDefaultSlotContent;
}

function captureDefaultAriaLabel(button) {
  button._defaultAriaLabel = button.ariaLabel || button.getAttribute('aria-label') || '';
}

function syncFavoriteAriaLabel(button, favorited) {
  const favoritedLabel = button.ariaLabelFavorited;
  const unfavoritedLabel = button.ariaLabelUnfavorited ?? button._defaultAriaLabel;

  if (favoritedLabel || unfavoritedLabel) {
    button.ariaLabel = favorited
      ? (favoritedLabel || 'Unfavorite')
      : (unfavoritedLabel || 'Favorite');
    return;
  }

  button.ariaLabel = favorited ? 'Unfavorite' : 'Favorite';
}

function syncLoadingPresentation(button, loading, hasDefaultSlotContent) {
  if (!isIconOnlyProgressButton(button, hasDefaultSlotContent)) {
    return;
  }

  if (loading && (button.spinnerAriaLabel || button.spinnerAriaLabelledBy)) {
    button.ariaLabel = undefined;
  } else {
    button.ariaLabel = button._defaultAriaLabel || undefined;
  }
}

function shouldAutoToggleFavorite(button) {
  if (!button.favorite) {
    return false;
  }

  return button.autoToggleFavorite !== false;
}

function shouldAutoToggleLoading(button) {
  if (!isProgressCapable(button)) {
    return false;
  }

  return button.autoToggleLoading !== false;
}

function applyFavoriteActivation(button, dispatch) {
  if (shouldAutoToggleFavorite(button)) {
    const favorited = !button.favorited;
    button.favorited = favorited;
    dispatch('pf-favorite-change', { favorited });
    return;
  }

  if (button.favorite) {
    dispatch('pf-favorite-change', { favorited: !button.favorited });
  }
}

function applyLoadingActivation(button, dispatch) {
  if (shouldAutoToggleLoading(button)) {
    const loading = !button.loading;
    button.loading = loading;
    dispatch('pf-loading-change', { loading });
    return;
  }

  if (isProgressCapable(button)) {
    dispatch('pf-loading-change', { loading: !button.loading });
  }
}

export class PFButtonLight extends LitElement {
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
    ariaLabelFavorited: { type: String, attribute: 'aria-label-favorited' },
    ariaLabelUnfavorited: { type: String, attribute: 'aria-label-unfavorited' },
    idleLabel: { type: String, attribute: 'idle-label' },
    loadingLabel: { type: String, attribute: 'loading-label' },
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
    autoToggleFavorite: {
      attribute: 'auto-toggle-favorite',
      reflect: true,
      converter: autoToggleConverter,
    },
    autoToggleLoading: {
      attribute: 'auto-toggle-loading',
      reflect: true,
      converter: autoToggleConverter,
    },
  };

  constructor() {
    super();
    this.internals = this.attachInternals();
    this._authorDisabled = false;
    this._formDisabled = false;
  }

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    adoptPatternFlyLightHostStyles();
    super.connectedCallback();
    this._authorDisabled = this.hasAttribute('disabled');
    captureDefaultAriaLabel(this);
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
    this._formDisabled = disabled;
    this.disabled = this._authorDisabled || disabled;
  }

  formResetCallback() {
    this.loading = false;
    this.favorited = false;
    this.clicked = false;
    this.expanded = false;
  }

  firstUpdated() {
    if (this.favorite) {
      syncFavoriteAriaLabel(this, this.favorited);
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('disabled')) {
      if (this._formDisabled && !this.disabled) {
        this.disabled = true;
      } else if (!this._formDisabled) {
        this._authorDisabled = this.disabled;
      }
    }

    if (changedProperties.has('icon') && this.icon && !getButtonIcon(this.icon)) {
      console.warn(`[pf-button] Unknown icon name: "${this.icon}"`);
    }

    if (changedProperties.has('ariaLabel')) {
      const iconOnlyLoading =
        this.loading && isIconOnlyProgressButton(this, this._hasDefaultSlotContent());
      if (!iconOnlyLoading) {
        captureDefaultAriaLabel(this);
      }
    }

    if (
      this.favorite &&
      (changedProperties.has('favorited') ||
        changedProperties.has('favorite') ||
        changedProperties.has('ariaLabelFavorited') ||
        changedProperties.has('ariaLabelUnfavorited'))
    ) {
      syncFavoriteAriaLabel(this, this.favorited);
    }

    if (changedProperties.has('loading')) {
      syncLoadingPresentation(this, this.loading, this._hasDefaultSlotContent());
    }

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

  render() {
    return this._renderControl();
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

  _getProjectableChildNodes() {
    return [...this.childNodes].filter((node) => {
      return !(
        node.nodeType === Node.ELEMENT_NODE && node.getAttribute('part') === 'control'
      );
    });
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
      this.querySelector(':scope > [slot="icon"]') ||
      this._getControlElement()?.querySelector('[slot="icon"]')
    );
  }

  _getControlElement() {
    return this.querySelector('[part="control"]');
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

  _dispatchActivateEvents() {
    this._dispatchComponentEvent('pf-activate', {
      variant: this.variant || 'primary',
      type: this._getButtonType(),
    });

    const dispatch = (name, detail) => this._dispatchComponentEvent(name, detail);
    applyFavoriteActivation(this, dispatch);
    applyLoadingActivation(this, dispatch);
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

  _getHref() {
    if (this.disabled || this.ariaDisabled) {
      return undefined;
    }

    return this.href || undefined;
  }

  _iconPositionAtEnd() {
    return this.iconPosition === 'end' || this.iconPosition === 'right';
  }

  _hasDefaultSlotContent() {
    return this._getDefaultSlotNodes().length > 0;
  }

  _hasIconSlotContent() {
    return Boolean(this._getIconSlotNode());
  }

  _hasValidBuiltInIcon() {
    return Boolean(this.icon && getButtonIcon(this.icon));
  }

  _shouldRenderIcon() {
    return (
      this.favorite ||
      this.settings ||
      this.hamburger ||
      this._hasValidBuiltInIcon() ||
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
      (this._hasValidBuiltInIcon() && !hasLabel) ||
      (this._hasIconSlotContent() && !hasLabel);

    if (!hasLabel && isIconOnly) {
      return '';
    }

    return this._iconPositionAtEnd() ? 'pf-m-end' : 'pf-m-start';
  }

  _renderDefaultSlotContent() {
    const nodes = this._getDefaultSlotNodes();
    return nodes.length ? nodes : nothing;
  }

  _renderIconSlotContent() {
    const iconNode = this._getIconSlotNode();
    return iconNode ?? nothing;
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

    const progressLabel = getProgressLabelText(this);
    if (progressLabel !== null) {
      return html`<span class="pf-v6-c-button__text" part="text">${progressLabel}${srText}</span>`;
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

  _renderControl() {
    const classes = this._getClassNames();
    const content = this._renderButtonContent();
    const component = this._getTagName();
    const ariaDisabled = this._shouldRenderAriaDisabled() ? 'true' : undefined;
    const ariaLabel = this.ariaLabel || undefined;
    const tabIndex = this._getTabIndex() ?? undefined;
    const ariaExpanded = this.hamburger ? String(this.expanded ?? false) : undefined;
    const controlId = this.controlId || undefined;

    if (component === 'a') {
      return html`
        <a
          class=${classes}
          part="control"
          id=${controlId}
          href=${this._getHref()}
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
          id=${controlId}
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
        id=${controlId}
        type=${this._getButtonType()}
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

if (!customElements.get(ELEMENT_TAG)) {
  customElements.define(ELEMENT_TAG, PFButtonLight);
}
