# Structural and creational GoF patterns (Phase 4)

Phase 4 adds seven decorators across v0.7.0 and v0.8.0. See the VitePress site for full reference:

- [@Flyweight](https://a-dev-kit.github.io/lombok-typescript/decorators/flyweight)
- [@Proxy](https://a-dev-kit.github.io/lombok-typescript/decorators/proxy)
- [@Composite](https://a-dev-kit.github.io/lombok-typescript/decorators/composite)
- [@Wraps](https://a-dev-kit.github.io/lombok-typescript/decorators/wraps)
- [@TemplateMethod / @Hook](https://a-dev-kit.github.io/lombok-typescript/decorators/template-method)
- [@AbstractFactory](https://a-dev-kit.github.io/lombok-typescript/decorators/abstract-factory)
- [@Visitor / @Visitable](https://a-dev-kit.github.io/lombok-typescript/decorators/visitor)

## Runnable example

```bash
cd examples/plain-ts
pnpm generate
pnpm start
```

Source: `examples/plain-ts/src/structural.ts` (classes) and `main.ts` (runtime demo).

## Codegen decorators

Run `lombok-ts generate` after changing `@TemplateMethod`, `@AbstractFactory`, or `@Visitable` classes, then call `applyAllGenerated` from the companion file.
