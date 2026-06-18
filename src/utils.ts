/**
 * ============================================================================
 * DevDash Utility Helpers
 * ============================================================================
 * Contains utility closures (debounce, memoize) and generic helper classes
 * with constraints.
 * 
 * Curriculum References:
 * - Closures in practice: docs/JS/01_JavaScript_Advanced.md#8-closures
 * - Memoization details: docs/JS/01_JavaScript_Advanced.md#9-memoization
 * - Generic classes & constraints: docs/JS/03_TypeScript.md#9-generics
 * ============================================================================
 */

import { Identifiable } from './types';

/**
 * Debounce utility using a closure to delay function execution.
 * 
 * Concept: Closure. The returned function "remembers" the outer timerId variable
 * across multiple calls.
 * Reference: docs/JS/01_JavaScript_Advanced.md#8-closures
 */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timerId: number | undefined;

  return (...args: Parameters<T>) => {
    if (timerId !== undefined) {
      clearTimeout(timerId); // Reset timer if called within the delay threshold
    }
    // Set a new timer to execute the callback
    timerId = window.setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

/**
 * Memoization helper function to cache results of a pure single-argument function.
 * 
 * Concept: Caching results using a closure to lock in the private cache map.
 * Reference: docs/JS/01_JavaScript_Advanced.md#9-memoization
 */
export function memoize<A, R>(fn: (arg: A) => R): (arg: A) => R {
  const cache = new Map<A, R>();

  return (arg: A): R => {
    // If the input parameter exists in our cache map, return it immediately
    if (cache.has(arg)) {
      return cache.get(arg) as R;
    }
    // Otherwise calculate the expensive value, cache it, and return
    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };
}

/**
 * Generic class with a constraint to manage caching of identifiable items.
 * 
 * Concept: Generic Class <T extends Identifiable>. The constraint ensures that
 * any class instance can only store items that conform to the Identifiable shape.
 * Reference: docs/JS/03_TypeScript.md#9-generics
 */
export class CacheManager<T extends Identifiable> {
  private cache = new Map<string | number, T>();

  /**
   * Set item in the cache registry.
   */
  set(item: T): void {
    this.cache.set(item.id, item);
  }

  /**
   * Retrieve item from cache if present.
   */
  get(id: string | number): T | undefined {
    return this.cache.get(id);
  }

  /**
   * Check if item exists in cache.
   */
  has(id: string | number): boolean {
    return this.cache.has(id);
  }

  /**
   * Clear all items in the cache.
   */
  clear(): void {
    this.cache.clear();
  }
}
