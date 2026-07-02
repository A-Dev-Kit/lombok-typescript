import { defineConfig } from '@a-dev-kit/lombok-typescript';

export default defineConfig({
  backend: 'legacy',
  codegen: {
    outputDir: '.lombok',
    include: ['src/**/*.ts'],
    exclude: ['**/*.test.ts'],
    tsConfigPath: 'tsconfig.json',
    // This example consumes the workspace package under its GitHub Packages
    // (scoped) name, so generated companions must import from that specifier.
    packageName: '@a-dev-kit/lombok-typescript',
  },
});
