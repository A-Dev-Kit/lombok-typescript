# Examples

Walkthroughs grouped by what you're trying to do. The first three cover what's actually wired up today (you can install the package, configure your project, run the CLI). The last five preview what Phase 1 ships.

## Setup and tooling (works today)

- [01-installation-and-tsconfig.md](./01-installation-and-tsconfig.md) install the package, set up `tsconfig.json` for either backend
- [02-lombok-config.md](./02-lombok-config.md) every field of `lombok.config.ts`, with practical examples
- [03-cli.md](./03-cli.md) running `lombok-ts generate`, `init`, `clean`, `watch` on your own project

## Decorator usage (Phase 1+ preview)

The decorators below aren't implemented yet. The examples describe the planned API so you can see where the library is heading. They land in Phase 1; expect minor adjustments when they actually ship.

- [04-data-classes.md](./04-data-classes.md) `@Data`, `@Value`, `@Builder`, `@With`, `@ToString`, `@Equals`
- [05-validation.md](./05-validation.md) `@NonNull`, `@Validate`
- [06-creational-patterns.md](./06-creational-patterns.md) `@Singleton`, `@Factory`, `@Prototype`
- [07-method-wrappers.md](./07-method-wrappers.md) `@Memoize`, `@Retry`, `@Debounce`, `@Throttle`, `@Trace`
- [08-behavioral-patterns.md](./08-behavioral-patterns.md) `@Strategy`, `@State`, `@Observer` / `@Observable`, `@Command`, `@Memento`

If you're curious about every decorator in scope (including the marker-only ones not detailed here) or the timing of when each batch ships, watch the project README; that detail will land there as the implementation progresses.
