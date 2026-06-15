# Configuration

See [defineConfig](https://github.com/A-Dev-Kit/lombok-typescript/blob/main/src/config.ts) fields: `backend`, `builder`, `toString`, `validate`, `codegen`.

```ts
import { defineConfig } from 'lombok-typescript';

export default defineConfig({
  backend: 'legacy',
  codegen: {
    outputDir: '.lombok',
    include: ['src/**/*.ts'],
    exclude: ['**/*.test.ts'],
    tsConfigPath: 'tsconfig.json',
  },
});
```
