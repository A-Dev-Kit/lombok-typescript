export interface ValidatorAdapter {
  validate(schema: unknown, value: unknown): void;
}

export type ValidateProvider = 'zod' | 'yup' | 'class-validator';

const adapters = new Map<ValidateProvider, ValidatorAdapter>();

export function registerValidatorAdapter(
  provider: ValidateProvider,
  adapter: ValidatorAdapter,
): void {
  adapters.set(provider, adapter);
}

export function getValidatorAdapter(provider: ValidateProvider): ValidatorAdapter {
  const adapter = adapters.get(provider);
  if (!adapter) {
    throw new Error(
      `No validator adapter registered for "${provider}". Import from lombok-typescript/validators/${provider}.`,
    );
  }
  return adapter;
}

export function runValidation(schema: unknown, value: unknown, provider: ValidateProvider): void {
  if (typeof schema === 'function') {
    (schema as (v: unknown) => void)(value);
    return;
  }
  getValidatorAdapter(provider).validate(schema, value);
}
