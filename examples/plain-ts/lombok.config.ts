import { defineConfig } from '@a-dev-kit/lombok-typescript';

export default defineConfig({
  backend: 'legacy',
  codegen: {
    outputDir: '.lombok',
    include: ['src/**/*.ts'],
    exclude: ['**/*.test.ts'],
    tsConfigPath: 'tsconfig.json',
  },
});
