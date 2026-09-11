/**
 * Shared favorite/loading state helpers for pf-button-shadow and pf-button-light.
 */

/**
 * Lit attribute converter: absent or any value except "false" => true (uncontrolled default).
 * @type {import('lit').ComplexAttributeConverter}
 */
export const autoToggleConverter = {
  fromAttribute(value) {
    return value !== 'false';
  },
  toAttribute(value) {
    return value ? null : 'false';
  },
};

/**
 * Returns true when the button can show or toggle a progress spinner.
 * @param {object} button pf-button-shadow or pf-button-light instance
 */
export function isProgressCapable(button) {
  return (
    button.loading ||
    Boolean(button.spinnerAriaLabel) ||
    Boolean(button.spinnerAriaLabelledBy) ||
    Boolean(button.spinnerAriaValueText)
  );
}

/**
 * Returns true when idle/loading label attributes drive the visible label text.
 * @param {object} button pf-button-shadow or pf-button-light instance
 */
export function usesProgressLabels(button) {
  return Boolean(button.idleLabel || button.loadingLabel);
}

/**
 * Resolves the label string for progress buttons using idle-label/loading-label attrs.
 * Returns null when progress label attributes are not in use.
 * @param {object} button pf-button-shadow or pf-button-light instance
 * @returns {string | null}
 */
export function getProgressLabelText(button) {
  if (!usesProgressLabels(button)) {
    return null;
  }

  if (button.loading) {
    return button.loadingLabel ?? button.idleLabel ?? '';
  }

  return button.idleLabel ?? button.loadingLabel ?? '';
}

/**
 * Returns true for icon-only progress buttons (no slot text, no progress label attrs).
 * @param {object} button pf-button-shadow or pf-button-light instance
 * @param {boolean} hasDefaultSlotContent
 */
export function isIconOnlyProgressButton(button, hasDefaultSlotContent) {
  return isProgressCapable(button) && !usesProgressLabels(button) && !hasDefaultSlotContent;
}

/**
 * Stores the current aria-label for later restore after icon-only loading clears it.
 * @param {object} button pf-button-shadow or pf-button-light instance
 */
export function captureDefaultAriaLabel(button) {
  button._defaultAriaLabel = button.ariaLabel || button.getAttribute('aria-label') || '';
}

/**
 * Updates aria-label to match the current favorited state.
 * @param {object} button pf-button-shadow or pf-button-light instance
 * @param {boolean} favorited
 */
export function syncFavoriteAriaLabel(button, favorited) {
  const favoritedLabel = button.ariaLabelFavorited;
  const unfavoritedLabel = button.ariaLabelUnfavorited ?? button._defaultAriaLabel;

  if (favoritedLabel || unfavoritedLabel) {
    button.ariaLabel = favorited
      ? (favoritedLabel || 'Unfavorite')
      : (unfavoritedLabel || 'Favorite');
    return;
  }

  button.ariaLabel = favorited ? 'Unfavorite' : 'Favorite';
}

/**
 * Clears or restores aria-label on icon-only progress buttons while loading.
 * @param {object} button pf-button-shadow or pf-button-light instance
 * @param {boolean} loading
 * @param {boolean} hasDefaultSlotContent
 */
export function syncLoadingPresentation(button, loading, hasDefaultSlotContent) {
  if (!isIconOnlyProgressButton(button, hasDefaultSlotContent)) {
    return;
  }

  if (loading && (button.spinnerAriaLabel || button.spinnerAriaLabelledBy)) {
    button.ariaLabel = undefined;
  } else {
    button.ariaLabel = button._defaultAriaLabel || undefined;
  }
}

/**
 * Returns true when favorite state should toggle internally on activation (uncontrolled).
 * Set auto-toggle-favorite="false" for controlled mode.
 * @param {object} button pf-button-shadow or pf-button-light instance
 */
export function shouldAutoToggleFavorite(button) {
  if (!button.favorite) {
    return false;
  }

  return button.autoToggleFavorite !== false;
}

/**
 * Returns true when loading state should toggle internally on activation (uncontrolled).
 * Set auto-toggle-loading="false" for controlled mode.
 * @param {object} button pf-button-shadow or pf-button-light instance
 */
export function shouldAutoToggleLoading(button) {
  if (!isProgressCapable(button)) {
    return false;
  }

  return button.autoToggleLoading !== false;
}

/**
 * Toggles or reports favorite state on activation and dispatches pf-favorite-change.
 * @param {object} button pf-button-shadow or pf-button-light instance
 * @param {(name: string, detail: object) => void} dispatch
 */
export function applyFavoriteActivation(button, dispatch) {
  if (shouldAutoToggleFavorite(button)) {
    const favorited = !button.favorited;
    button.favorited = favorited;
    dispatch('pf-favorite-change', { favorited });
    return;
  }

  if (button.favorite) {
    dispatch('pf-favorite-change', { favorited: !button.favorited });
  }
}

/**
 * Toggles or reports loading state on activation and dispatches pf-loading-change.
 * @param {object} button pf-button-shadow or pf-button-light instance
 * @param {(name: string, detail: object) => void} dispatch
 */
export function applyLoadingActivation(button, dispatch) {
  if (shouldAutoToggleLoading(button)) {
    const loading = !button.loading;
    button.loading = loading;
    dispatch('pf-loading-change', { loading });
    return;
  }

  if (isProgressCapable(button)) {
    dispatch('pf-loading-change', { loading: !button.loading });
  }
}
