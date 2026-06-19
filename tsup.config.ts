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
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  minify: false,
  external: ['typescript', 'ts-morph', 'reflect-metadata', 'rxjs', 'mobx'],
  outExtension({ format }) {
    return { js: format === 'cjs' ? '.cjs' : '.js' };
  },
  onSuccess: 'node scripts/post-build.mjs',
});
