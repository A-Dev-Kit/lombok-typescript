import { Global, Module } from '@nestjs/common';
import {
  DEFAULT_LOMBOK_NEST_CONFIG,
  LOMBOK_NEST_CONFIG,
  type LombokNestConfig,
  type LombokNestDynamicModule,
  lombokNestConfigProvider,
} from './lombok.constants.js';

@Global()
@Module({})
export class LombokModule {
  static forRoot(config: LombokNestConfig = {}): LombokNestDynamicModule {
    const merged = { ...DEFAULT_LOMBOK_NEST_CONFIG, ...config };
    return {
      module: LombokModule,
      global: true,
      providers: [lombokNestConfigProvider(merged)],
      exports: [LOMBOK_NEST_CONFIG],
    };
  }
}
