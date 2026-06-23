import { validateSync } from 'class-validator';
import type { ValidatorAdapter } from './adapter.js';
import { registerValidatorAdapter } from './adapter.js';

export const classValidatorAdapter: ValidatorAdapter = {
  validate(schema, value) {
    const decorators = schema as Array<(target: object, propertyKey: string) => void>;
    if (!Array.isArray(decorators)) {
      throw new TypeError('class-validator adapter expects an array of property decorators');
    }
    const target: Record<string, unknown> = { value };
    for (const decorator of decorators) {
      decorator(target, 'value');
    }
    const errors = validateSync(target);
    if (errors.length > 0) {
      throw errors[0];
    }
  },
};

registerValidatorAdapter('class-validator', classValidatorAdapter);

export { registerValidatorAdapter, getValidatorAdapter, runValidation } from './adapter.js';
