# lombok-typescript

[Docs](https://a-dev-kit.github.io/lombok-typescript/)
[GitHub Packages](https://github.com/A-Dev-Kit/lombok-typescript/pkgs/npm/lombok-typescript)
[npm latest](https://www.npmjs.com/package/lombok-typescript)
[npm preview](https://www.npmjs.com/package/lombok-typescript/v/preview)
[coverage](https://codecov.io/gh/A-Dev-Kit/lombok-typescript)
[Node](https://nodejs.org/)
[TypeScript](https://www.typescriptlang.org/)
[License: MIT](./LICENSE)

**Documentation:** [a-dev-kit.github.io/lombok-typescript](https://a-dev-kit.github.io/lombok-typescript/) — full guides and decorator reference.

A TypeScript library inspired by Java's [Project Lombok](https://projectlombok.org/) and Gang-of-Four design patterns, delivered as decorators with compile-time codegen. Supports legacy `experimentalDecorators` and Stage 3 ECMAScript decorators via separate entry points. NestJS-friendly.

## What you get

- **Lombok-style codegen** — `@Data`, `@Builder`, `@Getter`/`@Setter`, `@Value`, `@With`, `@Equals`, `@ToString`, `@NonNull`, `@Log`, `@Accessors`, `@UtilityClass`, `@FieldDefaults`, `@Delegate`
- **Design-pattern decorators** — creational (`@Singleton`, `@Factory`, …), behavioral (`@Strategy`, `@Observer`, …), structural (`@Proxy`, `@Composite`, …)
- **TypeScript utilities** — `@Memoize`, `@Retry`, `@Validate`, `@Debounce`, `@Throttle`, `@Trace`, `@Serializable`, `@DeepFreeze`
- **Dual decorator APIs** — `./legacy` for NestJS and existing decorator stacks; `./stage3` for TS 6.0+ without `experimentalDecorators`
- **CLI** — `lombok-ts init`, `generate`, `clean`, `watch`

## Install

### GitHub Packages (full release line)

```bash
# .npmrc in your project (or user-level)
echo "@a-dev-kit:registry=https://npm.pkg.github.com" >> .npmrc

pnpm add @a-dev-kit/lombok-typescript@0.10.0
# or: npm install @a-dev-kit/lombok-typescript@0.10.0
```

Pin any released version (`0.1.0` through `0.10.0`). See [CONTRIBUTING.md — Release process](./CONTRIBUTING.md#release-process).

### npmjs.org

```bash
npm install lombok-typescript              # @latest — current stable on npm
npm install lombok-typescript@preview      # @preview — one version ahead
```

`@latest` is the current stable release; `@preview` is one version ahead.

### Local development

```bash
git clone https://github.com/A-Dev-Kit/lombok-typescript.git
cd lombok-typescript && pnpm install && pnpm build && pnpm link --global
```

## Decorator catalog

### Lombok-style

`@NonNull`, `@ToString`, `@Builder`, `@Data`, `@Value`, `@With`, `@Equals`, `@Getter`, `@Setter`, `@Log`, `@Accessors`, `@UtilityClass`, `@FieldDefaults`, `@Delegate`

### Creational patterns

`@Singleton`, `@Prototype`, `@Factory`, `@AbstractFactory`

### Behavioral patterns

`@Strategy`, `@State`, `@Command`, `@Memento`, `@Observable`, `@ChainOfResponsibility`, `@Iterable`, `@Visitor`, `@Visitable`, `@Hook`, `@TemplateMethod`

### Structural patterns

`@Flyweight`, `@Proxy`, `@Composite`, `@Wraps`

### TypeScript utilities

`@Memoize`, `@Retry`, `@Validate`, `@Debounce`, `@Throttle`, `@Trace`, `@Serializable`, `@DeepFreeze`

### Marker decorators

`@Adapter`, `@Bridge`, `@Facade`, `@Mediator`, `@Interpreter` — document intent; no generated code in v0.10.0.

## Pick a decorator standard

### Legacy (`lombok-typescript/legacy`)

For NestJS, TypeORM, and most existing decorator-based projects.

```jsonc
{ "compilerOptions": { "experimentalDecorators": true, "emitDecoratorMetadata": true } }
```

### Stage 3 (`lombok-typescript/stage3`)

For TS 6.0+ projects without `experimentalDecorators`.

```jsonc
{ "compilerOptions": { "experimentalDecorators": false } }
```

## Quick start

```bash
npx lombok-ts init
npx lombok-ts generate
```

```ts
import { Data, Builder, NonNull, Memoize, Singleton } from '@a-dev-kit/lombok-typescript/legacy';

@Data
@Builder
class User {
  @NonNull name!: string;
  age!: number;
}

@Singleton
class Cache {
  @Memoize()
  get(key: string) {
    return key;
  }
}
```

After codegen, call `applyAllGenerated` from the `.lombok/` companion file. See the [getting started guide](https://a-dev-kit.github.io/lombok-typescript/guide/getting-started).

## CLI


| Command              | Description                                   |
| -------------------- | --------------------------------------------- |
| `lombok-ts generate` | Emit `.lombok.ts` + `.lombok.d.ts` companions |
| `lombok-ts init`     | Create `lombok.config.ts`                     |
| `lombok-ts clean`    | Remove `.lombok/`, `dist/`, `coverage/`       |
| `lombok-ts watch`    | Watch sources and regenerate on change        |


## Examples

- [examples/plain-ts](./examples/plain-ts/) — legacy backend + codegen
- [examples/nestjs](./examples/nestjs/) — `@Injectable()` with `@Singleton`, `@Factory`, `@Memoize`

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Tests require **95%+** coverage on changed code. Docs: `pnpm --dir docs-site dev`.

## License

[MIT](./LICENSE)