import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.{test,spec}.ts', 'src/**/index.ts'],
    },
  },
  resolve: {
    alias: {
      '@': './src',
      '@decorators': './src/decorators',
      '@codegen': './src/codegen',
      '@utils': './src/utils',
    },
  },
});

