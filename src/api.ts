/**
 * ============================================================================
 * DevDash API Service
 * ============================================================================
 * Handles HTTP requests to the DummyJSON API.
 * Contains a reusable generic fetch helper and strongly typed endpoints.
 * 
 * Curriculum References:
 * - Generics: docs/JS/03_TypeScript.md#9-generics
 * - async/await: docs/JS/02_Asynchronous_JavaScript.md#6-async--await
 * - fetch ok checks & error handling: docs/JS/02_Asynchronous_JavaScript.md#7-error-handling
 * ============================================================================
 */

import { Product, ProductsResponse, CommentsResponse } from './types';

const BASE_URL = 'https://dummyjson.com';

/**
 * Reusable generic helper function to fetch and parse JSON data.
 * 
 * Concept: Generics `<T>` allow this function to return a Promise of any type `T`
 * defined at the call site, maintaining type safety without resorting to `any`.
 * Reference: docs/JS/03_TypeScript.md#9-generics
 * 
 * Concept: Fetch error handling mechanism (fetch does not reject on 404/500).
 * Reference: docs/JS/02_Asynchronous_JavaScript.md#7-error-handling
 */
export async function fetchJson<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options);

    // Key Point: fetch does not reject on HTTP errors (e.g. 404 or 500 status).
    // We must manually inspect response.ok (status range 200-299) and throw.
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    // Parsing the JSON body also returns a Promise, which we await.
    const data: T = await response.json();
    return data;
  } catch (error) {
    // Re-throw the error or log it so the calling code can handle the error state in the UI.
    console.error(`fetchJson error on URL: ${url}`, error);
    throw error;
  }
}

/**
 * Fetch a list of products.
 * 
 * Concept: async functions always return a Promise.
 * Reference: docs/JS/02_Asynchronous_JavaScript.md#6-async--await
 */
export async function getProducts(limit = 30, skip = 0): Promise<ProductsResponse> {
  return fetchJson<ProductsResponse>(`${BASE_URL}/products?limit=${limit}&skip=${skip}`);
}

/**
 * Fetch a single product by its unique ID.
 */
export async function getProductById(id: number): Promise<Product> {
  return fetchJson<Product>(`${BASE_URL}/products/${id}`);
}

/**
 * Fetch comments for a specific product ID.
 */
export async function getProductComments(id: number): Promise<CommentsResponse> {
  return fetchJson<CommentsResponse>(`${BASE_URL}/products/${id}/comments`);
}

/**
 * Fetch the list of categories.
 * DummyJSON offers a category-list endpoint returning string[] of category names.
 */
export async function getCategories(): Promise<string[]> {
  return fetchJson<string[]>(`${BASE_URL}/products/category-list`);
}
