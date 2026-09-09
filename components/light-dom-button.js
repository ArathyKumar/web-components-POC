import { LitElement, html } from 'lit';

const DEFAULT_LABEL = 'Light DOM Button';

export class LightDomButton extends LitElement {
  static properties = {
    label: { type: String },
  };

  // Render in the light DOM so global PatternFly CSS applies.
  createRenderRoot() {
    return this;
  }

  render() {
    const label = this.label ?? DEFAULT_LABEL;

    return html`
      <button class="pf-v6-c-button pf-m-primary" type="button">
        <span class="pf-v6-c-button__text">${label}</span>
      </button>
    `;
  }
}

customElements.define('light-dom-button', LightDomButton);
