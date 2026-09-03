class LightDomButton extends HTMLElement {
  connectedCallback() {
    const label = this.getAttribute('label') || 'Light DOM Button';

    const button = document.createElement('button');
    button.className = 'pf-v6-c-button pf-m-primary';
    button.type = 'submit';

    const text = document.createElement('span');
    text.className = 'pf-v6-c-button__text';
    text.textContent = label;

    button.appendChild(text);
    this.replaceChildren(button);
  }
}

customElements.define('light-dom-button', LightDomButton);
