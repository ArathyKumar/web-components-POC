/**
 * pf-badge-light — PatternFly badge in the light DOM (no shadow root).
 *
 * LIGHT DOM REQUIREMENTS
 * ----------------------
 * 1. No encapsulation: Lit renders directly onto the host element
 *    (createRenderRoot() returns this). this.shadowRoot is always null.
 * 2. Styles: Global patternfly.css MUST be loaded on the page —
 *    .pf-v6-c-badge and modifier classes come from the document cascade.
 *    adoptPatternFlyLightHostStyles() adds host layout overrides only.
 * 3. Content: Native <slot> does NOT work without a shadow root. Rather than
 *    juggling DOM nodes from the host into the rendered template on every
 *    update (the fragile approach), the light DOM variant uses a `count`
 *    attribute to pass the display value. This is a key authoring difference
 *    from the shadow variant, which uses a native <slot>.
 *
 *    Shadow DOM → <pf-badge-shadow unread>7</pf-badge-shadow>   (native slot)
 *    Light  DOM → <pf-badge-light  unread count="7"></pf-badge-light>  (attribute)
 *
 * 4. Theming: Set CSS custom properties on pf-badge-light or target
 *    .pf-v6-c-badge — there is no ::part() (shadow-only).
 *
 * @see https://www.patternfly.org/components/badge
 */
import { LitElement, html, nothing } from 'lit';
import { adoptPatternFlyLightHostStyles } from '../../styles/adopted-light.js';

/** Custom element tag name for the light DOM badge. */
export const ELEMENT_TAG = 'pf-badge-light';

/**
 * Maps badge options to PatternFly BEM class names.
 *
 * @param {{ read: boolean, unread: boolean, disabled: boolean, extraClass?: string }} opts
 * @returns {string}
 */
function getBadgeClassNames({ read, unread, disabled, extraClass }) {
  const classes = ['pf-v6-c-badge'];

  // disabled takes precedence over read/unread
  if (disabled) {
    classes.push('pf-m-disabled');
  } else if (read) {
    classes.push('pf-m-read');
  } else if (unread) {
    classes.push('pf-m-unread');
  }

  if (extraClass) {
    classes.push(extraClass);
  }

  return classes.join(' ');
}

export class PFBadgeLight extends LitElement {
  static properties = {
    /** Grey background with high-contrast border (pf-m-read). */
    read: { type: Boolean, reflect: true },
    /** Brand-color background (pf-m-unread). */
    unread: { type: Boolean, reflect: true },
    /**
     * Disabled appearance (pf-m-disabled). Takes precedence over read/unread.
     *
     * NOTE: The badge is a non-interactive display element — `aria-disabled` is
     * intentionally NOT applied (it has no semantic meaning on a <span>).
     * Use `screen-reader-text` to communicate the disabled state to assistive
     * technology when context alone is insufficient, e.g.:
     *   <pf-badge-light disabled count="0" screen-reader-text="(notifications disabled)"></pf-badge-light>
     */
    disabled: { type: Boolean, reflect: true },
    /**
     * The count / label displayed inside the badge.
     *
     * Light DOM uses an attribute here because native <slot> is unavailable
     * without a shadow root. The shadow variant accepts child nodes via
     * <slot> instead — notice the different authoring API.
     *
     * `reflect: true` keeps the HTML attribute in sync with the JS property,
     * so `element.count = '42'` is visible in DevTools and can be selected
     * via `[count="42"]` CSS/query selectors.
     */
    count: { type: String, reflect: true },
    /**
     * Visually hidden text appended after the count inside the badge span.
     *
     * WHY A HIDDEN SPAN INSTEAD OF aria-label?
     * Using `aria-label` on :host would *replace* the count in the accessible name,
     * so screen readers would announce only the label and skip the number. The
     * hidden <span class="pf-v6-screen-reader"> pattern follows PatternFly React's
     * `screenReaderText` prop: both the count AND the label are read in sequence
     * (e.g. "7 Unread messages").
     */
    screenReaderText: { type: String, attribute: 'screen-reader-text' },
    /**
     * Extra BEM modifier or utility class appended to pf-v6-c-badge.
     *
     * Uses the attribute `extra-class` (not `class`) to avoid colliding with
     * the DOM `.className` property that Lit manages internally.
     */
    extraClass: { type: String, attribute: 'extra-class' },
  };

  /**
   * Light DOM: render onto the host element, not a shadow root.
   * Component CSS comes from global patternfly.css on the page.
   */
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    // Adopt host layout overrides once per document.
    adoptPatternFlyLightHostStyles();
    super.connectedCallback();
  }

  render() {
    const badgeClass = getBadgeClassNames({
      read: this.read,
      unread: this.unread,
      disabled: this.disabled,
      extraClass: this.extraClass,
    });

    const srText = this.screenReaderText
      ? html`<span class="pf-v6-screen-reader">${this.screenReaderText}</span>`
      : nothing;

    return html`
      <span class=${badgeClass}>
        ${this.count ?? nothing}${srText}
      </span>
    `;
  }
}

if (!customElements.get(ELEMENT_TAG)) {
  customElements.define(ELEMENT_TAG, PFBadgeLight);
}
