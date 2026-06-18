/**
 * ============================================================================
 * DevDash Types & Interfaces
 * ============================================================================
 * This file models the domain data for the application using strict TypeScript.
 * 
 * Curriculum References:
 * - Basic Types & Primitives: docs/JS/03_TypeScript.md#2-basic-types-primitives-arrays-tuples
 * - Object Types & Interfaces: docs/JS/03_TypeScript.md#4-object-types-interface-and-type-alias
 * - Utility Types: docs/JS/03_TypeScript.md#11-utility-types
 * ============================================================================
 */

/**
 * Interface representing a Single Product from the DummyJSON API.
 * 
 * Concept: Interfaces describe the "shape" of an object (Object shape contract).
 * Reference: docs/JS/03_TypeScript.md#4-object-types-interface-and-type-alias
 */
export interface Product {
  readonly id: number; // Readonly property: cannot be reassigned after creation
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand?: string; // Optional property (type is string | undefined)
  category: string;
  thumbnail: string;
  images: string[];
}

/**
 * Interface representing the API envelope for a list of products.
 * 
 * Concept: Array types (e.g. Product[]) indicate a list of objects of a specific type.
 * Reference: docs/JS/03_TypeScript.md#2-basic-types-primitives-arrays-tuples
 */
export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * Interface representing a comment on a product.
 * Nested user object has specific required properties.
 */
export interface Comment {
  readonly id: number;
  body: string;
  postId: number;
  user: {
    id: number;
    username: string;
  };
}

/**
 * Interface representing the API envelope for comments list.
 */
export interface CommentsResponse {
  comments: Comment[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * Generic constraint interface. Used for any object that has an ID.
 * 
 * Concept: Generic constraint placeholder. Ensures types must satisfy this shape.
 * Reference: docs/JS/03_TypeScript.md#9-generics
 */
export interface Identifiable {
  id: string | number;
}

/**
 * Utility Type: ProductSummary
 * 
 * Concept: Pick<Type, Keys> constructs a type by picking the set of properties Keys from Type.
 * This is useful to define a smaller DTO (Data Transfer Object) for list views without copying fields manually.
 * Reference: docs/JS/03_TypeScript.md#11-utility-types
 */
export type ProductSummary = Pick<
  Product,
  'id' | 'title' | 'price' | 'category' | 'thumbnail' | 'rating' | 'stock'
>;

/**
 * Utility Type: ProductCreateInput
 * 
 * Concept: Omit<Type, Keys> constructs a type by picking all properties from Type and then removing Keys.
 * Perfect for defining input payload structures (like creating a product, which doesn't have an ID yet).
 * Reference: docs/JS/03_TypeScript.md#11-utility-types
 */
export type ProductCreateInput = Omit<Product, 'id'>;

/**
 * Utility Type: ProductUpdateInput
 * 
 * Concept: Partial<Type> constructs a type with all properties of Type set to optional.
 * Useful for patch update payloads where any subset of fields can be updated.
 * Reference: docs/JS/03_TypeScript.md#11-utility-types
 */
export type ProductUpdateInput = Partial<ProductCreateInput>;

/**
 * Discriminated Union representing the entire UI/application state.
 * 
 * Concept: Discriminated union uses a literal tag ('status') to narrow the union type.
 * Reference: docs/JS/03_TypeScript.md#5-union--intersection-types and docs/JS/03_TypeScript.md#6-type-narrowing
 */
export type AppState =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | {
      status: 'success';
      allProducts: Product[];
      filteredProducts: Product[];
      categoriesList: string[];
      searchQuery: string;
      selectedCategory: string;
      sortBy: string;
    }
  | {
      status: 'detail';
      allProducts: Product[];
      filteredProducts: Product[];
      categoriesList: string[];
      searchQuery: string;
      selectedCategory: string;
      sortBy: string;
      selectedProduct: Product;
      selectedComments: Comment[];
    };

