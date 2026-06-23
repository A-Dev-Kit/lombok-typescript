import type { ValidatorAdapter } from './adapter.js';
import { registerValidatorAdapter } from './adapter.js';

export const zodAdapter: ValidatorAdapter = {
  validate(schema, value) {
    const zodSchema = schema as { parse: (input: unknown) => unknown };
    if (typeof zodSchema?.parse !== 'function') {
      throw new TypeError('Zod adapter expects a schema with a parse() method');
    }
    zodSchema.parse(value);
  },
};

registerValidatorAdapter('zod', zodAdapter);

export { registerValidatorAdapter, getValidatorAdapter, runValidation } from './adapter.js';
