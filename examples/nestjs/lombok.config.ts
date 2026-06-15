import { defineConfig } from 'lombok-typescript';

export default defineConfig({
  backend: 'legacy',
  codegen: {
    outputDir: '.lombok',
    include: ['src/**/*.ts'],
    tsConfigPath: 'tsconfig.json',
  },
});
