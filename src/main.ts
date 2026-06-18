/**
 * ============================================================================
 * DevDash Entry Point
 * ============================================================================
 * Handles application boot, state loading, searching, filtering, and sorting.
 * 
 * Curriculum References:
 * - Spread Operator (immutability copy): docs/JS/01_JavaScript_Advanced.md#4-rest-parameters--5-spread-operator
 * - Destructuring: docs/JS/01_JavaScript_Advanced.md#6-destructuring
 * - Higher-Order Functions (filter, sort): docs/JS/01_JavaScript_Advanced.md#7-higher-order-functions-hof
 * - async/await: docs/JS/02_Asynchronous_JavaScript.md#6-async--await
 * ============================================================================
 */

import { getProducts, getCategories } from './api';
import { renderLoading, renderError, renderProductList, updateStats } from './ui';
import { Product } from './types';

// Global state variables for caching fetched data
let allProducts: Product[] = [];
let categoriesList: string[] = [];

/**
 * Filter and sort products, then redraw the list.
 * 
 * Concept: Array.prototype.filter is a higher-order function that takes a callback.
 * Concept: Array.prototype.sort mutates the original array. We must use the ES6 spread operator
 * to create a shallow copy first to maintain immutable state practices.
 * Reference: docs/JS/01_JavaScript_Advanced.md#4-rest-parameters--5-spread-operator
 * Reference: docs/JS/01_JavaScript_Advanced.md#7-higher-order-functions-hof
 */
function applyFiltersAndSort(): void {
  const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
  const categoryFilter = document.getElementById('category-filter') as HTMLSelectElement | null;
  const sortSelect = document.getElementById('sort-select') as HTMLSelectElement | null;

  // Destructure query parameters or fall back to defaults
  const query = searchInput?.value.toLowerCase().trim() || '';
  const selectedCategory = categoryFilter?.value || 'all';
  const sortOption = sortSelect?.value || 'none';

  // 1. Filter using the higher-order function filter()
  let filtered = allProducts.filter((product) => {
    const matchesSearch = 
      product.title.toLowerCase().includes(query) || 
      product.description.toLowerCase().includes(query);
    
    const matchesCategory = 
      selectedCategory === 'all' || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // 2. Sort the array using a shallow copy (to prevent mutation) and sort() HOF
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
 * Handle card click - placeholder for Day 5 detail view.
 */
function handleProductClick(productId: number): void {
  console.log(`Product clicked: ${productId}. Detail view will be implemented in Day 5.`);
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
      // In Day 6 we will wrap this with a debounce closure
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
 */
async function bootstrapApp(): Promise<void> {
  try {
    renderLoading();

    // Fetch products and category options in sequence (Day 5 will parallelize this)
    const productsData = await getProducts();
    categoriesList = await getCategories();

    allProducts = productsData.products;

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
