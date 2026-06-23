import type { ValidatorAdapter } from './adapter.js';
import { registerValidatorAdapter } from './adapter.js';

export const yupAdapter: ValidatorAdapter = {
  validate(schema, value) {
    const yupSchema = schema as { validateSync: (input: unknown) => unknown };
    if (typeof yupSchema?.validateSync !== 'function') {
      throw new TypeError('Yup adapter expects a schema with validateSync()');
    }
    yupSchema.validateSync(value);
  },
};

registerValidatorAdapter('yup', yupAdapter);

export { registerValidatorAdapter, getValidatorAdapter, runValidation } from './adapter.js';
