/**
 * ============================================================================
 * DevDash Entry Point
 * ============================================================================
 * Handles application boot, state loading, and event routing.
 * 
 * Curriculum References:
 * - async/await Promise chaining: docs/JS/02_Asynchronous_JavaScript.md#6-async--await
 * - Event Loop & DOM: docs/JS/02_Asynchronous_JavaScript.md#1-the-event-loop
 * ============================================================================
 */

import { getProducts, getCategories } from './api';
import { renderLoading, renderError, renderProductList, updateStats } from './ui';
import { Product } from './types';

// App state variables for Day 3
let allProducts: Product[] = [];
let categoriesList: string[] = [];

/**
 * Populate the category dropdown element.
 */
function populateCategories(categories: string[]): void {
  const filterSelect = document.getElementById('category-filter') as HTMLSelectElement | null;
  if (!filterSelect) return;

  // Clear existing except first "All Categories" option
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
 * Bootstraps the application by fetching data and updating the UI.
 * 
 * Concept: Asynchronous flow with try-catch block for complete error state UI.
 * Reference: docs/JS/02_Asynchronous_JavaScript.md#7-error-handling
 */
async function bootstrapApp(): Promise<void> {
  try {
    // Show spinner in the DOM
    renderLoading();

    // Fetch initial datasets
    // Wait, for Day 3 we can fetch products and categories
    const productsData = await getProducts();
    categoriesList = await getCategories();

    allProducts = productsData.products;

    // Render results
    renderProductList(allProducts, handleProductClick);
    updateStats(allProducts, categoriesList.length);
    populateCategories(categoriesList);

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown Network Error';
    renderError(errorMsg, bootstrapApp);
  }
}

// Start application when DOM is fully parsed
window.addEventListener('DOMContentLoaded', () => {
  bootstrapApp();
});
