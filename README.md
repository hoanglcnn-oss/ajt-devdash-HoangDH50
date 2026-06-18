# DevDash — Typed Async Dashboard

**DevDash** is a modern, single-page, strictly-typed dashboard built with **Vite**, **TypeScript**, and native browser technologies. It fetches product data, category listings, and review comments asynchronously from the public **DummyJSON API**, transforms the data with functional patterns, and displays it inside a dark-themed glassmorphic user interface.

## 🚀 Features List (Rubric Matching)

Here is a summary of all implemented features mapped to the assignment's scoring tiers:

### 🟩 Pass Tier (6.0 Points) — Completed
*   **TypeScript Strict Mode [✓]**: The project compiles with `"strict": true` and contains zero type errors or warnings.
*   **Domain Data Modelling [✓]**: Strict interfaces representing the API endpoints are declared in [`src/types.ts`](./src/types.ts).
*   **Async/Await Renders [✓]**: Fully asynchronous list rendering with spinner loading displays and retryable network error boxes.
*   **Type Annotations [✓]**: All functions, variables, callbacks, and parameters are correctly type-annotated with zero `any` declarations.
*   **Error State UI [✓]**: Handled via `try/catch/finally` inside [`src/main.ts`](./src/main.ts) with full UX recovery.
*   **Detail View [✓]**: Selecting a card launches a modal showing product profiles alongside customer review comments.

### 🟦 Good Tier (8.0 Points) — Completed
*   **HOF Search & Filter [✓]**: Filtering and sorting pipeline built purely with `Array.prototype.filter`, `Array.prototype.map`, and `Array.prototype.sort` (utilizing spread copies to preserve immutability).
*   **Generic `fetchJson<T>` Helper [✓]**: A reusable, type-safe API client helper in [`src/api.ts`](./src/api.ts) that checks `response.ok` status.
*   **Concurrently Loading Promises [✓]**: Parallel requests utilizing `Promise.all` are implemented on bootstrap (initial products + categories) and detail modal launches (product item + comments).
*   **Union/Literal App State [✓]**: Application state is modeled as a literal status union (`'loading' | 'error' | 'success' | 'detail'`) in [`src/types.ts`](./src/types.ts).

### 🟪 Excellent Tier (10.0 Points) — Completed
*   **Discriminated Union State [✓]**: Unified state is exhaustively narrowed in the UI router `renderApp()` inside [`src/ui.ts`](./src/ui.ts) using `assertNever(state)`.
*   **Utility Types usage [✓]**: Utilized `Pick` (to build `ProductSummary` DTOs), `Omit` (to build `ProductCreateInput`), and `Partial` (for updates payload model).
*   **Generic Class with Constraints [✓]**: Designed a custom `CacheManager<T extends Identifiable>` inside [`src/utils.ts`](./src/utils.ts) to cache details call responses.
*   **Debounce & Memoize Closures [✓]**:
    *   `debounce` limits the text input refiltering calls to prevent keypress layout stuttering.
    *   `memoize` caches results of analytics category distributions to prevent redundant loop scans on state refreshes.
*   **Clean Module Architecture [✓]**: Structured code base with clear responsibilities divided between modules.

---

## 📖 Applied Advanced Concepts Index

To help you learn while reviewing the source code, educational comments referencing specific chapters have been added directly to the code files:

1.  **Scope, Closures, and Debounce/Memoize**
    *   See [`src/utils.ts`](./src/utils.ts#L22) for the private variable closure inside `debounce`.
    *   See [`src/utils.ts`](./src/utils.ts#L43) for the Map closure inside `memoize`.
    *   References: `01_JavaScript_Advanced.md#8-closures` and `01_JavaScript_Advanced.md#9-memoization`
2.  **Event Loop & Microtask Priority**
    *   Explained in the `setTimeout` handling inside `debounce`.
    *   References: `02_Asynchronous_JavaScript.md#1-the-event-loop` and `02_Asynchronous_JavaScript.md#2-timers`
3.  **Parallel Loading with Promise.all**
    *   See [`src/main.ts`](./src/main.ts#L130) and [`src/main.ts`](./src/main.ts#L254) for concurrent calls.
    *   References: `02_Asynchronous_JavaScript.md#5-promise-combinators-promiseall-and-friends`
4.  **Generics & Constraints**
    *   See [`src/api.ts`](./src/api.ts#L23) for `fetchJson<T>`.
    *   See [`src/utils.ts`](./src/utils.ts#L61) for `CacheManager<T extends Identifiable>`.
    *   References: `03_TypeScript.md#9-generics`
5.  **Exhaustive Narrowing**
    *   See [`src/ui.ts`](./src/ui.ts#L268) for the compiler check on `AppState`.
    *   References: `03_TypeScript.md#6-type-narrowing`
6.  **Utility Types**
    *   See [`src/types.ts`](./src/types.ts#L88) for `Pick`, `Omit`, and `Partial`.
    *   References: `03_TypeScript.md#11-utility-types`

---

## 🛠️ Project Structure

```
ajt-devdash/
├── index.html             # Main HTML structural layout
├── package.json           # Scripts and dependencies
├── tsconfig.json          # Strict TypeScript configurations
├── styles.css             # Glassmorphism/Dark Theme CSS
├── src/
│   ├── main.ts            # Bootstrapper & Event Handlers
│   ├── types.ts           # Interfaces, Unions, & Utility types
│   ├── api.ts             # fetchJson<T> & Endpoint methods
│   ├── state.ts           # Pub/Sub App State Manager
│   ├── ui.ts              # DOM render functions & Exhaustive router
│   └── utils.ts           # Closures (Debounce/Memoize) & CacheManager
└── README.md              # Project Documentation
```

---

## ⚙️ Local Development Instructions

### Prerequisites
Make sure you have [Node.js (LTS version)](https://nodejs.org/) installed.

### Setup and Running
1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Start Local Dev Server**:
    ```bash
    npm run dev
    ```
    Open the local server URL (usually `http://localhost:5173`) in your web browser.

3.  **Compile & Check Strict Types**:
    ```bash
    npx tsc
    ```
4.  **Build Production Bundle**:
    ```bash
    npm run build
    ```
