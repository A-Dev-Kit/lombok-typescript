import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    reporters: ['default'],
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.{test,spec}.ts',
        'src/**/index.ts',
        'src/**/types.ts',
        'src/cli/index.ts',
      ],
      thresholds: {
        lines: 95,
        functions: 95,
        // Vitest 4 v8 branch accounting reports ~89% for the same suite that passed at 90% on Vitest 3
        branches: 89,
        statements: 95,
      },
      reportsDirectory: './coverage',
    },
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
      '@core': new URL('./src/core', import.meta.url).pathname,
      '@legacy': new URL('./src/legacy', import.meta.url).pathname,
      '@stage3': new URL('./src/stage3', import.meta.url).pathname,
      '@codegen': new URL('./src/codegen', import.meta.url).pathname,
      '@cli': new URL('./src/cli', import.meta.url).pathname,
      '@utils': new URL('./src/utils', import.meta.url).pathname,
    },
  },
});
