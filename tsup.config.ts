import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'decorators/index': 'src/decorators/index.ts',
    'codegen/index': 'src/codegen/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  minify: false,
  external: ['typescript'],
  esbuildOptions(options) {
    options.footer = {
      js: 'module.exports = module.exports.default || module.exports;',
    };
  },
});

