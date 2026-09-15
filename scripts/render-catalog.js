import { componentCatalog } from '../components/catalog.js';

/**
 * @param {string} value
 * @returns {string}
 */
function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/**
 * @param {import('../components/catalog.js').CatalogEntry} entry
 * @returns {HTMLLIElement}
 */
function createCatalogListItem(entry) {
  const listItem = document.createElement('li');
  const isReady = entry.status !== 'coming-soon';

  if (!isReady) {
    const article = document.createElement('article');
    article.className = 'catalog-card catalog-card--disabled';
    article.setAttribute('aria-disabled', 'true');

    const title = document.createElement('h2');
    title.className = 'catalog-card__title';
    title.textContent = entry.name;
    article.appendChild(title);

    const description = document.createElement('p');
    description.className = 'catalog-card__description';
    description.textContent = entry.description;
    article.appendChild(description);

    if (entry.tags?.length) {
      const tags = document.createElement('div');
      tags.className = 'catalog-card__tags';
      entry.tags.forEach((tag) => {
        const tagEl = document.createElement('span');
        tagEl.className = 'catalog-card__tag';
        tagEl.textContent = tag;
        tags.appendChild(tagEl);
      });
      article.appendChild(tags);
    }

    if (entry.elements?.length) {
      const elements = document.createElement('p');
      elements.className = 'catalog-card__elements';
      elements.innerHTML = entry.elements
        .map((tag) => `<code>&lt;${escapeHtml(tag)}&gt;</code>`)
        .join(', ');
      article.appendChild(elements);
    }

    const cta = document.createElement('span');
    cta.className = 'catalog-card__cta';
    cta.textContent = 'Coming soon';
    article.appendChild(cta);

    listItem.appendChild(article);
    return listItem;
  }

  const link = document.createElement('a');
  link.className = 'catalog-card';
  link.href = entry.href;

  const title = document.createElement('h2');
  title.className = 'catalog-card__title';
  title.textContent = entry.name;
  link.appendChild(title);

  const description = document.createElement('p');
  description.className = 'catalog-card__description';
  description.textContent = entry.description;
  link.appendChild(description);

  if (entry.tags?.length) {
    const tags = document.createElement('div');
    tags.className = 'catalog-card__tags';
    entry.tags.forEach((tag) => {
      const tagEl = document.createElement('span');
      tagEl.className = 'catalog-card__tag';
      tagEl.textContent = tag;
      tags.appendChild(tagEl);
    });
    link.appendChild(tags);
  }

  if (entry.elements?.length) {
    const elements = document.createElement('p');
    elements.className = 'catalog-card__elements';
    elements.innerHTML = entry.elements
      .map((tag) => `<code>&lt;${escapeHtml(tag)}&gt;</code>`)
      .join(', ');
    link.appendChild(elements);
  }

  const cta = document.createElement('span');
  cta.className = 'catalog-card__cta';
  cta.textContent = 'View demo →';
  link.appendChild(cta);

  listItem.appendChild(link);
  return listItem;
}

/**
 * Renders catalog cards into the element matching [data-catalog-grid].
 */
export function renderComponentCatalog() {
  const grid = document.querySelector('[data-catalog-grid]');
  if (!grid) {
    return;
  }

  grid.replaceChildren();

  if (!componentCatalog.length) {
    const empty = document.createElement('p');
    empty.className = 'catalog-empty';
    empty.textContent = 'No components in the catalog yet.';
    grid.appendChild(empty);
    return;
  }

  componentCatalog.forEach((entry) => {
    grid.appendChild(createCatalogListItem(entry));
  });
}
