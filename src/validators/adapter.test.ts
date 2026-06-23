import { describe, expect, it } from 'vitest';
import { getValidatorAdapter, runValidation } from './adapter.js';

describe('validator adapter', () => {
  it('throws when adapter is not registered', () => {
    expect(() => getValidatorAdapter('class-validator')).toThrow(/No validator adapter registered/);
  });

  it('runs BYOV function schemas', () => {
    const schema = (value: unknown) => {
      if (value !== 'ok') throw new Error('invalid');
    };
    expect(() => runValidation(schema, 'ok', 'zod')).not.toThrow();
    expect(() => runValidation(schema, 'bad', 'zod')).toThrow('invalid');
  });
});
