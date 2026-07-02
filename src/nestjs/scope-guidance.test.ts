import { describe, expect, it } from 'vitest';
import { NEST_SCOPE_GUIDANCE, recommendedInjectableScope } from './scope-guidance.js';

describe('scope-guidance', () => {
  it('exposes advisory rows for known decorators', () => {
    expect(NEST_SCOPE_GUIDANCE.length).toBeGreaterThan(0);
    const singleton = NEST_SCOPE_GUIDANCE.find((r) => r.decorator.includes('@Singleton'));
    expect(singleton?.defaultScope).toBe('DEFAULT');
  });

  it('recommends REQUEST scope for memoize', () => {
    expect(recommendedInjectableScope('@Memoize')).toBe('REQUEST');
  });

  it('recommends DEFAULT scope for singleton and retry', () => {
    expect(recommendedInjectableScope('@Singleton')).toBe('DEFAULT');
    expect(recommendedInjectableScope('@Retry')).toBe('DEFAULT');
  });

  it('falls back to DEFAULT for unknown decorators', () => {
    expect(recommendedInjectableScope('@Unknown')).toBe('DEFAULT');
  });
});
