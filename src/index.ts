/**
 * lombok-typescript
 *
 * Lombok-like decorators and code generation for TypeScript.
 * Reduce boilerplate with powerful annotations.
 *
 * @example
 * ```typescript
 * import { Data, Builder, NonNull } from 'lombok-typescript';
 *
 * @Data
 * @Builder
 * class User {
 *   @NonNull name: string;
 *   age: number;
 * }
 *
 * const user = User.builder().name('John').age(25).build();
 * console.log(user.toString()); // User(name=John, age=25)
 * ```
 */

import 'reflect-metadata';

// Re-export all decorators
export * from './decorators';

// Re-export codegen utilities
export * from './codegen';

// Re-export configuration
export { defineConfig } from './config';
export type { LombokConfig } from './config';

// Version
export const VERSION = '0.1.0';

