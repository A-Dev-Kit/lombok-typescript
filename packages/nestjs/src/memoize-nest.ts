import { Memoize } from '@a-dev-kit/lombok-typescript/legacy';

export type MemoizeNestOptions = NonNullable<Parameters<typeof Memoize>[0]> & {
  /**
   * When `true`, document that caches are per-instance — safe for `REQUEST` scope.
   * For `DEFAULT` singleton providers, prefer short TTL or avoid caching request data.
   */
  requestSafe?: boolean;
};

/**
 * Nest-aware `@Memoize` — same runtime behavior; use with `REQUEST` scope providers
 * or short TTL on singletons. See scope guide in docs.
 */
export function MemoizeNest(options: MemoizeNestOptions = {}): MethodDecorator {
  const { requestSafe: _requestSafe, ...memoizeOptions } = options;
  return Memoize(memoizeOptions);
}
