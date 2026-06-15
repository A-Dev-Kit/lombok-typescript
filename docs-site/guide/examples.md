# Examples

Runnable examples live in the repository under `examples/`. CI runs `lombok-ts generate` and `tsc --noEmit` on both after every build.

## plain-ts

**Path:** [examples/plain-ts](https://github.com/A-Dev-Kit/lombok-typescript/tree/main/examples/plain-ts)

Legacy backend with codegen and runtime decorators:

- `@Data`, `@Builder`, `@ToString`, `@NonNull` on `User`
- `@Singleton`, `@Memoize` on `UserService`

```bash
git clone https://github.com/A-Dev-Kit/lombok-typescript.git
cd lombok-typescript
pnpm install && pnpm build

cd examples/plain-ts
node ../../dist/cli/index.js generate
pnpm exec tsc --noEmit
```

## nestjs

**Path:** [examples/nestjs](https://github.com/A-Dev-Kit/lombok-typescript/tree/main/examples/nestjs)

Shows interoperability with `@nestjs/common` decorators:

- `@Injectable()` + `@Singleton` on `AppService`
- `@Factory` registry with `createFromFactory`
- `@Memoize` on service methods

```bash
cd examples/nestjs
node ../../dist/cli/index.js generate
pnpm exec tsc --noEmit
```

## What to try

1. Add a field to a `@Data` class, run `generate`, and inspect `.lombok/`.
2. Toggle `backend: 'stage3'` in `lombok.config.ts` (with matching tsconfig) to compare backends.
3. Read [Architecture](/guide/architecture) for how `applyAllGenerated` wires codegen output.

::: warning Historical previews
The older `docs/example/` markdown files are superseded by this site and the `examples/` apps. They may describe future-phase decorators not yet implemented.
:::
