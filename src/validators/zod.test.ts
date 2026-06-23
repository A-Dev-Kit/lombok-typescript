import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import './zod.js';
import { getValidatorAdapter, runValidation, zodAdapter } from './zod.js';

describe('zod adapter', () => {
  it('registers and validates schemas', () => {
    expect(getValidatorAdapter('zod')).toBe(zodAdapter);
    const schema = z.string().min(2);
    expect(() => runValidation(schema, 'a', 'zod')).toThrow();
    expect(() => runValidation(schema, 'ab', 'zod')).not.toThrow();
  });

  it('rejects non-zod schemas', () => {
    expect(() => zodAdapter.validate({}, 'x')).toThrow(/parse\(\)/);
  });
});
