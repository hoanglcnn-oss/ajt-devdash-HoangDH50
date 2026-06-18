/**
 * ============================================================================
 * DevDash Entry Point
 * ============================================================================
 * Handles application boot, state loading, searching, filtering, sorting,
 * and loading details in parallel.
 * 
 * Curriculum References:
 * - Spread Operator (immutability copy): docs/JS/01_JavaScript_Advanced.md#4-rest-parameters--5-spread-operator
 * - Destructuring: docs/JS/01_JavaScript_Advanced.md#6-destructuring
 * - Higher-Order Functions (filter, sort): docs/JS/01_JavaScript_Advanced.md#7-higher-order-functions-hof
 * - async/await & Promise.all: docs/JS/02_Asynchronous_JavaScript.md#6-async--await
 * - Promise Combinators: docs/JS/02_Asynchronous_JavaScript.md#5-promise-combinators-promiseall-and-friends
 * ============================================================================
 */

import { getProducts, getCategories, getProductById, getProductComments } from './api';
import { 
  renderLoading, 
  renderError, 
  renderProductList, 
  updateStats, 
  renderProductDetail, 
  closeProductDetail 
} from './ui';
import { Product } from './types';

// Global state variables for caching fetched data
let allProducts: Product[] = [];
let categoriesList: string[] = [];

/**
 * Filter and sort products, then redraw the list.
 */
function applyFiltersAndSort(): void {
  const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
  const categoryFilter = document.getElementById('category-filter') as HTMLSelectElement | null;
  const sortSelect = document.getElementById('sort-select') as HTMLSelectElement | null;

  const query = searchInput?.value.toLowerCase().trim() || '';
  const selectedCategory = categoryFilter?.value || 'all';
  const sortOption = sortSelect?.value || 'none';

  // 1. Filter using filter()
  let filtered = allProducts.filter((product) => {
    const matchesSearch = 
      product.title.toLowerCase().includes(query) || 
      product.description.toLowerCase().includes(query);
    
    const matchesCategory = 
      selectedCategory === 'all' || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // 2. Sort using a shallow copy (to prevent mutation) and sort() HOF
  if (sortOption !== 'none') {
    filtered = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating-desc':
          return b.rating - a.rating;
        case 'title-asc':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }

  // Render updated list view
  renderProductList(filtered, handleProductClick);
  // Update overview figures based on filtered results
  updateStats(filtered, categoriesList.length);
}

/**
 * Reset all filter inputs to default values.
 */
function handleResetFilters(): void {
  const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
  const categoryFilter = document.getElementById('category-filter') as HTMLSelectElement | null;
  const sortSelect = document.getElementById('sort-select') as HTMLSelectElement | null;

  if (searchInput) searchInput.value = '';
  if (categoryFilter) categoryFilter.value = 'all';
  if (sortSelect) sortSelect.value = 'none';

  applyFiltersAndSort();
}

/**
 * Populate the category dropdown element.
 */
function populateCategories(categories: string[]): void {
  const filterSelect = document.getElementById('category-filter') as HTMLSelectElement | null;
  if (!filterSelect) return;

  filterSelect.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach((cat) => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    filterSelect.appendChild(option);
  });
}

/**
 * Handle card click - loads detailed product information and user reviews in parallel.
 * 
 * Concept: Promise.all fetches multiple independent async requests concurrently.
 * We avoid "waterfall requests" (first waiting for product, then waiting for comments)
 * which improves response time dramatically.
 * Reference: docs/JS/02_Asynchronous_JavaScript.md#5-promise-combinators-promiseall-and-friends
 */
async function handleProductClick(productId: number): Promise<void> {
  try {
    // Show spinner inside modal overlay while fetching details
    const detailOverlay = document.getElementById('detail-overlay');
    const detailModal = document.getElementById('detail-modal');
    if (detailOverlay && detailModal) {
      detailModal.innerHTML = `
        <div class="loading-container">
          <div class="spinner"></div>
          <div class="loading-text">LOADING DETAIL DATA...</div>
        </div>
      `;
      detailOverlay.classList.add('active');
    }

    // Await both promises in parallel using Promise.all
    const [product, commentsResponse] = await Promise.all([
      getProductById(productId),
      getProductComments(productId),
    ]);

    // Render loaded detail information
    renderProductDetail(product, commentsResponse.comments, handleCloseProductDetail);

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to fetch details';
    alert(`Error loading details: ${errorMsg}`);
    handleCloseProductDetail();
  }
}

/**
 * Close product detail modal overlay.
 */
function handleCloseProductDetail(): void {
  closeProductDetail();
}

/**
 * Bind DOM events to controls.
 */
function bindEvents(): void {
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  const sortSelect = document.getElementById('sort-select');
  const resetBtn = document.getElementById('reset-btn');

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      applyFiltersAndSort();
    });
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', applyFiltersAndSort);
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', applyFiltersAndSort);
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', handleResetFilters);
  }
}

/**
 * Bootstraps the application.
 * 
 * Concept: Loading categories and initial products list in parallel.
 * Reference: docs/JS/02_Asynchronous_JavaScript.md#5-promise-combinators-promiseall-and-friends
 */
async function bootstrapApp(): Promise<void> {
  try {
    renderLoading();

    // Parallel fetch for initial boot data
    const [productsData, categoriesData] = await Promise.all([
      getProducts(),
      getCategories(),
    ]);

    allProducts = productsData.products;
    categoriesList = categoriesData;

    // Build the UI elements
    populateCategories(categoriesList);
    renderProductList(allProducts, handleProductClick);
    updateStats(allProducts, categoriesList.length);

    // Attach controllers listeners
    bindEvents();

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown Network Error';
    renderError(errorMsg, bootstrapApp);
  }
}

// Start application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  bootstrapApp();
});
