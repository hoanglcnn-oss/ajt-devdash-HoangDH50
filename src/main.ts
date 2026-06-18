/**
 * ============================================================================
 * DevDash Entry Point
 * ============================================================================
 * Handles state transitions, debounced search inputs, detail page caching
 * via CacheManager, and rendering updates.
 * 
 * Curriculum References:
 * - Closures (debounce/memoize): docs/JS/01_JavaScript_Advanced.md#8-closures
 * - Memoization: docs/JS/01_JavaScript_Advanced.md#9-memoization
 * - Generic constraints: docs/JS/03_TypeScript.md#9-generics
 * - Discriminated unions narrowing: docs/JS/03_TypeScript.md#6-type-narrowing
 * ============================================================================
 */

import { getProducts, getCategories, getProductById, getProductComments } from './api';
import { renderApp, AppActions } from './ui';
import { Product, Comment, Identifiable } from './types';
import { getState, setState, subscribe } from './state';
import { debounce, memoize, CacheManager } from './utils';

// Define cache interface conforming to Identifiable constraint
interface CachedDetail extends Identifiable {
  id: number;
  product: Product;
  comments: Comment[];
}

// Instantiate the Generic CacheManager class with constraint
const detailsCache = new CacheManager<CachedDetail>();

// Memoized analytics utility: cache category stats calculations
const calculateCategoryMetrics = memoize((products: Product[]): Record<string, number> => {
  return products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
});

/**
 * Perform filtering and sorting of product lists.
 * Uses higher-order methods (filter, sort, spread).
 */
function runFilteringAndSorting(
  products: Product[],
  query: string,
  category: string,
  sortOption: string
): Product[] {
  let results = products.filter((p) => {
    const matchesSearch = 
      p.title.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query);
    const matchesCategory = 
      category === 'all' || p.category === category;
    return matchesSearch && matchesCategory;
  });

  if (sortOption !== 'none') {
    results = [...results].sort((a, b) => {
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

  return results;
}

/**
 * Actions structure bound to UI elements triggers.
 */
const appActions: AppActions = {
  retry: bootstrapApp,
  onProductClick: handleProductClick,
  onCloseDetail: handleCloseProductDetail,
};

/**
 * Handle detail modal closing.
 */
function handleCloseProductDetail(): void {
  const state = getState();
  if (state.status === 'detail') {
    setState({
      status: 'success',
      allProducts: state.allProducts,
      filteredProducts: state.filteredProducts,
      categoriesList: state.categoriesList,
      searchQuery: state.searchQuery,
      selectedCategory: state.selectedCategory,
      sortBy: state.sortBy,
    });
  }
}

/**
 * Click handler for product cards.
 * Uses generic class CacheManager to prevent duplicate details calls.
 */
async function handleProductClick(productId: number): Promise<void> {
  const state = getState();
  if (state.status !== 'success' && state.status !== 'detail') return;

  // 1. Check if item has already been fetched and cached
  if (detailsCache.has(productId)) {
    const cached = detailsCache.get(productId)!;
    setState({
      status: 'detail',
      allProducts: state.allProducts,
      filteredProducts: state.filteredProducts,
      categoriesList: state.categoriesList,
      searchQuery: state.searchQuery,
      selectedCategory: state.selectedCategory,
      sortBy: state.sortBy,
      selectedProduct: cached.product,
      selectedComments: cached.comments,
    });
    return;
  }

  try {
    // Show temporary spinner placeholder in detail modal
    const detailOverlay = document.getElementById('detail-overlay');
    const detailModal = document.getElementById('detail-modal');
    if (detailOverlay && detailModal) {
      detailOverlay.classList.add('active');
      detailModal.innerHTML = `
        <div class="loading-container">
          <div class="spinner"></div>
          <div class="loading-text">LOADING DETAIL DATA...</div>
        </div>
      `;
    }

    // 2. Fetch profile data and comments in parallel using Promise.all
    const [product, commentsResponse] = await Promise.all([
      getProductById(productId),
      getProductComments(productId),
    ]);

    // Save to CacheManager registry
    detailsCache.set({
      id: productId,
      product,
      comments: commentsResponse.comments,
    });

    setState({
      status: 'detail',
      allProducts: state.allProducts,
      filteredProducts: state.filteredProducts,
      categoriesList: state.categoriesList,
      searchQuery: state.searchQuery,
      selectedCategory: state.selectedCategory,
      sortBy: state.sortBy,
      selectedProduct: product,
      selectedComments: commentsResponse.comments,
    });

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to fetch details';
    alert(`Error loading details: ${errorMsg}`);
    handleCloseProductDetail();
  }
}

// 3. Debounced filter logic using the closure wrapper
const debouncedApplyFilters = debounce(() => {
  const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
  const query = searchInput?.value.toLowerCase().trim() || '';

  const state = getState();
  if (state.status === 'success' || state.status === 'detail') {
    const filtered = runFilteringAndSorting(
      state.allProducts,
      query,
      state.selectedCategory,
      state.sortBy
    );
    setState({
      ...state,
      searchQuery: query,
      filteredProducts: filtered,
    });
  }
}, 300);

/**
 * Filter change event router.
 */
function handleCategoryChange(e: Event): void {
  const category = (e.target as HTMLSelectElement).value;
  const state = getState();
  if (state.status === 'success' || state.status === 'detail') {
    const filtered = runFilteringAndSorting(
      state.allProducts,
      state.searchQuery,
      category,
      state.sortBy
    );
    setState({
      ...state,
      selectedCategory: category,
      filteredProducts: filtered,
    });
  }
}

/**
 * Sort change event router.
 */
function handleSortChange(e: Event): void {
  const sortBy = (e.target as HTMLSelectElement).value;
  const state = getState();
  if (state.status === 'success' || state.status === 'detail') {
    const filtered = runFilteringAndSorting(
      state.allProducts,
      state.searchQuery,
      state.selectedCategory,
      sortBy
    );
    setState({
      ...state,
      sortBy,
      filteredProducts: filtered,
    });
  }
}

/**
 * Reset dashboard filters.
 */
function handleReset(): void {
  const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
  if (searchInput) searchInput.value = '';

  const state = getState();
  if (state.status === 'success' || state.status === 'detail') {
    const filtered = runFilteringAndSorting(
      state.allProducts,
      '',
      'all',
      'none'
    );
    setState({
      ...state,
      searchQuery: '',
      selectedCategory: 'all',
      sortBy: 'none',
      filteredProducts: filtered,
    });
  }
}

/**
 * Bind DOM event listeners to controls.
 */
function bindEvents(): void {
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  const sortSelect = document.getElementById('sort-select');
  const resetBtn = document.getElementById('reset-btn');

  if (searchInput) {
    searchInput.addEventListener('input', debouncedApplyFilters);
  }
  if (categoryFilter) {
    categoryFilter.addEventListener('change', handleCategoryChange);
  }
  if (sortSelect) {
    sortSelect.addEventListener('change', handleSortChange);
  }
  if (resetBtn) {
    resetBtn.addEventListener('click', handleReset);
  }
}

/**
 * Bootstraps the application.
 */
async function bootstrapApp(): Promise<void> {
  try {
    setState({ status: 'loading' });

    // Fetch initial datasets in parallel
    const [productsData, categoriesData] = await Promise.all([
      getProducts(),
      getCategories(),
    ]);

    const products = productsData.products;

    // Demo of using memoized function calculation on load
    const categoryDistribution = calculateCategoryMetrics(products);
    console.log('Initial memoized category metrics distribution:', categoryDistribution);

    setState({
      status: 'success',
      allProducts: products,
      filteredProducts: products,
      categoriesList: categoriesData,
      searchQuery: '',
      selectedCategory: 'all',
      sortBy: 'none',
    });

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown Network Error';
    setState({ status: 'error', error: errorMsg });
  }
}

// Subscribe user interfaces to state store events (Single Source of Truth)
subscribe((state) => {
  renderApp(state, appActions);
});

// Boot when DOM has completed parsing
window.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  bootstrapApp();
});
