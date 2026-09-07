/**
 * Maps PatternFly React Button props to PatternFly core (pf-v6-c-button) class names.
 * @see https://github.com/patternfly/patternfly-react/tree/main/packages/react-core/src/components/Button
 * @see https://www.patternfly.org/components/button
 */
export function getPatternFlyButtonClassNames({
  variant = 'primary',
  size = 'default',
  state = 'unread',
  className = '',
  isBlock = false,
  isDisabled = false,
  isAriaDisabled = false,
  isLoading = false,
  isClicked = false,
  isInline = false,
  isDanger = false,
  isFavorite = false,
  isFavorited = false,
  hasNoPadding = false,
  isSettings = false,
  isHamburger = false,
  hamburgerVariant,
  isCircle = false,
  isDocked = false,
  isTextExpanded = false,
} = {}) {
  const classes = ['pf-v6-c-button'];

  if (variant === 'stateful') {
    classes.push('pf-m-stateful');
    if (state === 'read') classes.push('pf-m-read');
    else if (state === 'attention') classes.push('pf-m-attention');
    else classes.push('pf-m-unread');
  } else {
    classes.push(`pf-m-${variant}`);
  }

  if (size === 'sm') classes.push('pf-m-small');
  if (size === 'lg') classes.push('pf-m-display-lg');

  if (isBlock) classes.push('pf-m-block');
  if (isDisabled) classes.push('pf-m-disabled');
  if (isAriaDisabled) classes.push('pf-m-aria-disabled');
  if (isClicked) classes.push('pf-m-clicked');
  if (isLoading && variant !== 'plain') classes.push('pf-m-progress');
  if (isLoading) classes.push('pf-m-in-progress');
  if (isInline) classes.push('pf-m-inline');
  if (isDanger) classes.push('pf-m-danger');
  if (isFavorite) classes.push('pf-m-favorite');
  if (isFavorite && isFavorited) classes.push('pf-m-favorited');
  if (isSettings) classes.push('pf-m-settings');
  if (isHamburger) {
    classes.push('pf-m-hamburger');
    if (hamburgerVariant === 'expand') classes.push('pf-m-expand');
    if (hamburgerVariant === 'collapse') classes.push('pf-m-collapse');
  }
  if (isCircle) classes.push('pf-m-circle');
  if (isDocked) classes.push('pf-m-docked');
  if (isTextExpanded) classes.push('pf-m-text-expanded');
  if (hasNoPadding) classes.push('pf-m-no-padding');

  if (className) classes.push(className);

  return classes.join(' ');
}
