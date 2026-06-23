import { describe, expect, it } from 'vitest';
import './class-validator.js';
import { classValidatorAdapter, runValidation } from './class-validator.js';
import { IsEmail } from 'class-validator';

describe('class-validator adapter', () => {
  it('validates decorator arrays', () => {
    expect(() => runValidation([IsEmail()], 'bad', 'class-validator')).toThrow();
    expect(() => runValidation([IsEmail()], 'a@b.com', 'class-validator')).not.toThrow();
  });

  it('rejects non-array schemas', () => {
    expect(() => classValidatorAdapter.validate({}, 'x')).toThrow(/array of property decorators/);
  });
});
