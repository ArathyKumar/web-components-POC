/**
 * pf-card-shadow — PatternFly card with Shadow DOM encapsulation.
 *
 * SHADOW DOM REQUIREMENTS
 * -----------------------
 * 1. Encapsulation: Lit renders into an open shadow root (createRenderRoot).
 * 2. Styles: Full PatternFly card CSS is adopted into the shadow root via
 *    adoptPatternFlyCardShadowStyles(). Global patternfly.css is still required
 *    on the page for design tokens (--pf-t--*) to resolve inside the shadow.
 * 3. Slots: Named <slot> elements project host children into the shadow template:
 *      slot="title"            → card title text
 *      slot="subtitle"         → subtitle below title (optional)
 *      slot="header-image"     → image/brand in the card header (optional)
 *      slot="header-actions"   → action buttons in the card header (optional)
 *      slot="body"             → main card body
 *      slot="footer"           → card footer (optional)
 *      slot="expandable-content" → hidden content revealed on expand (requires expandable attr)
 * 4. Slot tracking: @slotchange events update _has* state properties so the
 *    wrapper <div> elements for each section are only rendered when their slot
 *    has assigned content. The undefined-as-"unknown" pattern avoids visual
 *    flash — on first render everything is shown; after slotchange events settle
 *    (within the same microtask queue) empty sections collapse.
 * 5. Theming: part attributes on structural elements allow targeted ::part()
 *    overrides from outside the shadow root without needing to pierce it:
 *      pf-card-shadow::part(card)     { ... }
 *      pf-card-shadow::part(header)   { ... }
 *      pf-card-shadow::part(body)     { ... }
 *      pf-card-shadow::part(footer)   { ... }
 *
 * API
 * ---
 * Attributes / Properties:
 *   compact (boolean)               → pf-m-compact    — reduced padding
 *   large   (boolean)               → pf-m-display-lg — large spacing
 *   full-height (boolean)           → pf-m-full-height — fills container
 *   plain   (boolean)               → pf-m-plain      — removes border/background
 *   variant ('default'|'secondary') → pf-m-secondary  — secondary background
 *   expandable (boolean)            — renders a toggle caret in the header
 *   expanded   (boolean, reflect)   — current expand state (pf-m-expanded)
 *   toggle-right-aligned (boolean)  → pf-m-toggle-right on header
 *   header-wrap (boolean)           → pf-m-wrap on header (long titles / wrapping)
 *   actions-no-offset (boolean)     → pf-m-no-offset on actions wrapper
 *   selectable (boolean)            → pf-m-selectable — whole-card selection
 *   selected   (boolean, reflect)   → pf-m-selected / input checked state
 *   disabled   (boolean, reflect)   → pf-m-disabled (selectable/clickable cards)
 *   selectable-variant ('multiple'|'single') — checkbox vs radio input
 *   selectable-name (string)        — shared name for single-select radio groups
 *   selectable-id (string)          — id for the selectable input
 *   selectable-aria-label (string)  — accessible name for the selectable input
 *   expand-aria-label (string)      — aria-label for the expand toggle button
 *   extra-class (string)            — additional BEM modifier on root element
 *
 * Events:
 *   pf-card-expand — CustomEvent dispatched on toggle click
 *     detail: { expanded: boolean }
 *   pf-card-select — CustomEvent dispatched when selectable input changes
 *     detail: { selected: boolean }
 *
 * @see https://www.patternfly.org/components/card
 */
import { LitElement, html, nothing } from 'lit';
import { adoptPatternFlyCardShadowStyles } from './styles/adopted-shadow.js';

/** Custom element tag name for the shadow DOM card. */
export const ELEMENT_TAG = 'pf-card-shadow';

/** Event name dispatched when the expandable toggle is clicked. */
export const CARD_EXPAND_EVENT = 'pf-card-expand';

/** Event name dispatched when a selectable card's input changes. */
export const CARD_SELECT_EVENT = 'pf-card-select';

let selectableIdCounter = 0;

/**
 * Returns a unique id for selectable inputs when the author omits selectable-id.
 * @returns {string}
 */
function nextSelectableId() {
  selectableIdCounter += 1;
  return `pf-card-selectable-${selectableIdCounter}`;
}

/**
 * Caret-down SVG icon used inside the expandable toggle button.
 * aria-hidden="true" because the button itself carries the accessible label.
 */
const cardCaretDownIcon = html`
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

/**
 * Builds the BEM class string for the card root element.
 *
 * @param {{
 *   compact: boolean,
 *   large: boolean,
 *   fullHeight: boolean,
 *   plain: boolean,
 *   variant: string,
 *   expandable: boolean,
 *   expanded: boolean,
 *   selectable: boolean,
 *   selected: boolean,
 *   disabled: boolean,
 *   extraClass?: string
 * }} opts
 * @returns {string}
 */
function getCardClassNames({
  compact,
  large,
  fullHeight,
  plain,
  variant,
  expandable,
  expanded,
  selectable,
  selected,
  disabled,
  extraClass,
}) {
  // Start with the PF v6 base class for the card component.
  const classes = ['pf-v6-c-card'];

  // pf-m-compact reduces padding for dense layouts (mutually exclusive with large).
  if (compact) classes.push('pf-m-compact');

  // pf-m-display-lg increases spacing for prominent cards (mutually exclusive with compact).
  if (large) classes.push('pf-m-display-lg');

  // pf-m-full-height stretches the card to fill its grid/flex container.
  if (fullHeight) classes.push('pf-m-full-height');

  // pf-m-plain strips the border and background — for inline/borderless contexts.
  if (plain) classes.push('pf-m-plain');

  // pf-m-secondary applies a secondary (muted) background color.
  if (variant === 'secondary') classes.push('pf-m-secondary');

  // pf-m-expandable marks this card as collapsible/expandable.
  if (expandable) classes.push('pf-m-expandable');

  // pf-m-expanded is present when the card is in the open state.
  if (expandable && expanded) classes.push('pf-m-expanded');

  // pf-m-selectable enables whole-card selection via the overlay label.
  if (selectable) classes.push('pf-m-selectable');

  // pf-m-selected conveys the selected visual state (also driven by :checked CSS).
  if (selectable && selected) classes.push('pf-m-selected');

  // pf-m-disabled greys out selectable/clickable cards.
  if (disabled) classes.push('pf-m-disabled');

  // Consumer can append arbitrary modifier/utility classes without subclassing.
  if (extraClass) classes.push(extraClass);

  return classes.join(' ');
}

export class PFCardShadow extends LitElement {
  static properties = {
    // ── Visual modifiers ──────────────────────────────────────────────────────

    /** Compact padding variant. Mutually exclusive with `large`. */
    compact: { type: Boolean, reflect: true },

    /** Large spacing variant. Mutually exclusive with `compact`. */
    large: { type: Boolean, reflect: true },

    /** Makes the card stretch to fill its container's height. */
    fullHeight: { type: Boolean, attribute: 'full-height', reflect: true },

    /** Removes border and background for a plain/flat appearance. */
    plain: { type: Boolean, reflect: true },

    /**
     * Background color variant.
     * 'default' (default) → normal card background.
     * 'secondary'         → muted secondary background (pf-m-secondary).
     */
    variant: { type: String, reflect: true },

    // ── Expandable behaviour ──────────────────────────────────────────────────

    /**
     * When true, renders a caret toggle button in the card header.
     * Content placed in slot="expandable-content" is hidden until the card is
     * expanded.
     */
    expandable: { type: Boolean, reflect: true },

    /**
     * Current expand state. Reflected to attribute so CSS selectors like
     *   :host([expanded]) .pf-v6-c-card__header-toggle-icon { transform: rotate(90deg) }
     * can drive the caret animation without JS.
     */
    expanded: { type: Boolean, reflect: true },

    /**
     * When true, the toggle caret is positioned on the right side of the header
     * instead of the left (pf-m-toggle-right on the header wrapper).
     */
    toggleRightAligned: { type: Boolean, attribute: 'toggle-right-aligned', reflect: true },

    /**
     * When true, applies pf-m-wrap to the header so long titles and actions can wrap.
     */
    headerWrap: { type: Boolean, attribute: 'header-wrap', reflect: true },

    /**
     * When true, applies pf-m-no-offset to the actions wrapper.
     * Useful when the header contains tall images or large titles that don't
     * need the default negative-margin alignment of actions.
     */
    actionsHasNoOffset: { type: Boolean, attribute: 'actions-no-offset', reflect: true },

    // ── Selectable behaviour ──────────────────────────────────────────────────

    /**
     * When true, renders a whole-card selectable checkbox/radio (pf-m-selectable).
     * PatternFly: avoid other interactive content inside a selectable-only card.
     */
    selectable: { type: Boolean, reflect: true },

    /**
     * Current selection state. Reflected so authors can set selected from markup
     * and so CSS/pf-m-selected stays in sync with the input's checked state.
     */
    selected: { type: Boolean, reflect: true },

    /**
     * Disables selectable/clickable interaction (pf-m-disabled + input disabled).
     */
    disabled: { type: Boolean, reflect: true },

    /**
     * 'multiple' (default) → checkbox; 'single' → radio (use selectable-name to group).
     */
    selectableVariant: { type: String, attribute: 'selectable-variant', reflect: true },

    /**
     * name attribute for the selectable input. Required for single-select radio groups
     * so only one card in the group can be selected.
     */
    selectableName: { type: String, attribute: 'selectable-name' },

    /**
     * Explicit id for the selectable input. Auto-generated when omitted.
     */
    selectableId: { type: String, attribute: 'selectable-id' },

    /**
     * Accessible name for the selectable input (aria-label). Prefer this or
     * selectable-aria-labelledby when the card title alone is not enough.
     */
    selectableAriaLabel: { type: String, attribute: 'selectable-aria-label' },

    /**
     * Space-delimited element id(s) that label the selectable input (aria-labelledby).
     */
    selectableAriaLabelledby: { type: String, attribute: 'selectable-aria-labelledby' },

    /**
     * When true, renders slot="title"/subtitle inside the header (inline with
     * images/actions). PatternFly default is title OUTSIDE the header; set this
     * for “title inline with images and actions”. Selectable cards force title
     * into the header to match PF selectable examples.
     */
    titleInHeader: { type: Boolean, attribute: 'title-in-header', reflect: true },

    /**
     * Accessible label for the expand toggle button.
     * Defaults to 'Toggle card' if omitted. Authors should provide a
     * meaningful label that identifies which card is being toggled.
     */
    expandAriaLabel: { type: String, attribute: 'expand-aria-label' },

    /**
     * Extra BEM modifier or utility class appended to pf-v6-c-card.
     * Uses attribute `extra-class` to avoid conflicting with Lit's `.className`.
     */
    extraClass: { type: String, attribute: 'extra-class' },

    // ── Internal slot-presence tracking ──────────────────────────────────────
    //
    // These use { state: true } which makes them reactive (re-render on change)
    // but does NOT reflect to attributes or expose a public API surface.
    //
    // The sentinel value is `undefined` (never set) which means "not yet known
    // — render the section by default". After the first slotchange event the
    // property is set to true/false, causing a targeted re-render.
    //
    // This approach avoids a visual flash: on first render all sections are
    // shown (undefined !== false). Slotchange events fire as microtasks before
    // the browser's first paint, so empty sections collapse before the user
    // ever sees them.

    /** Whether the "title" slot has any assigned nodes. */
    _hasTitle:         { state: true },
    /** Whether the "subtitle" slot has any assigned nodes. */
    _hasSubtitle:      { state: true },
    /** Whether the "header-image" slot has any assigned nodes. */
    _hasHeaderImage:   { state: true },
    /** Whether the "header-actions" slot has any assigned nodes. */
    _hasHeaderActions: { state: true },
    /** Whether the "body" slot has any assigned nodes. */
    _hasBody:          { state: true },
    /** Whether the "footer" slot has any assigned nodes. */
    _hasFooter:        { state: true },
  };

  createRenderRoot() {
    const root = super.createRenderRoot();
    // Adopt encapsulated PF card CSS + host overrides into this shadow root.
    adoptPatternFlyCardShadowStyles(root);
    return root;
  }

  // ── Slot tracking ──────────────────────────────────────────────────────────

  /**
   * Handles slotchange events for a named slot.
   *
   * SHADOW DOM NOTE: slotchange fires every time the browser's slot-assignment
   * algorithm runs for a slot (on first render, when children are added/removed,
   * and when slot attributes change on host children). We use the event to
   * set the corresponding _has* flag and trigger a targeted re-render.
   *
   * @param {string}  key   - The name of the state property to update (e.g. '_hasTitle').
   * @param {Event}   event - The slotchange event from the <slot> element.
   */
  _onSlotChange(key, event) {
    // assignedNodes({ flatten: true }) resolves any nested <slot> elements
    // (re-slotting), returning only the leaf nodes the user actually provided.
    const hasContent = event.target.assignedNodes({ flatten: true }).length > 0;
    this[key] = hasContent;
  }

  /**
   * Synchronously corrects all _has* slot-presence flags on first render.
   *
   * WHY THIS IS NEEDED
   * ------------------
   * _has* properties start as `undefined`. On the first render, `undefined !== false`
   * evaluates to `true`, so all optional sections (subtitle, header-image, etc.) are
   * rendered even when empty. This causes incorrect height/layout before slotchange
   * arrives.
   *
   * TIMING
   * ------
   * The browser assigns host children to shadow slots SYNCHRONOUSLY during DOM
   * insertion. By the time `firstUpdated()` runs:
   *   - Slot assignment is already done — `slot.assignedNodes()` returns correct data.
   *   - `slotchange` events have NOT yet fired (they are microtasks queued AFTER).
   *
   * So we can call `slot.assignedNodes()` here to get the true initial state and
   * correct any false-positives before the browser's first paint. The re-render
   * triggered by setting _has* properties is still a microtask and completes before
   * the browser paints, so there is no visual flash.
   *
   * Subsequent slot changes are handled by the @slotchange handlers.
   */
  firstUpdated() {
    const slotMap = [
      ['_hasTitle',         'title'],
      ['_hasSubtitle',      'subtitle'],
      ['_hasHeaderImage',   'header-image'],
      ['_hasHeaderActions', 'header-actions'],
      ['_hasBody',          'body'],
      ['_hasFooter',        'footer'],
    ];

    for (const [key, slotName] of slotMap) {
      // Find the slot by its name attribute. It may be in any position in the
      // shadow root regardless of which branch of the conditional rendered it.
      const slot = this.renderRoot.querySelector(`slot[name="${slotName}"]`);
      if (!slot) continue;

      const hasContent = slot.assignedNodes({ flatten: true }).length > 0;
      // Only write when the value actually changes — avoids a redundant re-render
      // on elements that already have the correct state.
      if (this[key] !== hasContent) {
        this[key] = hasContent;
      }
    }
  }

  // ── Expandable toggle ──────────────────────────────────────────────────────

  /**
   * Toggles the card's expanded state and dispatches the pf-card-expand event.
   *
   * The event is composed + bubbles so parent components can listen without
   * knowing the exact slot depth. detail.expanded reflects the NEW state.
   */
  _handleExpandToggle() {
    const nextExpanded = !this.expanded;
    this.expanded = nextExpanded;

    this.dispatchEvent(
      new CustomEvent(CARD_EXPAND_EVENT, {
        bubbles: true,
        composed: true,
        detail: { expanded: nextExpanded },
      })
    );
  }

  /**
   * Syncs selected state from the selectable input and dispatches pf-card-select.
   * @param {Event} event
   */
  _handleSelectableChange(event) {
    const input = /** @type {HTMLInputElement} */ (event.target);
    this.selected = input.checked;

    this.dispatchEvent(
      new CustomEvent(CARD_SELECT_EVENT, {
        bubbles: true,
        composed: true,
        detail: { selected: input.checked },
      })
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  render() {
    // ── BEM class computation ──────────────────────────────────────────────
    const cardClass = getCardClassNames({
      compact:    this.compact,
      large:      this.large,
      fullHeight: this.fullHeight,
      plain:      this.plain,
      variant:    this.variant,
      expandable: this.expandable,
      expanded:   this.expanded,
      selectable: this.selectable,
      selected:   this.selected,
      disabled:   this.disabled,
      extraClass: this.extraClass,
    });

    const headerClass = [
      'pf-v6-c-card__header',
      this.toggleRightAligned ? 'pf-m-toggle-right' : '',
      this.headerWrap ? 'pf-m-wrap' : '',
    ].filter(Boolean).join(' ');

    // Selectable cards use pf-m-no-offset on actions (matches PatternFly examples).
    const actionsClass = [
      'pf-v6-c-card__actions',
      (this.actionsHasNoOffset || this.selectable) ? 'pf-m-no-offset' : '',
    ].filter(Boolean).join(' ');

    // ── Slot visibility logic ──────────────────────────────────────────────
    //
    // `undefined !== false` is true — so sections default to visible on first
    // render before slotchange events arrive, then collapse if confirmed empty.

    /** @type {boolean} Whether the title section should render. */
    const showTitle         = this._hasTitle         !== false;
    /** @type {boolean} Whether the subtitle section should render. */
    const showSubtitle      = this._hasSubtitle      !== false;
    /** @type {boolean} Whether the header image section should render. */
    const showHeaderImage   = this._hasHeaderImage   !== false;
    /** @type {boolean} Whether the header actions section should render. */
    const showHeaderActions = this._hasHeaderActions !== false;

    const showActions = this.selectable || showHeaderActions;

    // PatternFly composition:
    // - Selectable / basic expandable → title inside header (inline with caret)
    // - Expandable with header image → image alone in header-main (title omitted or outside)
    // - Brand + actions (non-expandable) → title outside header by default
    const hasHeaderImage = this._hasHeaderImage === true;
    const titleInHeader =
      this.titleInHeader ||
      this.selectable ||
      (this.expandable && !hasHeaderImage);
    const showTitleBlock = showTitle || showSubtitle;

    const showHeader = this.expandable
      || this.selectable
      || showHeaderImage
      || showHeaderActions
      || (titleInHeader && showTitleBlock);

    const showHeaderMain = hasHeaderImage || (titleInHeader && showTitleBlock);

    // Only omit empty body/footer for expandable cards — empty wrappers as
    // siblings of the header break :last-child padding while collapsed.
    const showBody = this.expandable ? this._hasBody === true : this._hasBody !== false;
    const showFooter = this.expandable ? this._hasFooter === true : this._hasFooter !== false;

    const titleBlock = showTitleBlock ? html`
      <div class="pf-v6-c-card__title" part="title">
        <div class="pf-v6-c-card__title-text">
          <slot
            name="title"
            @slotchange=${(e) => this._onSlotChange('_hasTitle', e)}
          ></slot>
        </div>
        ${showSubtitle ? html`
          <p class="pf-v6-c-card__subtitle" part="subtitle">
            <slot
              name="subtitle"
              @slotchange=${(e) => this._onSlotChange('_hasSubtitle', e)}
            ></slot>
          </p>
        ` : html`
          <slot
            name="subtitle"
            hidden
            @slotchange=${(e) => this._onSlotChange('_hasSubtitle', e)}
          ></slot>
        `}
      </div>
    ` : html`
      <slot name="title"    hidden @slotchange=${(e) => this._onSlotChange('_hasTitle',    e)}></slot>
      <slot name="subtitle" hidden @slotchange=${(e) => this._onSlotChange('_hasSubtitle', e)}></slot>
    `;

    const isSingleSelect = this.selectableVariant === 'single';
    const inputId = this.selectableId || this._autoSelectableId || (this._autoSelectableId = nextSelectableId());
    const inputName = this.selectableName || inputId;
    const inputType = isSingleSelect ? 'radio' : 'checkbox';
    const controlClass = isSingleSelect ? 'pf-v6-c-radio pf-m-standalone' : 'pf-v6-c-check pf-m-standalone';
    const inputClass = isSingleSelect ? 'pf-v6-c-radio__input' : 'pf-v6-c-check__input';
    const labelClass = [
      isSingleSelect ? 'pf-v6-c-radio__label' : 'pf-v6-c-check__label',
      this.disabled ? 'pf-m-disabled' : '',
    ].filter(Boolean).join(' ');

    return html`
      <!--
        Root card element.
        part="card" allows: pf-card-shadow::part(card) { background: ... }
      -->
      <div class=${cardClass} part="card">

        <!--
          HEADER REGION
          Only mount when needed. A [hidden] header still counts as :first-child
          and steals padding-block-start from title/body (light DOM uses nothing).
        -->
        ${showHeader ? html`
          <div class=${headerClass} part="header">

            ${this.expandable ? html`
              <div class="pf-v6-c-card__header-toggle">
                <button
                  class="pf-v6-c-button pf-m-plain"
                  type="button"
                  aria-expanded=${this.expanded ? 'true' : 'false'}
                  aria-label=${this.expandAriaLabel || 'Toggle card'}
                  @click=${this._handleExpandToggle}
                >
                  <span class="pf-v6-c-button__icon">
                    <span class="pf-v6-c-card__header-toggle-icon">
                      ${cardCaretDownIcon}
                    </span>
                  </span>
                </button>
              </div>
            ` : nothing}

            ${showActions ? html`
              <div class=${actionsClass} part="actions">
                ${this.selectable ? html`
                  <div class="pf-v6-c-card__selectable-actions" part="selectable-actions">
                    <div class=${controlClass}>
                      <input
                        class=${inputClass}
                        type=${inputType}
                        id=${inputId}
                        name=${inputName}
                        .checked=${!!this.selected}
                        ?disabled=${this.disabled}
                        aria-label=${this.selectableAriaLabel || nothing}
                        aria-labelledby=${this.selectableAriaLabelledby || nothing}
                        @change=${this._handleSelectableChange}
                      />
                      <label class=${labelClass} for=${inputId}></label>
                    </div>
                  </div>
                ` : nothing}
                <slot
                  name="header-actions"
                  @slotchange=${(e) => this._onSlotChange('_hasHeaderActions', e)}
                ></slot>
              </div>
            ` : html`
              <slot
                name="header-actions"
                hidden
                @slotchange=${(e) => this._onSlotChange('_hasHeaderActions', e)}
              ></slot>
            `}

            ${showHeaderMain ? html`
              <div class="pf-v6-c-card__header-main" part="header-main">
                <slot
                  name="header-image"
                  @slotchange=${(e) => this._onSlotChange('_hasHeaderImage', e)}
                ></slot>
                ${titleInHeader ? titleBlock : nothing}
              </div>
            ` : html`
              <slot
                name="header-image"
                hidden
                @slotchange=${(e) => this._onSlotChange('_hasHeaderImage', e)}
              ></slot>
            `}

            ${!showBody ? html`
              <slot name="body" hidden @slotchange=${(e) => this._onSlotChange('_hasBody', e)}></slot>
            ` : nothing}
            ${this.expandable && !this.expanded ? html`
              <slot name="expandable-content" hidden></slot>
            ` : nothing}
            ${!showFooter ? html`
              <slot name="footer" hidden @slotchange=${(e) => this._onSlotChange('_hasFooter', e)}></slot>
            ` : nothing}
            ${!titleInHeader && !showTitleBlock ? html`
              <slot name="title" hidden @slotchange=${(e) => this._onSlotChange('_hasTitle', e)}></slot>
              <slot name="subtitle" hidden @slotchange=${(e) => this._onSlotChange('_hasSubtitle', e)}></slot>
            ` : nothing}
          </div>
        ` : nothing}

        ${!titleInHeader && showTitleBlock ? titleBlock : nothing}

        ${showBody ? html`
          <div class="pf-v6-c-card__body" part="body">
            <slot
              name="body"
              @slotchange=${(e) => this._onSlotChange('_hasBody', e)}
            ></slot>
          </div>
        ` : nothing}

        ${this.expandable && this.expanded ? html`
          <div class="pf-v6-c-card__expandable-content" part="expandable-content">
            <div class="pf-v6-c-card__body">
              <slot name="expandable-content"></slot>
            </div>
          </div>
        ` : nothing}

        ${showFooter ? html`
          <div class="pf-v6-c-card__footer" part="footer">
            <slot
              name="footer"
              @slotchange=${(e) => this._onSlotChange('_hasFooter', e)}
            ></slot>
          </div>
        ` : nothing}

        <!--
          Tracking slots when there is no header. Placed AFTER visible sections so
          they never become :first-child (which would steal top padding).
        -->
        ${!showHeader ? html`
          <slot name="header-image" hidden @slotchange=${(e) => this._onSlotChange('_hasHeaderImage', e)}></slot>
          <slot name="header-actions" hidden @slotchange=${(e) => this._onSlotChange('_hasHeaderActions', e)}></slot>
          ${!showBody ? html`
            <slot name="body" hidden @slotchange=${(e) => this._onSlotChange('_hasBody', e)}></slot>
          ` : nothing}
          ${!showFooter ? html`
            <slot name="footer" hidden @slotchange=${(e) => this._onSlotChange('_hasFooter', e)}></slot>
          ` : nothing}
          ${!titleInHeader && !showTitleBlock ? html`
            <slot name="title" hidden @slotchange=${(e) => this._onSlotChange('_hasTitle', e)}></slot>
            <slot name="subtitle" hidden @slotchange=${(e) => this._onSlotChange('_hasSubtitle', e)}></slot>
          ` : nothing}
        ` : nothing}

      </div>
    `;
  }
}

if (!customElements.get(ELEMENT_TAG)) {
  customElements.define(ELEMENT_TAG, PFCardShadow);
}
