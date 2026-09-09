import { html } from 'lit';

/**
 * PatternFly button icon SVGs matching @patternfly/react-core Button examples.
 * @see https://github.com/patternfly/patternfly-react/tree/main/packages/react-core/src/components/Button
 */

/**
 * Creates a Lit SVG template for a PatternFly icon.
 * @param {string} pathData SVG path d attribute.
 * @param {string} [viewBox='0 0 32 32'] SVG viewBox.
 * @returns {import('lit').TemplateResult}
 */
function pfIconSvg(pathData, viewBox = '0 0 32 32') {
  return html`
    <svg
      class="pf-v6-svg"
      fill="currentColor"
      viewBox=${viewBox}
      aria-hidden="true"
      role="img"
      width="1em"
      height="1em"
    >
      <path d=${pathData}></path>
    </svg>
  `;
}

export const rhUiStarIcon = pfIconSvg(
  'M24 30c-.184 0-.368-.051-.53-.152L16 25.18l-7.47 4.668a.998.998 0 0 1-1.51-1.044l1.885-9.425-7.749-6.619a1 1 0 0 1 .557-1.756l10.245-.945 3.119-7.446a1 1 0 0 1 1.844 0l3.119 7.446 10.245.945a1 1 0 0 1 .557 1.756l-7.749 6.619 1.885 9.425a.998.998 0 0 1-.98 1.197Zm-8-7c.184 0 .368.051.53.152l6.035 3.771-1.545-7.728a1.002 1.002 0 0 1 .331-.957l6.394-5.461-8.485-.783a1 1 0 0 1-.831-.609L16 5.587l-2.429 5.798a.998.998 0 0 1-.831.609l-8.485.783 6.394 5.461c.275.235.402.602.331.957l-1.545 7.728 6.035-3.771A.993.993 0 0 1 16 23Z'
);

export const rhUiStarFillIcon = pfIconSvg(
  'm30.844 12.76-7.749 6.619 1.885 9.425a.998.998 0 0 1-.98 1.197c-.184 0-.368-.051-.53-.152L16 25.181l-7.47 4.668a.998.998 0 0 1-1.51-1.044l1.885-9.425-7.749-6.62a1 1 0 0 1 .557-1.756l10.245-.945 3.119-7.446a1 1 0 0 1 1.844 0l3.119 7.446 10.245.945a1 1 0 0 1 .557 1.756Z'
);

export const rhUiSettingsFillIcon = pfIconSvg(
  'M26.463 16.845a9.635 9.635 0 0 0-.002-1.688l3.41-1.974a.5.5 0 0 0 .235-.548 14.47 14.47 0 0 0-4.142-7.167.5.5 0 0 0-.594-.07l-3.404 1.97c-.469-.326-.96-.61-1.466-.85V2.58a.5.5 0 0 0-.356-.48 14.662 14.662 0 0 0-8.288 0 .5.5 0 0 0-.356.48v3.944c-.513.245-1.003.528-1.462.846L6.63 5.397a.5.5 0 0 0-.594.07 14.47 14.47 0 0 0-4.142 7.168.5.5 0 0 0 .236.548l3.407 1.972a9.635 9.635 0 0 0 .002 1.688l-3.41 1.974a.5.5 0 0 0-.235.548 14.47 14.47 0 0 0 4.142 7.167c.16.154.405.18.594.07l3.404-1.97c.469.326.96.61 1.466.85v3.938a.5.5 0 0 0 .356.48c1.333.398 2.728.6 4.144.6s2.81-.202 4.144-.6a.5.5 0 0 0 .356-.48v-3.944a10.449 10.449 0 0 0 1.462-.846l3.408 1.973a.5.5 0 0 0 .594-.07 14.47 14.47 0 0 0 4.142-7.168.5.5 0 0 0-.236-.548l-3.407-1.972ZM16 21c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5Z'
);

export const rhUiAddCircleFillIcon = pfIconSvg(
  'M16 1C7.729 1 1 7.729 1 16s6.729 15 15 15 15-6.729 15-15S24.271 1 16 1Zm7 16.125h-5.875V23a1.125 1.125 0 0 1-2.25 0v-5.875H9a1.125 1.125 0 0 1 0-2.25h5.875V9a1.125 1.125 0 0 1 2.25 0v5.875H23a1.125 1.125 0 0 1 0 2.25Z'
);

export const rhUiNotificationFillIcon = pfIconSvg(
  'M28.75 22v3.5c0 .689-.561 1.25-1.25 1.25h-7.521c.005.084.021.166.021.25 0 2.206-1.794 4-4 4s-4-1.794-4-4c0-.084.016-.166.021-.25H4.5c-.689 0-1.25-.561-1.25-1.25V22a.75.75 0 0 1 .75-.75c1.24 0 2.25-1.009 2.25-2.25v-4c0-4.826 3.528-8.833 8.138-9.605A2.482 2.482 0 0 1 13.5 3.5C13.5 2.122 14.621 1 16 1s2.5 1.122 2.5 2.5c0 .761-.349 1.436-.888 1.895 4.61.772 8.138 4.779 8.138 9.605v4c0 1.241 1.01 2.25 2.25 2.25a.75.75 0 0 1 .75.75Z'
);

export const rhUiCopyFillIcon = pfIconSvg(
  'M28 7v22.607c0 .768-.622 1.393-1.387 1.393H10a1 1 0 1 1 0-2h16V7a1 1 0 1 1 2 0Zm-5.25 17.5v-22c0-.689-.561-1.25-1.25-1.25h-8.375v7.364c0 .833-.678 1.511-1.512 1.511H4.25V24.5c0 .689.561 1.25 1.25 1.25h16c.689 0 1.25-.561 1.25-1.25ZM10.875 1.275a.738.738 0 0 0-.405.195l-6 6a.738.738 0 0 0-.195.405h6.6v-6.6Z'
);

export const rhMicronsCloseIcon = pfIconSvg(
  'M17.8 16.2 11.59 10l6.21-6.21c.42-.46.39-1.17-.07-1.59-.43-.4-1.09-.4-1.52 0l-6.2 6.2-6.22-6.19c-.44-.44-1.15-.44-1.59 0-.44.44-.44 1.15 0 1.59l6.2 6.21-6.2 6.2c-.42.46-.39 1.17.07 1.59.43.4 1.09.4 1.52 0L10 11.59l6.2 6.2c.44.44 1.15.44 1.59 0 .44-.45.44-1.16 0-1.6Z',
  '0 0 20 20'
);

export const uploadIcon = pfIconSvg(
  'M296 384h-80c-13.3 0-24-10.7-24-24V192h-87.7c-17.8 0-26.7-21.5-14.1-34.1L242.3 5.7c7.5-7.5 19.8-7.5 27.3 0l152.2 152.2c12.6 12.6 3.7 34.1-14.1 34.1H320v168c0 13.3-10.7 24-24 24zm216-8v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h136v8c0 30.9 25.1 56 56 56h80c30.9 0 56-25.1 56-56v-8h136c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z',
  '0 0 512 512'
);

/** Hamburger icon with animated paths (pf-m-expand / pf-m-collapse on the button). */
export const hamburgerIcon = html`
  <svg
    viewBox="0 0 10 10"
    class="pf-v6-c-button--hamburger-icon pf-v6-svg"
    width="1em"
    height="1em"
    aria-hidden="true"
    role="img"
  >
    <path class="pf-v6-c-button--hamburger-icon--top" d="M1,1 L9,1"></path>
    <path class="pf-v6-c-button--hamburger-icon--middle" d="M1,5 L9,5"></path>
    <path class="pf-v6-c-button--hamburger-icon--arrow" d="M1,5 L1,5 L1,5"></path>
    <path class="pf-v6-c-button--hamburger-icon--bottom" d="M9,9 L1,9"></path>
  </svg>
`;

const buttonIconMap = {
  'add-circle': rhUiAddCircleFillIcon,
  notification: rhUiNotificationFillIcon,
  copy: rhUiCopyFillIcon,
  close: rhMicronsCloseIcon,
  upload: uploadIcon,
};

/**
 * Returns a built-in icon template by name.
 * @param {string} name Icon key (e.g. 'notification', 'upload').
 * @returns {import('lit').TemplateResult | null}
 */
export function getButtonIcon(name) {
  return buttonIconMap[name] ?? null;
}
