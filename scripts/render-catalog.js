import { componentCatalog } from '../components/catalog.js';

/**
 * Renders catalog cards into the element matching [data-catalog-grid].
 */
export function renderComponentCatalog() {
  const grid = document.querySelector('[data-catalog-grid]');
  if (!grid) {
    return;
  }

  if (!componentCatalog.length) {
    grid.innerHTML = '<p class="catalog-empty">No components in the catalog yet.</p>';
    return;
  }

  grid.innerHTML = componentCatalog
    .map((entry) => {
      const isReady = entry.status !== 'coming-soon';
      const tags = (entry.tags ?? [])
        .map((tag) => `<span class="catalog-card__tag">${tag}</span>`)
        .join('');
      const elements = (entry.elements ?? [])
        .map((tag) => `<code>&lt;${tag}&gt;</code>`)
        .join(', ');

      if (!isReady) {
        return `
          <li>
            <article class="catalog-card catalog-card--disabled" aria-disabled="true">
              <h2 class="catalog-card__title">${entry.name}</h2>
              <p class="catalog-card__description">${entry.description}</p>
              ${tags ? `<div class="catalog-card__tags">${tags}</div>` : ''}
              <p class="catalog-card__elements">${elements}</p>
              <span class="catalog-card__cta">Coming soon</span>
            </article>
          </li>`;
      }

      return `
        <li>
          <a class="catalog-card" href="${entry.href}">
            <h2 class="catalog-card__title">${entry.name}</h2>
            <p class="catalog-card__description">${entry.description}</p>
            ${tags ? `<div class="catalog-card__tags">${tags}</div>` : ''}
            <p class="catalog-card__elements">${elements}</p>
            <span class="catalog-card__cta">View demo →</span>
          </a>
        </li>`;
    })
    .join('');
}
