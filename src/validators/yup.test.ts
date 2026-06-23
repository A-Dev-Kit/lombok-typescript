import { describe, expect, it } from 'vitest';
import * as yup from 'yup';
import './yup.js';
import { getValidatorAdapter, runValidation, yupAdapter } from './yup.js';

describe('yup adapter', () => {
  it('registers and validates schemas', () => {
    expect(getValidatorAdapter('yup')).toBe(yupAdapter);
    const schema = yup.string().min(2);
    expect(() => runValidation(schema, 'a', 'yup')).toThrow();
    expect(() => runValidation(schema, 'ab', 'yup')).not.toThrow();
  });

  it('rejects non-yup schemas', () => {
    expect(() => yupAdapter.validate({}, 'x')).toThrow(/validateSync\(\)/);
  });
});
