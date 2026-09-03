import { LitElement, html } from 'lit';

const PATTERNFLY_CSS = 'node_modules/@patternfly/patternfly/patternfly.css';
const DEFAULT_LABEL = 'Shadow DOM Button';

export class ShadowDomButton extends LitElement {
  static properties = {
    label: { type: String },
  };

  render() {
    const label = this.label ?? DEFAULT_LABEL;

    // PatternFly must be loaded inside the shadow root; global CSS does not cross the boundary.
    return html`
      <link rel="stylesheet" href="${PATTERNFLY_CSS}" />
      <button class="pf-v6-c-button pf-m-primary" type="submit">
        <span class="pf-v6-c-button__text">${label}</span>
      </button>
    `;
  }
}

customElements.define('shadow-dom-button', ShadowDomButton);
