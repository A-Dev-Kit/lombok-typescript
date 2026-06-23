import { describe, expect, it } from 'vitest';
import { runValidation } from './adapter.js';

describe('validator adapter', () => {
  it('runs BYOV function schemas', () => {
    const schema = (value: unknown) => {
      if (value !== 'ok') throw new Error('invalid');
    };
    expect(() => runValidation(schema, 'ok', 'zod')).not.toThrow();
    expect(() => runValidation(schema, 'bad', 'zod')).toThrow('invalid');
  });
});
