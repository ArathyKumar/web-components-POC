/**
 * Maps button options to PatternFly core (pf-v6-c-button) class names.
 * @see https://www.patternfly.org/components/button
 * @param {object} options
 * @param {string} [options.variant='primary']
 * @param {string} [options.size='default']
 * @param {string} [options.state='unread']
 * @param {string} [options.className='']
 * @param {boolean} [options.block=false]
 * @param {boolean} [options.disabled=false]
 * @param {boolean} [options.ariaDisabled=false]
 * @param {boolean} [options.loading=false]
 * @param {boolean} [options.clicked=false]
 * @param {boolean} [options.inline=false]
 * @param {boolean} [options.danger=false]
 * @param {boolean} [options.favorite=false]
 * @param {boolean} [options.favorited=false]
 * @param {boolean} [options.noPadding=false]
 * @param {boolean} [options.settings=false]
 * @param {boolean} [options.hamburger=false]
 * @param {string} [options.hamburgerVariant]
 * @param {boolean} [options.circle=false]
 * @param {boolean} [options.docked=false]
 * @param {boolean} [options.textExpanded=false]
 * @returns {string} Space-separated PatternFly BEM class list.
 */
export function getPatternFlyButtonClassNames({
  variant = 'primary',
  size = 'default',
  state = 'unread',
  className = '',
  block = false,
  disabled = false,
  ariaDisabled = false,
  loading = false,
  clicked = false,
  inline = false,
  danger = false,
  favorite = false,
  favorited = false,
  noPadding = false,
  settings = false,
  hamburger = false,
  hamburgerVariant,
  circle = false,
  docked = false,
  textExpanded = false,
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

  if (block) classes.push('pf-m-block');
  if (disabled) classes.push('pf-m-disabled');
  if (ariaDisabled) classes.push('pf-m-aria-disabled');
  if (clicked) classes.push('pf-m-clicked');
  if (loading && variant !== 'plain') classes.push('pf-m-progress');
  if (loading) classes.push('pf-m-in-progress');
  if (inline) classes.push('pf-m-inline');
  if (danger) classes.push('pf-m-danger');
  if (favorite) classes.push('pf-m-favorite');
  if (favorite && favorited) classes.push('pf-m-favorited');
  if (settings) classes.push('pf-m-settings');
  if (hamburger) {
    classes.push('pf-m-hamburger');
    if (hamburgerVariant === 'expand') classes.push('pf-m-expand');
    if (hamburgerVariant === 'collapse') classes.push('pf-m-collapse');
  }
  if (circle) classes.push('pf-m-circle');
  if (docked) classes.push('pf-m-docked');
  if (textExpanded) classes.push('pf-m-text-expanded');
  if (noPadding) classes.push('pf-m-no-padding');

  if (className) classes.push(className);

  return classes.join(' ');
}
