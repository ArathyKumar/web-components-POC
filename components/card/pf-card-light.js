/**
 * pf-card-light — PatternFly card with Light DOM rendering.
 *
 * LIGHT DOM RENDERING
 * -------------------
 * This component renders its template directly into the host element (no shadow
 * root). There is NO encapsulation: global patternfly.css applies to the rendered
 * BEM structure directly, and external CSS can style the internals without ::part().
 *
 * KEY DIFFERENCES FROM pf-card-shadow
 * ------------------------------------
 *
 * 1. NO NATIVE SLOTS
 *    Shadow DOM provides <slot name="..."> which the browser uses to route
 *    host-children into the shadow template automatically. Light DOM has no
 *    slot mechanism — content must be discovered and projected manually.
 *
 *    This component uses a two-phase scan:
 *      Phase 1 (pre-render): `_getSlottedNodes(slotName)` scans direct children
 *        of the host for elements with slot="<name>" attribute. These are the
 *        author-provided nodes before Lit has rendered anything.
 *      Phase 2 (post-render): After Lit renders, author nodes move inside the
 *        rendered structure (e.g., into `[data-card-slot="body"]`). On the next
 *        render (property change), `_getSlottedNodes` falls back to querying the
 *        rendered wrapper to re-collect those nodes.
 *
 *    ISSUE: Because this manual scanning is synchronous within each render
 *    pass, there is no "slotchange" event system. Conditional sections (e.g.,
 *    header visibility) are computed fresh on every render — no state tracking
 *    needed. But this also means every attribute change triggers a full re-scan.
 *
 * 2. NO ::part() THEMING
 *    Light DOM elements are in the regular document, so they can be targeted
 *    directly with CSS class selectors (.pf-v6-c-card__body { ... }). The
 *    `part` attribute has no semantic meaning here and is intentionally omitted
 *    to make this difference visible in the POC.
 *
 * 3. STYLE BLEED
 *    Because there is no shadow boundary, patternfly.css affects this component
 *    automatically — no adoption mechanism needed. But this also means global
 *    overrides could accidentally affect this component's internals.
 *
 * 4. TOGGLE ICON ANIMATION
 *    Shadow DOM drives the caret rotation via :host([expanded]) in the shadow
 *    stylesheet. Light DOM uses `pf-card-light[expanded] .pf-v6-c-card__header-toggle-icon`
 *    in the global adopted-light stylesheet — the selector resolution path is
 *    different but the visual result is the same.
 *
 * 5. CREATERENDER ROOT
 *    `createRenderRoot()` returns `this` (the host element itself) instead of a
 *    shadow root. Lit renders the template as direct children of the host.
 *
 * API
 * ---
 * Authors use the same slot="..." authoring pattern as the shadow version:
 *   <pf-card-light>
 *     <h2 slot="title">My card</h2>
 *     <p  slot="body">Content</p>
 *     <div slot="footer">Footer</div>
 *   </pf-card-light>
 *
 * Attributes / Properties: identical to pf-card-shadow (see that file).
 * Events: identical to pf-card-shadow (pf-card-expand).
 *
 * @see https://www.patternfly.org/components/card
 */
import { LitElement, html, nothing } from 'lit';
import { adoptPatternFlyLightHostStyles } from '../../styles/adopted-light.js';

/** Custom element tag name for the light DOM card. */
export const ELEMENT_TAG = 'pf-card-light';

/** Event name dispatched when the expandable toggle is clicked. */
export const CARD_EXPAND_EVENT = 'pf-card-expand';

/**
 * Caret-down SVG icon for the expandable toggle button.
 * Identical markup to the shadow version — ensures visual parity.
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
 * Intentionally identical logic to the shadow version to keep the API parity
 * visible and to make the implementation differences between files more obvious.
 *
 * @param {{
 *   compact: boolean,
 *   large: boolean,
 *   fullHeight: boolean,
 *   plain: boolean,
 *   variant: string,
 *   expandable: boolean,
 *   expanded: boolean,
 *   extraClass?: string
 * }} opts
 * @returns {string}
 */
function getCardClassNames({ compact, large, fullHeight, plain, variant, expandable, expanded, extraClass }) {
  const classes = ['pf-v6-c-card'];

  if (compact)   classes.push('pf-m-compact');
  if (large)     classes.push('pf-m-display-lg');
  if (fullHeight) classes.push('pf-m-full-height');
  if (plain)     classes.push('pf-m-plain');
  if (variant === 'secondary') classes.push('pf-m-secondary');
  if (expandable) classes.push('pf-m-expandable');
  if (expandable && expanded) classes.push('pf-m-expanded');
  if (extraClass) classes.push(extraClass);

  return classes.join(' ');
}

export class PFCardLight extends LitElement {
  /**
   * LIGHT DOM: createRenderRoot returns `this`.
   *
   * Lit normally returns a ShadowRoot here. Returning the host element makes
   * Lit treat the component as a "light DOM" component — it renders its
   * template as direct children of <pf-card-light> in the document.
   *
   * Trade-offs:
   *   + Global CSS (patternfly.css) applies automatically — no adoption needed.
   *   + Rendered BEM elements are queryable from anywhere in the page.
   *   − No encapsulation — external CSS can accidentally break internals.
   *   − No native slots — content projection is manual (see _getSlottedNodes).
   *   − No ::part() theming — callers must use BEM class selectors instead.
   */
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    // Inject document-level host overrides (pf-card-light { display: block; }
    // and the toggle-caret animation CSS) once per page load.
    // This mirrors the same call in pf-badge-light and pf-button-light.
    adoptPatternFlyLightHostStyles();
    super.connectedCallback();
  }

  static properties = {
    compact:           { type: Boolean, reflect: true },
    large:             { type: Boolean, reflect: true },
    fullHeight:        { type: Boolean, attribute: 'full-height', reflect: true },
    plain:             { type: Boolean, reflect: true },
    variant:           { type: String,  reflect: true },
    expandable:        { type: Boolean, reflect: true },
    expanded:          { type: Boolean, reflect: true },
    toggleRightAligned:{ type: Boolean, attribute: 'toggle-right-aligned', reflect: true },
    actionsHasNoOffset:{ type: Boolean, attribute: 'actions-no-offset',    reflect: true },
    expandAriaLabel:   { type: String,  attribute: 'expand-aria-label' },
    extraClass:        { type: String,  attribute: 'extra-class' },
  };

  // ── Light DOM content projection helpers ──────────────────────────────────

  /**
   * Returns the author-provided child nodes that have NOT yet been moved into
   * the rendered card wrapper.
   *
   * LIGHT DOM PROJECTION PROBLEM
   * After the first render, Lit places author content inside the BEM structure
   * (e.g., a `<p slot="body">` moves into `.pf-v6-c-card__body`). On re-render
   * the author's nodes are no longer direct children of the host — they are now
   * nested inside `.pf-v6-c-card`. This method filters them out by excluding
   * the rendered card root element, leaving only true author nodes.
   *
   * @returns {Node[]}
   */
  _getProjectableChildren() {
    return [...this.childNodes].filter(node =>
      !(node.nodeType === Node.ELEMENT_NODE && node.classList?.contains('pf-v6-c-card'))
    );
  }

  /**
   * Finds nodes that were authored with `slot="<slotName>"` on the host.
   *
   * Two-phase lookup (mirrors the shadow version's slot assignment logic):
   *
   * Phase 1 — Pre-render (or after a re-author): Direct host children that
   *   carry `slot="<slotName>"` attribute. Found before Lit has had a chance
   *   to project them into the BEM structure.
   *
   * Phase 2 — Post-render fallback: Once Lit renders and those nodes move
   *   inside the rendered BEM wrapper, they are no longer direct host children.
   *   We find them via the `[data-card-slot="<slotName>"]` marker on the wrapper.
   *
   * CONTRAST WITH SHADOW DOM
   *   In shadow DOM: browser native slot assignment routes `slot="body"` to
   *     `<slot name="body">` automatically with zero application code.
   *   In light DOM: we replicate this routing manually every render cycle.
   *
   * @param {string} slotName
   * @returns {Node[]}
   */
  _getSlottedNodes(slotName) {
    // Phase 1: look for unrendered author children (pre-render or re-authored).
    const projectable = this._getProjectableChildren();
    const preRender = projectable.filter(node =>
      node.nodeType === Node.ELEMENT_NODE &&
      node.getAttribute('slot') === slotName
    );

    if (preRender.length > 0) {
      return preRender;
    }

    // Phase 2: fall back to the already-rendered wrapper.
    const wrapper = this.querySelector(`[data-card-slot="${slotName}"]`);
    if (!wrapper) return [];

    // Return all non-empty text nodes and elements from the wrapper.
    return [...wrapper.childNodes].filter(node =>
      !(node.nodeType === Node.TEXT_NODE && !node.textContent?.trim())
    );
  }

  // ── Expandable toggle ──────────────────────────────────────────────────────

  /**
   * Toggles the card's expanded state and dispatches the pf-card-expand event.
   * Identical logic to the shadow version — the API contract is the same.
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

  // ── Render ─────────────────────────────────────────────────────────────────

  render() {
    // ── BEM class computation ─────────────────────────────────────────────
    const cardClass = getCardClassNames({
      compact:    this.compact,
      large:      this.large,
      fullHeight: this.fullHeight,
      plain:      this.plain,
      variant:    this.variant,
      expandable: this.expandable,
      expanded:   this.expanded,
      extraClass: this.extraClass,
    });

    const headerClass = [
      'pf-v6-c-card__header',
      this.toggleRightAligned ? 'pf-m-toggle-right-aligned' : '',
    ].filter(Boolean).join(' ');

    const actionsClass = [
      'pf-v6-c-card__actions',
      this.actionsHasNoOffset ? 'pf-m-no-offset' : '',
    ].filter(Boolean).join(' ');

    // ── Collect projected nodes ───────────────────────────────────────────
    //
    // LIGHT DOM: We re-scan children on every render because there is no
    // slotchange event system. The scan is O(n) over host children but this is
    // negligible for card-sized content.
    //
    // SHADOW DOM contrast: the shadow version tracks slot presence via reactive
    // _has* state properties that are set by slotchange event handlers — a
    // push-based approach. Light DOM uses a pull-based approach (scan on render).

    /** @type {Node[]} Nodes for the title text area. */
    const titleNodes   = this._getSlottedNodes('title');
    /** @type {Node[]} Nodes for the subtitle area. */
    const subtitleNodes = this._getSlottedNodes('subtitle');
    /** @type {Node[]} Nodes for the header image area. */
    const headerImageNodes = this._getSlottedNodes('header-image');
    /** @type {Node[]} Nodes for the header actions area. */
    const actionsNodes  = this._getSlottedNodes('header-actions');
    /** @type {Node[]} Nodes for the main card body. */
    const bodyNodes     = this._getSlottedNodes('body');
    /** @type {Node[]} Nodes for the card footer. */
    const footerNodes   = this._getSlottedNodes('footer');
    /** @type {Node[]} Nodes for the expandable-only content area. */
    const expandableNodes = this._getSlottedNodes('expandable-content');

    // The header region is needed when the card is expandable OR has content.
    const showHeader = this.expandable
      || titleNodes.length > 0
      || subtitleNodes.length > 0
      || headerImageNodes.length > 0
      || actionsNodes.length > 0;

    return html`
      <!--
        LIGHT DOM ROOT ELEMENT
        ======================
        This div is rendered as a direct child of <pf-card-light> in the document.
        Global patternfly.css targets .pf-v6-c-card directly — no style adoption
        is needed. External CSS can reach any child element with standard class
        selectors (e.g., .pf-v6-c-card__body { ... }).

        CONTRAST WITH SHADOW DOM:
          Shadow: styles are encapsulated in the shadow root; external CSS
            cannot reach internals unless via ::part() or CSS custom properties.
          Light:  styles are NOT encapsulated; everything is open to the page.
      -->
      <div class=${cardClass}>

        <!--
          HEADER REGION
          =============
          Only rendered when there is header content or the card is expandable.
          Unlike the shadow version (which keeps wrappers with ?hidden for slot
          event routing), light DOM can safely use 'nothing' for absent sections
          because there are no slots or slotchange events to maintain.
        -->
        ${showHeader ? html`
          <div class=${headerClass}>

            <!--
              EXPANDABLE TOGGLE BUTTON
              aria-expanded reflects the current state for screen readers.
              The caret rotation is driven by CSS in styles/adopted-light.js:
                pf-card-light[expanded] .pf-v6-c-card__header-toggle-icon { transform: rotate(90deg) }
              In shadow DOM the same animation is :host([expanded]) in the
              shadow stylesheet — a different selector resolution path.
            -->
            ${this.expandable ? html`
              <button
                class="pf-v6-c-card__header-toggle"
                type="button"
                aria-expanded=${this.expanded ? 'true' : 'false'}
                aria-label=${this.expandAriaLabel || 'Toggle card'}
                @click=${this._handleExpandToggle}
              >
                <span class="pf-v6-c-card__header-toggle-icon">
                  ${cardCaretDownIcon}
                </span>
              </button>
            ` : nothing}

            <div class="pf-v6-c-card__header-main">

              <!--
                HEADER IMAGE PROJECTION
                data-card-slot="header-image" is the Phase 2 lookup key used by
                _getSlottedNodes. After first render, nodes move here; the data
                attribute lets the next render cycle find them again.

                CONTRAST WITH SHADOW DOM:
                  Shadow: <slot name="header-image"> — browser routes natively.
                  Light:  <div data-card-slot="header-image"> — manual wrapper +
                    runtime query in _getSlottedNodes().
              -->
              ${headerImageNodes.length ? html`
                <div data-card-slot="header-image">${headerImageNodes}</div>
              ` : nothing}

              <!--
                TITLE / SUBTITLE BLOCK
                Only rendered when either title or subtitle nodes exist.
              -->
              ${titleNodes.length || subtitleNodes.length ? html`
                <div class="pf-v6-c-card__title">
                  <div class="pf-v6-c-card__title-text" data-card-slot="title">
                    ${titleNodes}
                  </div>
                  ${subtitleNodes.length ? html`
                    <p class="pf-v6-c-card__subtitle" data-card-slot="subtitle">
                      ${subtitleNodes}
                    </p>
                  ` : nothing}
                </div>
              ` : nothing}
            </div>

            <!--
              HEADER ACTIONS PROJECTION
              Only rendered when action nodes are present.
            -->
            ${actionsNodes.length ? html`
              <div class=${actionsClass} data-card-slot="header-actions">
                ${actionsNodes}
              </div>
            ` : nothing}

          </div>
        ` : nothing}

        <!--
          BODY REGION
          ===========
          LIGHT DOM: We use 'nothing' when empty — no need for ?hidden because
          there is no slot event infrastructure to preserve.

          CONTRAST WITH SHADOW DOM:
            Shadow: div[?hidden=expr] + slot[@slotchange]
              — the slot element must stay in the DOM to receive slotchange events.
            Light:  Just skip the div entirely with 'nothing' when empty — simpler
              but means the rendered structure is directly coupled to child scanning.
        -->
        ${bodyNodes.length ? html`
          <div class="pf-v6-c-card__body" data-card-slot="body">
            ${bodyNodes}
          </div>
        ` : nothing}

        <!--
          EXPANDABLE CONTENT REGION
          =========================
          Only rendered when expandable=true. Collapsed via ?hidden + ?inert.

          ?inert disables interaction (keyboard focus, click) for the hidden
          region without needing to manage tabindex on every interactive child.

          CONTRAST WITH SHADOW DOM:
            Shadow: ?inert is on the wrapper; the slot's assigned nodes are in
              the host light DOM — they are automatically inert-excluded because
              the browser respects inert on the slot's shadow host wrapper.
            Light:  ?inert on the div applies directly to the subtree in the
              document — the same DOM tree, so the semantics are identical.
        -->
        ${this.expandable ? html`
          <div
            class="pf-v6-c-card__expandable-content"
            ?hidden=${!this.expanded}
            ?inert=${!this.expanded}
          >
            <div class="pf-v6-c-card__expandable-content-body" data-card-slot="expandable-content">
              ${expandableNodes}
            </div>
          </div>
        ` : nothing}

        <!--
          FOOTER REGION
          =============
        -->
        ${footerNodes.length ? html`
          <div class="pf-v6-c-card__footer" data-card-slot="footer">
            ${footerNodes}
          </div>
        ` : nothing}

      </div>
    `;
  }
}

if (!customElements.get(ELEMENT_TAG)) {
  customElements.define(ELEMENT_TAG, PFCardLight);
}
