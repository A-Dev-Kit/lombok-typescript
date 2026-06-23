import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'core/index': 'src/core/index.ts',
    'legacy/index': 'src/legacy/index.ts',
    'stage3/index': 'src/stage3/index.ts',
    'codegen/index': 'src/codegen/index.ts',
    'cli/index': 'src/cli/index.ts',
    'observers/rxjs': 'src/observers/rxjs.ts',
    'observers/mobx': 'src/observers/mobx.ts',
    'validators/zod': 'src/validators/zod.ts',
    'validators/yup': 'src/validators/yup.ts',
    'validators/class-validator': 'src/validators/class-validator.ts',
  },
  format: ['esm', 'cjs'],
  dts: {
    // tsup injects baseUrl for rollup-plugin-dts (egoist/tsup#1388); TS 6 deprecates it
    compilerOptions: {
      ignoreDeprecations: '6.0',
    },
  },
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  minify: false,
  external: ['typescript', 'ts-morph', 'reflect-metadata', 'rxjs', 'mobx', 'zod', 'yup', 'class-validator'],
  outExtension({ format }) {
    return { js: format === 'cjs' ? '.cjs' : '.js' };
  },
  onSuccess: 'node scripts/post-build.mjs',
});
