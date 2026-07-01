import { Retry } from '@a-dev-kit/lombok-typescript/legacy';

export type RetryNestOptions = NonNullable<Parameters<typeof Retry>[0]> & {
  /**
   * When `true`, indicates this method is intended to compose with Nest interceptors
   * (retry here runs inside the method body; interceptors wrap the handler).
   */
  composeWithInterceptors?: boolean;
};

/**
 * Nest-oriented `@Retry` — identical retry semantics; pair with Nest interceptors
 * for cross-cutting concerns at the HTTP layer.
 */
export function RetryNest(options: RetryNestOptions = {}): MethodDecorator {
  const { composeWithInterceptors: _compose, ...retryOptions } = options;
  return Retry(retryOptions);
}
