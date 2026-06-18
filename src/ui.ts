/**
 * ============================================================================
 * DevDash UI Module
 * ============================================================================
 * Handles DOM manipulation and UI rendering for list views, loading spinners,
 * and error boxes.
 * 
 * Curriculum References:
 * - Event loop & Timer callbacks: docs/JS/02_Asynchronous_JavaScript.md#1-the-event-loop
 * - Error Handling & states in UI: docs/JS/02_Asynchronous_JavaScript.md#7-error-handling
 * - Higher-Order Functions (map/filter/reduce): docs/JS/01_JavaScript_Advanced.md#7-higher-order-functions-hof
 * ============================================================================
 */

import { Product } from './types';

// Cache DOM elements for quick access
const contentContainer = document.getElementById('dashboard-content');
const statTotalProducts = document.getElementById('stat-total-products');
const statTotalCategories = document.getElementById('stat-total-categories');
const statAvgPrice = document.getElementById('stat-avg-price');
const statAvgRating = document.getElementById('stat-avg-rating');

/**
 * Render a beautiful loading spinner in the main dashboard content container.
 * 
 * Concept: Keeping the user informed by displaying a clear loading state.
 * Reference: docs/JS/02_Asynchronous_JavaScript.md#7-error-handling (UI states)
 */
export function renderLoading(): void {
  if (!contentContainer) return;
  contentContainer.innerHTML = `
    <div class="loading-container" id="loading-spinner">
      <div class="spinner"></div>
      <div class="loading-text">FETCHING DATA FROM API...</div>
    </div>
  `;
}

/**
 * Render an error state in the UI with a Retry action.
 * 
 * Concept: Handling failures gracefully in async flows with visible error states.
 * Reference: docs/JS/02_Asynchronous_JavaScript.md#7-error-handling
 */
export function renderError(message: string, onRetry: () => void): void {
  if (!contentContainer) return;
  contentContainer.innerHTML = `
    <div class="error-container">
      <h2 class="error-title">Unable to Load Dashboard</h2>
      <p class="error-message">${message}</p>
      <button id="retry-btn" class="retry-btn">Retry Connection</button>
    </div>
  `;

  // Attach retry click handler
  const retryBtn = document.getElementById('retry-btn');
  if (retryBtn) {
    retryBtn.addEventListener('click', onRetry);
  }
}

/**
 * Render a simple placeholder when no products match filters.
 */
export function renderEmptyState(): void {
  if (!contentContainer) return;
  contentContainer.innerHTML = `
    <div class="empty-container">
      <h2 class="empty-title">No Products Found</h2>
      <p>Try resetting the search query or category filters.</p>
    </div>
  `;
}

/**
 * Helper function to generate yellow star characters based on product rating.
 */
function generateStars(rating: number): string {
  const rounded = Math.round(rating);
  const fullStars = '★'.repeat(rounded);
  const emptyStars = '☆'.repeat(5 - rounded);
  return `<span class="rating-stars">${fullStars}${emptyStars}</span>`;
}

/**
 * Render the product list as a grid of cards in the DOM.
 * 
 * Concept: Transforming array data into HTML strings using HOF (map and join)
 * instead of imperative for-loops.
 * Reference: docs/JS/01_JavaScript_Advanced.md#7-higher-order-functions-hof
 */
export function renderProductList(products: Product[], onProductClick: (id: number) => void): void {
  if (!contentContainer) return;

  if (products.length === 0) {
    renderEmptyState();
    return;
  }

  // Use map to transform each product object into a HTML card string, and join('') to combine them.
  const cardsHtml = products
    .map((product) => {
      return `
        <div class="product-card" data-id="${product.id}">
          <div class="card-img-wrapper">
            <span class="card-tag">${product.category}</span>
            <img class="card-img" src="${product.thumbnail}" alt="${product.title}" loading="lazy">
          </div>
          <div class="card-body">
            <h3 class="card-title">${product.title}</h3>
            <div class="card-rating">
              ${generateStars(product.rating)}
              <span>(${product.rating.toFixed(1)})</span>
            </div>
            <div class="card-footer">
              <span class="card-price">$${product.price.toLocaleString()}</span>
              <span class="view-details-txt">View details →</span>
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  contentContainer.innerHTML = `<div class="products-grid">${cardsHtml}</div>`;

  // Attach dynamic event listeners to each product card
  const cards = contentContainer.querySelectorAll('.product-card');
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const productId = Number(card.getAttribute('data-id'));
      if (!isNaN(productId)) {
        onProductClick(productId);
      }
    });
  });
}

/**
 * Update the stats overview counters on the top of the dashboard.
 * 
 * Concept: Array.reduce is a powerful HOF that carries an accumulator,
 * converting an array into a single value.
 * Reference: docs/JS/01_JavaScript_Advanced.md#7-higher-order-functions-hof
 */
export function updateStats(products: Product[], categoryCount: number): void {
  if (products.length === 0) {
    if (statTotalProducts) statTotalProducts.textContent = '0';
    if (statTotalCategories) statTotalCategories.textContent = categoryCount.toString();
    if (statAvgPrice) statAvgPrice.textContent = '$0';
    if (statAvgRating) statAvgRating.textContent = '0.0';
    return;
  }

  // Calculate sum of prices using reduce
  const totalPrice = products.reduce((acc, p) => acc + p.price, 0);
  const avgPrice = totalPrice / products.length;

  // Calculate sum of ratings using reduce
  const totalRating = products.reduce((acc, p) => acc + p.rating, 0);
  const avgRating = totalRating / products.length;

  // Update DOM elements
  if (statTotalProducts) statTotalProducts.textContent = products.length.toString();
  if (statTotalCategories) statTotalCategories.textContent = categoryCount.toString();
  if (statAvgPrice) statAvgPrice.textContent = `$${avgPrice.toFixed(0)}`;
  if (statAvgRating) statAvgRating.textContent = avgRating.toFixed(1);
}
