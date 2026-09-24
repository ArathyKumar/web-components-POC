/** Adopts an imported CSS module once at document scope for light DOM elements. */
export function adoptLightStyleSheet(styleSheet) {
  if (
    !styleSheet ||
    typeof document === 'undefined' ||
    !('adoptedStyleSheets' in document) ||
    document.adoptedStyleSheets.includes(styleSheet)
  ) {
    return;
  }

  document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];
}
