import { expectTypeOf } from 'expect-type';
import { describe, expect, it } from 'vitest';
import {
  defineConfig,
  type BuilderConfig,
  type CodegenConfig,
  type LogConfig,
  type LombokConfig,
  type ToStringConfig,
  type ValidateConfig,
} from './config.js';

describe('defineConfig', () => {
  it('returns the input config verbatim', () => {
    const cfg: LombokConfig = { backend: 'legacy' };
    expect(defineConfig(cfg)).toBe(cfg);
  });

  it('preserves nested config blocks', () => {
    const cfg = defineConfig({
      backend: 'stage3',
      log: { provider: 'winston', defaultLevel: 'debug' },
      builder: { prefix: 'with', buildMethodName: 'create', builderMethodName: 'newBuilder' },
      codegen: { outputDir: 'gen', watch: false },
    });
    expect(cfg.backend).toBe('stage3');
    expect(cfg.log?.provider).toBe('winston');
    expect(cfg.builder?.prefix).toBe('with');
    expect(cfg.codegen?.outputDir).toBe('gen');
  });

  it('accepts an empty config', () => {
    const cfg = defineConfig({});
    expect(cfg).toEqual({});
  });
});

describe('LombokConfig type surface', () => {
  it('backend accepts legacy / stage3 / auto', () => {
    expectTypeOf<LombokConfig['backend']>().toEqualTypeOf<
      'legacy' | 'stage3' | 'auto' | undefined
    >();
  });

  it('all sub-config blocks are optional and Partial', () => {
    expectTypeOf<LombokConfig['log']>().toEqualTypeOf<Partial<LogConfig> | undefined>();
    expectTypeOf<LombokConfig['builder']>().toEqualTypeOf<Partial<BuilderConfig> | undefined>();
    expectTypeOf<LombokConfig['formatToString']>().toEqualTypeOf<
      Partial<ToStringConfig> | undefined
    >();
    expectTypeOf<LombokConfig['validate']>().toEqualTypeOf<Partial<ValidateConfig> | undefined>();
    expectTypeOf<LombokConfig['codegen']>().toEqualTypeOf<Partial<CodegenConfig> | undefined>();
  });
});

describe('CodegenConfig type', () => {
  it('exposes outputDir, include, exclude, tsConfigPath, watch', () => {
    expectTypeOf<CodegenConfig>().toMatchObjectType<{
      outputDir: string;
      include: string[];
      exclude: string[];
      tsConfigPath: string;
      watch: boolean;
    }>();
  });
});
