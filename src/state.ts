/**
 * ============================================================================
 * DevDash State Store
 * ============================================================================
 * Manages the global state of the application using a Pub/Sub pattern.
 * Enables reactive updates to the UI whenever the state transitions.
 * 
 * Curriculum References:
 * - Closures (listeners array hidden inside module scope): docs/JS/01_JavaScript_Advanced.md#8-closures
 * - Discriminated Unions for state: docs/JS/03_TypeScript.md#6-type-narrowing (Discriminated unions section)
 * ============================================================================
 */

import { AppState } from './types';

// Private state variables, hidden from the outside (Encapsulation via Module scope)
let state: AppState = { status: 'loading' };

type StateListener = (state: AppState) => void;
const listeners: StateListener[] = [];

/**
 * Get the current read-only snapshot of the application state.
 */
export function getState(): AppState {
  return state;
}

/**
 * Transition the application to a new state and notify all subscribed UI listeners.
 */
export function setState(newState: AppState): void {
  state = newState;
  listeners.forEach((listener) => {
    try {
      listener(state);
    } catch (e) {
      console.error('State listener error:', e);
    }
  });
}

/**
 * Subscribe to state updates. Returns an unsubscribe function.
 * 
 * Concept: Closure. The returned unsubscribe function maintains a reference to
 * the outer listener variable and removes it from the listeners list when called.
 * Reference: docs/JS/01_JavaScript_Advanced.md#8-closures
 */
export function subscribe(listener: StateListener): () => void {
  listeners.push(listener);
  
  // Return closure to easily unsubscribe
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}
