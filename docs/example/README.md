# Examples (historical previews)

> **Superseded.** Canonical documentation lives on **[GitHub Pages](https://a-dev-kit.github.io/lombok-typescript/)** and in the runnable apps under [`examples/`](../../examples/). This folder is kept for early Phase 0 narrative; prefer the docs site for v0.1.

Walkthroughs grouped by what you're trying to do. The first three cover setup and tooling. The rest mix **shipped v0.1** decorators with **future-phase previews**.

## Setup and tooling (works today)

- [01-installation-and-tsconfig.md](./01-installation-and-tsconfig.md) install the package, set up `tsconfig.json` for either backend
- [02-lombok-config.md](./02-lombok-config.md) every field of `lombok.config.ts`, with practical examples
- [03-cli.md](./03-cli.md) running `lombok-ts generate`, `init`, `clean`, `watch` on your own project

## Decorator usage

- [04-data-classes.md](./04-data-classes.md) — **v0.1 shipped:** `@Data`, `@Builder`, `@ToString`, `@NonNull`. Preview: `@Value`, `@With`, `@Equals`, etc.
- [05-validation.md](./05-validation.md) — **v0.1:** `@NonNull`. **v0.9:** `@Validate`
- [06-creational-patterns.md](./06-creational-patterns.md) — **v0.1 shipped:** `@Singleton`, `@Factory`, `@Prototype`, `@Builder`. **v0.4:** `@AbstractFactory`
- [07-method-wrappers.md](./07-method-wrappers.md) — **v0.1:** `@Memoize`. **v0.9:** `@Retry`, `@Debounce`, `@Throttle`, `@Trace`
- [08-behavioral-patterns.md](./08-behavioral-patterns.md) — **Preview only** (Phase 3): `@Strategy`, `@Observer`, etc.

For current API details see the [decorator reference](https://a-dev-kit.github.io/lombok-typescript/decorators/overview).
