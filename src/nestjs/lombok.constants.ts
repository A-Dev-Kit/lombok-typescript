import type { DynamicModule, Provider } from '@nestjs/common';

export const LOMBOK_NEST_CONFIG = Symbol('LOMBOK_NEST_CONFIG');

export type NestProviderScope = 'DEFAULT' | 'REQUEST' | 'TRANSIENT';

export interface LombokNestConfig {
  /** Use Nest `Logger` for `@LogNest`. Default `'nest'`. */
  logAdapter?: 'nest' | 'console';
  /** Advisory default for `@Injectable({ scope })` when using `@Singleton`. */
  defaultProviderScope?: NestProviderScope;
}

export const DEFAULT_LOMBOK_NEST_CONFIG: LombokNestConfig = {
  logAdapter: 'nest',
  defaultProviderScope: 'DEFAULT',
};

export function lombokNestConfigProvider(config: LombokNestConfig): Provider {
  return {
    provide: LOMBOK_NEST_CONFIG,
    useValue: { ...DEFAULT_LOMBOK_NEST_CONFIG, ...config },
  };
}

export type LombokNestDynamicModule = DynamicModule;
