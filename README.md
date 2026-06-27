# lombok-typescript

[![Docs](https://img.shields.io/badge/docs-a--dev--kit.github.io-5c6bc0?style=flat-square)](https://a-dev-kit.github.io/lombok-typescript/)
[![GitHub Packages](https://img.shields.io/github/v/tag/A-Dev-Kit/lombok-typescript?label=GitHub%20Packages&color=24292f&logo=github)](https://github.com/A-Dev-Kit/lombok-typescript/pkgs/npm/lombok-typescript)
[![npm latest](https://img.shields.io/npm/v/lombok-typescript/latest?label=latest&logo=npm&color=007ec6)](https://www.npmjs.com/package/lombok-typescript)
[![npm preview](https://img.shields.io/npm/v/lombok-typescript/preview?label=preview&logo=npm&color=007ec6)](https://www.npmjs.com/package/lombok-typescript/v/preview)

[![CI](https://img.shields.io/github/actions/workflow/status/A-Dev-Kit/lombok-typescript-planning/ci.yml?branch=main&label=CI&logo=github&color=4c1)](https://github.com/A-Dev-Kit/lombok-typescript-planning/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/A-Dev-Kit/lombok-typescript/graph/badge.svg)](https://codecov.io/gh/A-Dev-Kit/lombok-typescript)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com%2FA-Dev-Kit%2Flombok-typescript/badge)](https://securityscorecards.dev/viewer/?uri=github.com/A-Dev-Kit/lombok-typescript)
[![Node.js](https://img.shields.io/badge/Node.js-22+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0+-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-007ec6.svg)](./LICENSE)

[![bundle size](https://img.shields.io/bundlephobia/minzip/lombok-typescript?label=bundle%20size&color=007ec6)](https://bundlephobia.com/package/lombok-typescript)
[![deps.dev](https://img.shields.io/badge/deps.dev-package-007ec6?logo=googlechrome)](https://deps.dev/npm/lombok-typescript)
[![Socket](https://img.shields.io/badge/Socket-Supply%20Chain%2078-007ec6?logo=socket)](https://socket.dev/npm/package/lombok-typescript)
[![npm downloads](https://img.shields.io/npm/dm/lombok-typescript?label=downloads&color=007ec6&logo=npm)](https://www.npmjs.com/package/lombok-typescript)
[![Snyk](https://img.shields.io/snyk/vulnerabilities/npm/lombok-typescript?label=snyk&color=007ec6)](https://snyk.io/advisor/npm-package/lombok-typescript)

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
