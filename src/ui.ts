/**
 * ============================================================================
 * DevDash UI Module
 * ============================================================================
 * Handles DOM manipulation and UI rendering for list views, loading spinners,
 * error boxes, and product details overlays.
 * 
 * Curriculum References:
 * - Event loop & Timer callbacks: docs/JS/02_Asynchronous_JavaScript.md#1-the-event-loop
 * - Error Handling & states in UI: docs/JS/02_Asynchronous_JavaScript.md#7-error-handling
 * - Higher-Order Functions (map/filter/reduce): docs/JS/01_JavaScript_Advanced.md#7-higher-order-functions-hof
 * ============================================================================
 */

import { Product, Comment } from './types';

// Cache DOM elements for quick access
const contentContainer = document.getElementById('dashboard-content');
const statTotalProducts = document.getElementById('stat-total-products');
const statTotalCategories = document.getElementById('stat-total-categories');
const statAvgPrice = document.getElementById('stat-avg-price');
const statAvgRating = document.getElementById('stat-avg-rating');
const detailOverlay = document.getElementById('detail-overlay');
const detailModal = document.getElementById('detail-modal');

/**
 * Render a beautiful loading spinner in the main dashboard content container.
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
 */
export function renderProductList(products: Product[], onProductClick: (id: number) => void): void {
  if (!contentContainer) return;

  if (products.length === 0) {
    renderEmptyState();
    return;
  }

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
 */
export function updateStats(products: Product[], categoryCount: number): void {
  if (products.length === 0) {
    if (statTotalProducts) statTotalProducts.textContent = '0';
    if (statTotalCategories) statTotalCategories.textContent = categoryCount.toString();
    if (statAvgPrice) statAvgPrice.textContent = '$0';
    if (statAvgRating) statAvgRating.textContent = '0.0';
    return;
  }

  const totalPrice = products.reduce((acc, p) => acc + p.price, 0);
  const avgPrice = totalPrice / products.length;

  const totalRating = products.reduce((acc, p) => acc + p.rating, 0);
  const avgRating = totalRating / products.length;

  if (statTotalProducts) statTotalProducts.textContent = products.length.toString();
  if (statTotalCategories) statTotalCategories.textContent = categoryCount.toString();
  if (statAvgPrice) statAvgPrice.textContent = `$${avgPrice.toFixed(0)}`;
  if (statAvgRating) statAvgRating.textContent = avgRating.toFixed(1);
}

/**
 * Close the product details overlay.
 */
export function closeProductDetail(): void {
  if (detailOverlay) {
    detailOverlay.classList.remove('active');
  }
}

/**
 * Render the product detail modal in the overlay.
 * 
 * Concept: Higher-Order Functions map/join to render list.
 * Reference: docs/JS/01_JavaScript_Advanced.md#7-higher-order-functions-hof
 */
export function renderProductDetail(
  product: Product,
  comments: Comment[],
  onClose: () => void
): void {
  if (!detailOverlay || !detailModal) return;

  // Compute stock level indicator class
  let stockClass = 'stock-instock';
  let stockText = 'In Stock';
  if (product.stock === 0) {
    stockClass = 'stock-out';
    stockText = 'Out of Stock';
  } else if (product.stock < 10) {
    stockClass = 'stock-low';
    stockText = `Only ${product.stock} left in stock`;
  } else {
    stockText = `${product.stock} items available`;
  }

  // Construct comments markup
  const commentsHtml = comments.length === 0
    ? '<p class="no-comments">No comments available for this product.</p>'
    : comments
        .map(
          (c) => `
            <div class="comment-item">
              <p class="comment-author">@${c.user.username}</p>
              <p class="comment-body">${c.body}</p>
            </div>
          `
        )
        .join('');

  detailModal.innerHTML = `
    <button class="close-modal-btn" id="close-modal-btn" aria-label="Close details">&times;</button>
    <div class="detail-grid">
      <!-- Image Column -->
      <div class="detail-img-column">
        <img class="detail-image" src="${product.images[0] || product.thumbnail}" alt="${product.title}">
      </div>
      <!-- Content Column -->
      <div class="detail-content-column">
        <span class="detail-category">${product.category}</span>
        <h2 class="detail-title">${product.title}</h2>
        ${product.brand ? `<p class="detail-brand">Brand: ${product.brand}</p>` : ''}
        
        <div class="detail-price-row">
          <span class="detail-price">$${product.price.toLocaleString()}</span>
          <span class="detail-discount">${product.discountPercentage}% OFF</span>
        </div>

        <div class="detail-rating">
          ${generateStars(product.rating)}
          <span>${product.rating.toFixed(1)} / 5.0 Rating</span>
        </div>

        <p class="detail-description">${product.description}</p>

        <div class="detail-stock-row">
          <span class="stock-indicator ${stockClass}"></span>
          <span>${stockText}</span>
        </div>
      </div>
    </div>
    
    <!-- Comments Section -->
    <div class="comments-section">
      <h3 class="comments-header">User Reviews (${comments.length})</h3>
      <div class="comment-list">
        ${commentsHtml}
      </div>
    </div>
  `;

  // Display overlay
  detailOverlay.classList.add('active');

  // Attach event listener for close button
  const closeBtn = document.getElementById('close-modal-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', onClose);
  }

  // Close when clicking outside of the modal
  const clickOutsideHandler = (e: MouseEvent) => {
    if (e.target === detailOverlay) {
      onClose();
      detailOverlay.removeEventListener('click', clickOutsideHandler);
    }
  };
  detailOverlay.addEventListener('click', clickOutsideHandler);
}
