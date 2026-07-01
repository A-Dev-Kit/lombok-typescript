import type { NestProviderScope } from './lombok.constants.js';

export interface ScopeGuidanceRow {
  decorator: string;
  defaultScope: NestProviderScope;
  notes: string;
}

/** Advisory table for Nest provider scope + lombok decorators. */
export const NEST_SCOPE_GUIDANCE: readonly ScopeGuidanceRow[] = [
  {
    decorator: '@Singleton',
    defaultScope: 'DEFAULT',
    notes: 'Maps to one Nest provider instance. Use @Injectable() without scope or scope DEFAULT.',
  },
  {
    decorator: '@Memoize / @MemoizeNest',
    defaultScope: 'REQUEST',
    notes: 'Cache is per decorated method closure. On REQUEST-scoped providers each request gets a fresh instance and cache.',
  },
  {
    decorator: '@Flyweight',
    defaultScope: 'DEFAULT',
    notes: 'Shared pool is process-wide; avoid storing request-specific state in flyweight instances.',
  },
  {
    decorator: '@Retry / @RetryNest',
    defaultScope: 'DEFAULT',
    notes: 'Method-level retries run inside the handler. Use Nest interceptors for HTTP-level retry policies.',
  },
];

export function recommendedInjectableScope(decoratorName: string): NestProviderScope {
  const row = NEST_SCOPE_GUIDANCE.find((r) => r.decorator.includes(decoratorName));
  return row?.defaultScope ?? 'DEFAULT';
}
