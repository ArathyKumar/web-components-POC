/**
 * pf-badge-shadow — PatternFly badge with Shadow DOM encapsulation.
 *
 * SHADOW DOM REQUIREMENTS
 * -----------------------
 * 1. Encapsulation: Lit renders into an open shadow root (createRenderRoot).
 * 2. Styles: Full PatternFly badge CSS is adopted into the shadow root via
 *    adoptPatternFlyBadgeShadowStyles(). Global patternfly.css is still required
 *    on the page for design tokens (--pf-t--*) to resolve inside shadow.
 * 3. Slots: Native <slot> projects host children (the count/label) into shadow.
 * 4. Theming: part="badge" on the inner span enables ::part(badge) styling
 *    from outside (e.g. pf-badge-shadow::part(badge)).
 *
 * API
 * ---
 * - read (boolean)     → pf-m-read   — grey background with high-contrast border
 * - unread (boolean)   → pf-m-unread — brand color background
 * - disabled (boolean) → pf-m-disabled — disabled background/color
 * - screen-reader-text (string) — visually hidden text after the count
 *   (e.g. "Unread Messages")
 *
 * Priority: disabled > read > unread. Default (no modifier) renders the badge
 * with no background — suitable for inline use.
 *
 * @see https://www.patternfly.org/components/badge
 */
import { LitElement, html, nothing } from 'lit';
import { adoptPatternFlyBadgeShadowStyles } from './styles/adopted-shadow.js';

/** Custom element tag name for the shadow DOM badge. */
export const ELEMENT_TAG = 'pf-badge-shadow';

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

export class PFBadgeShadow extends LitElement {
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
     *   <pf-badge-shadow disabled screen-reader-text="(notifications disabled)">0</pf-badge-shadow>
     */
    disabled: { type: Boolean, reflect: true },
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

  createRenderRoot() {
    const root = super.createRenderRoot();
    // Adopt encapsulated PF badge CSS into this shadow root.
    adoptPatternFlyBadgeShadowStyles(root);
    return root;
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
      <span class=${badgeClass} part="badge">
        <slot></slot>${srText}
      </span>
    `;
  }
}

if (!customElements.get(ELEMENT_TAG)) {
  customElements.define(ELEMENT_TAG, PFBadgeShadow);
}
