/**
 * pf-button-shadow — PatternFly button with Shadow DOM encapsulation.
 *
 * SHADOW DOM REQUIREMENTS
 * -----------------------
 * 1. Encapsulation: Lit renders into an open shadow root (createRenderRoot).
 * 2. Styles: Full button/spinner/badge CSS is adopted into the shadow root via
 *    adoptPatternFlyShadowStyles(). Global patternfly.css is still required on
 *    the page for design tokens (--pf-t--* variables) to resolve inside shadow.
 * 3. Slots: Native <slot> elements project host children into the shadow tree.
 *    Label content goes in the default slot; icons use slot="icon".
 * 4. Theming: exportparts on the activator exposes internal parts for ::part()
 *    styling from outside the component (e.g. pf-button-shadow::part(control)).
 *
 * DIFFERS FROM pf-button-light
 * ----------------------------
 * - Uses a shadow root (this.shadowRoot exists).
 * - Does NOT rely on global component CSS reaching inner markup.
 * - Uses <slot> instead of manual DOM-node projection.
 * - Supports exportparts; light DOM does not.
 * - Queries the activator via this.renderRoot (inside shadow boundary).
 */
import { LitElement, html, nothing } from 'lit';
import { getPatternFlyButtonClassNames } from './pf-button/pf-button-class-names.js';
import {
  rhUiStarIcon,
  rhUiStarFillIcon,
  rhUiSettingsFillIcon,
  rhUiAddCircleFillIcon,
  hamburgerIcon,
  getButtonIcon,
} from './pf-button/pf-button-icons.js';
import { adoptPatternFlyShadowStyles } from '../styles/pf-adopted-styles-shadow.js';
import {
  autoToggleConverter,
  getProgressLabelText,
  isIconOnlyProgressButton,
  captureDefaultAriaLabel,
  syncFavoriteAriaLabel,
  syncLoadingPresentation,
  applyFavoriteActivation,
  applyLoadingActivation,
} from './pf-button/pf-button-state.js';

/** Custom element tag name for the shadow DOM button. */
export const ELEMENT_TAG = 'pf-button-shadow';

/**
 * Re-exported on the activator so consumers can style internals with ::part().
 * Only meaningful inside a shadow root — ignored in light DOM components.
 */
const EXPORT_PARTS =
  'control, icon, icon-favorite, icon-favorited, text, sr-text, progress, spinner, count, badge';

/**
 * PatternFly button rendered inside a shadow root with encapsulated styles.
 */
export class PFButtonShadow extends LitElement {
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
    autoToggleFavorite: { attribute: 'auto-toggle-favorite', reflect: true, converter: autoToggleConverter },
    autoToggleLoading: { attribute: 'auto-toggle-loading', reflect: true, converter: autoToggleConverter },
  };

  /** Attaches ElementInternals for form-associated custom element behavior. */
  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  /**
   * Creates the shadow root and adopts encapsulated PatternFly CSS into it.
   * Component styles live here; design tokens still come from the document.
   */
  createRenderRoot() {
    const root = super.createRenderRoot();
    adoptPatternFlyShadowStyles(root);
    return root;
  }

  /** Captures default aria-label and syncs initial form/favorite presentation. */
  connectedCallback() {
    super.connectedCallback();
    captureDefaultAriaLabel(this);
    this._syncFormDisabledState();
    this._syncFormValue();
  }

  /** Delegates focus to the inner activator element. */
  focus(options) {
    this._getControlElement()?.focus(options);
  }

  /** Delegates blur to the inner activator element. */
  blur() {
    this._getControlElement()?.blur();
  }

  /** FACE lifecycle: mirrors the associated form's disabled state onto the host. */
  formDisabledCallback(disabled) {
    this.disabled = disabled;
  }

  /** FACE lifecycle: resets stateful properties and restores aria/label presentation. */
  formResetCallback() {
    this.loading = false;
    this.favorited = false;
    this.clicked = false;
    this.expanded = false;
  }

  /** Sets initial favorite aria-label and binds settings/hamburger hover handlers. */
  firstUpdated() {
    if (this.favorite) {
      syncFavoriteAriaLabel(this, this.favorited);
    }

    if (this.settings || this.hamburger) {
      this._bindIconHoverHandlers();
    }
  }

  /** Syncs presentation when properties change externally or after internal toggles. */
  updated(changedProperties) {
    if (changedProperties.has('ariaLabel')) {
      const iconOnlyLoading = this.loading && isIconOnlyProgressButton(this, this._hasDefaultSlotContent());
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

  /** Renders the shadow-DOM activator with exportparts for ::part() theming. */
  render() {
    return this._renderControl(EXPORT_PARTS);
  }

  /** Mirrors disabled/aria-disabled state to ElementInternals for form association. */
  _syncFormDisabledState() {
    const disabled = this.disabled || this.ariaDisabled;
    this.internals.ariaDisabled = disabled;
  }

  /** Updates the form value exposed via ElementInternals when name/value change. */
  _syncFormValue() {
    if (this.name) {
      this.internals.setFormValue(this.value ?? '');
      return;
    }

    this.internals.setFormValue(null);
  }

  /**
   * Returns true when a host child belongs in the default (label) slot.
   * Slotted children remain in the light DOM tree on the host element;
   * the shadow <slot> projects them visually into the button text area.
   */
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

  /**
   * Finds a host child assigned to the icon slot.
   * Must query the host (this), not the shadow root — slotted nodes stay on the host.
   */
  _getIconSlotNode() {
    return this.querySelector(':scope > [slot="icon"]');
  }

  /**
   * Returns the inner activator inside the shadow root.
   * Always use renderRoot here; the control is not a direct child of the host.
   */
  _getControlElement() {
    return this.renderRoot?.querySelector('[part="control"]');
  }

  /**
   * Toggles pf-m-shadow-hover on the activator for settings/hamburger icon
   * animations when :hover/:focus inside adopted shadow styles is unreliable.
   */
  _bindIconHoverHandlers() {
    const control = this._getControlElement();
    if (!control || control.dataset.pfIconHoverBound === 'true') {
      return;
    }

    const activate = () => control.classList.add('pf-m-shadow-hover');
    const deactivate = () => control.classList.remove('pf-m-shadow-hover');

    control.addEventListener('pointerenter', activate);
    control.addEventListener('pointerleave', deactivate);
    control.addEventListener('focus', activate);
    control.addEventListener('blur', deactivate);
    control.dataset.pfIconHoverBound = 'true';
  }

  /** Re-triggers the pf-m-favorited CSS animation by toggling the class in one frame. */
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

  /** Resolves the associated form via ElementInternals or the form attribute. */
  _getAssociatedForm() {
    if (this.internals.form) {
      return this.internals.form;
    }

    if (this.form) {
      return document.getElementById(this.form);
    }

    return null;
  }

  /** Dispatches a SubmitEvent with this element as the submitter. */
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

  /** Resets the associated form, which triggers formResetCallback on participants. */
  _resetForm() {
    const form = this._getAssociatedForm();
    form?.reset();
  }

  /** Dispatches a bubbling, composed CustomEvent from the host. */
  _dispatchComponentEvent(name, detail) {
    this.dispatchEvent(
      new CustomEvent(name, {
        detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  /** Dispatches pf-activate and applies favorite/loading state toggles on click. */
  _dispatchActivateEvents() {
    this._dispatchComponentEvent('pf-activate', {
      variant: this.variant || 'primary',
      type: this._getButtonType(),
    });

    const dispatch = (name, detail) => this._dispatchComponentEvent(name, detail);
    applyFavoriteActivation(this, dispatch);
    applyLoadingActivation(this, dispatch);
  }

  /** Builds the PatternFly BEM class list from current component properties. */
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

  /** Returns the activator element name: button, a, or span. */
  _getTagName() {
    return this.as || 'button';
  }

  /** Returns the native button type: button, submit, or reset. */
  _getButtonType() {
    return this.type || 'button';
  }

  /** Returns true when aria-disabled should be set on the activator. */
  _shouldRenderAriaDisabled() {
    const tag = this._getTagName();
    return this.ariaDisabled || (tag !== 'button' && this.disabled);
  }

  /** Computes tabindex for link/span activators and disabled states. */
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

  /** Returns true when the icon should render after the label text. */
  _iconPositionAtEnd() {
    return this.iconPosition === 'end' || this.iconPosition === 'right';
  }

  /**
   * Checks host children for default-slot content before render.
   * In shadow DOM, assigned nodes stay on the host until the <slot> displays them.
   */
  _hasDefaultSlotContent() {
    return [...this.childNodes].some((node) => this._isDefaultSlotNode(node));
  }

  /** Returns true when a host child is assigned to the icon slot. */
  _hasIconSlotContent() {
    return Boolean(this._getIconSlotNode());
  }

  /** Returns true when any icon source (builtin, slot, or variant flag) is present. */
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

  /** Renders the in-button progress spinner with accessible spinner attributes. */
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

  /** Returns pf-m-start/pf-m-end for labeled buttons, or empty for icon-only. */
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

  /** Renders the icon region using builtin icons, circle default, or the icon slot. */
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
      // Native slot: host child with slot="icon" is projected here automatically.
      iconContent = html`<slot name="icon"></slot>`;
    }

    return html`
      <span class="pf-v6-c-button__icon ${position}" part="icon" aria-hidden="true">
        ${iconContent}
      </span>
    `;
  }

  /** Renders the optional unread/read count badge beside the label. */
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

  /**
   * Renders the label region with a native default <slot>.
   * Host text/elements without a slot attribute are projected into this slot.
   */
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

    return html`<span class="pf-v6-c-button__text" part="text"><slot></slot>${srText}</span>`;
  }

  /** Assembles progress, icon, label, and count in the correct visual order. */
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

  /** Maps Enter/Space to click for span-based inline link buttons. */
  _handleSpanKeydown(event) {
    if (this._getTagName() !== 'span') {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.currentTarget.click();
    }
  }

  /** Handles activator click: form submit/reset, guards disabled, fires state events. */
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

  /**
   * Renders the activator with exportparts so external CSS can target internals.
   * @param {string} exportParts Comma-separated part names for ::part() theming.
   */
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
  customElements.define(ELEMENT_TAG, PFButtonShadow);
}
