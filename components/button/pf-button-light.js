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
 *    content are projected by passing host child nodes into the Lit template
 *    (_renderDefaultSlotContent / _renderIconSlotContent).
 * 4. Theming: Use attribute/selector hooks (pf-button-light [part="control"]),
 *    NOT ::part() — part attributes here are plain markup hooks, not shadow parts.
 *
 * DIFFERS FROM pf-button-shadow
 * -----------------------------
 * - No shadow root; markup is visible in the document tree.
 * - Relies on global PatternFly CSS instead of adopted shadow stylesheets.
 * - Manual DOM-node projection instead of <slot> elements.
 * - No exportparts attribute on the activator.
 * - Queries the activator on the host (this.querySelector), not renderRoot.
 *
 * CONTENT PROJECTION NOTE
 * -----------------------
 * After the first render, label nodes move from the host into [part="text"].
 * _getDefaultSlotNodes() checks the host first, then falls back to the rendered
 * text region so re-renders (e.g. toggling loading) preserve slotted content.
 * Avoid setting host textContent — that removes all host children and breaks
 * projection when icons or other slotted markup are present.
 */
import { LitElement, html, nothing } from 'lit';
import { getPatternFlyButtonClassNames } from './lib/class-names.js';
import {
  rhUiStarIcon,
  rhUiStarFillIcon,
  rhUiSettingsFillIcon,
  rhUiAddCircleFillIcon,
  hamburgerIcon,
  getButtonIcon,
} from './lib/icons.js';
import { adoptPatternFlyLightHostStyles } from '../../styles/adopted-light.js';
import {
  autoToggleConverter,
  getProgressLabelText,
  isIconOnlyProgressButton,
  captureDefaultAriaLabel,
  syncFavoriteAriaLabel,
  syncLoadingPresentation,
  applyFavoriteActivation,
  applyLoadingActivation,
} from './lib/state.js';

/** Custom element tag name for the light DOM button. */
export const ELEMENT_TAG = 'pf-button-light';

/**
 * PatternFly button rendered in the light DOM.
 * Requires global patternfly.css on the page.
 */
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
    autoToggleFavorite: { attribute: 'auto-toggle-favorite', reflect: true, converter: autoToggleConverter },
    autoToggleLoading: { attribute: 'auto-toggle-loading', reflect: true, converter: autoToggleConverter },
  };

  /** Attaches ElementInternals for form-associated custom element behavior. */
  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  /**
   * Light DOM: render onto the host element itself — no shadow boundary is created.
   * This is the key difference from pf-button-shadow.
   */
  createRenderRoot() {
    return this;
  }

  /**
   * Adopts scoped host overrides once per document, captures default aria-label,
   * and syncs form state. Component CSS must already be present via global patternfly.css.
   */
  connectedCallback() {
    adoptPatternFlyLightHostStyles();
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

  /** Sets initial favorite aria-label once all attributes are hydrated. */
  firstUpdated() {
    if (this.favorite) {
      syncFavoriteAriaLabel(this, this.favorited);
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

  /** Renders the light-DOM activator directly onto the host element. */
  render() {
    return this._renderControl();
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
   * Returns true when a node is label content (default slot equivalent).
   * Matches shadow DOM semantics: unslotted host children and explicit slot="".
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
   * Host children eligible for projection, excluding the rendered activator.
   * Without this filter, Lit would treat the control element as slottable content.
   */
  _getProjectableChildNodes() {
    return [...this.childNodes].filter((node) => {
      return !(
        node.nodeType === Node.ELEMENT_NODE && node.getAttribute('part') === 'control'
      );
    });
  }

  /**
   * Resolves label nodes for manual projection into [part="text"].
   * 1. Prefer fresh host children (before or between renders).
   * 2. Fall back to nodes already inside the rendered text region so re-renders
   *    (e.g. loading toggle) do not lose the label.
   */
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

  /**
   * Resolves the icon slot node from the host or from its projected location.
   * Uses :scope > for host queries to avoid matching nested descendants.
   */
  _getIconSlotNode() {
    return (
      this.querySelector(':scope > [slot="icon"]') ||
      this._getControlElement()?.querySelector('[slot="icon"]')
    );
  }

  /**
   * Returns the inner activator in the light DOM tree on the host element.
   * Do not use renderRoot here — there is no shadow root.
   */
  _getControlElement() {
    return this.querySelector('[part="control"]');
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

  /** Returns true when label nodes are available for manual projection. */
  _hasDefaultSlotContent() {
    return this._getDefaultSlotNodes().length > 0;
  }

  /** Returns true when a host child is assigned to the icon slot. */
  _hasIconSlotContent() {
    return Boolean(this._getIconSlotNode());
  }

  /**
   * Projects host label nodes into the template (replaces shadow <slot>).
   * Lit moves the returned Node references into [part="text"] on each render.
   */
  _renderDefaultSlotContent() {
    const nodes = this._getDefaultSlotNodes();
    return nodes.length ? nodes : nothing;
  }

  /**
   * Projects the icon slot node into the template (replaces shadow <slot name="icon">).
   */
  _renderIconSlotContent() {
    const iconNode = this._getIconSlotNode();
    return iconNode ?? nothing;
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

  /** Renders the icon region using builtin icons, circle default, or projected slot node. */
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
      // Manual projection: move host child with slot="icon" into the icon wrapper.
      iconContent = this._renderIconSlotContent();
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
   * Renders the label region with manually projected host nodes.
   * part="text" is a styling hook for pf-button-light [part="text"] selectors.
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

    return html`<span class="pf-v6-c-button__text" part="text">${this._renderDefaultSlotContent()}${srText}</span>`;
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
   * Renders the activator without exportparts (light DOM has no shadow boundary).
   * Style internals with: pf-button-light [part="control"] { ... }
   */
  _renderControl() {
    const classes = this._getClassNames();
    const content = this._renderButtonContent();
    const component = this._getTagName();
    const ariaDisabled = this._shouldRenderAriaDisabled() ? 'true' : undefined;
    const ariaLabel = this.ariaLabel || undefined;
    const tabIndex = this._getTabIndex() ?? undefined;
    const ariaExpanded = this.hamburger ? String(this.expanded ?? false) : undefined;

    if (component === 'a') {
      return html`
        <a
          class=${classes}
          part="control"
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
  customElements.define(ELEMENT_TAG, PFButtonLight);
}
