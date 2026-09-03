class ShadowDomButton extends HTMLElement {
  constructor() {
    super();
    const label = this.getAttribute('label') || 'Shadow DOM Button';
    const shadow = this.attachShadow({ mode: 'open' });

    const baseLink = document.createElement('link');
    baseLink.rel = 'stylesheet';
    baseLink.href = 'node_modules/@patternfly/patternfly/patternfly.css';

    const button = document.createElement('button');
    button.className = 'pf-v6-c-button pf-m-primary';
    button.type = 'submit';

    const text = document.createElement('span');
    text.className = 'pf-v6-c-button__text';
    text.textContent = label;

    button.appendChild(text);
    shadow.append(baseLink, button);
  }
}

customElements.define('shadow-dom-button', ShadowDomButton);
