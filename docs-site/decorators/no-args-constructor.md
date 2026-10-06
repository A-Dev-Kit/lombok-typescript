# NoArgsConstructor

**Codegen a static factory on the class that constructs an instance with no arguments.**
The TypeScript analogue of Java Lombok's `@NoArgsConstructor` — ships as a static factory
alongside the user's own constructor rather than replacing it.

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Codegen            |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | Yes                |

## Java parity — with a twist

Java Lombok's `@NoArgsConstructor` generates `public Marker()` directly on the class.
TypeScript decorators can't add that constructor beside one the user already wrote
without wrapping-and-replacing the class reference, which breaks `instanceof` identity
for any pre-existing imports. The port here is additive: codegen emits a **static
factory** `Class.noArgs()` on the class, so the user's own constructor stays intact and
`instanceof` works unchanged. The factory uses `Object.create(Class.prototype)`, so it
does not invoke any user-defined constructor and does not run field initializers.

```ts
import { NoArgsConstructor } from 'lombok-typescript/legacy';

@NoArgsConstructor()
class Marker {
  // Type shim; the real body is installed by applyAllGenerated() from the companion.
  declare static noArgs: () => Marker;
}

const m = Marker.noArgs();
m instanceof Marker; // true
```

## Options

| Option       | Type                                   | Default    | Purpose                                                                                                                                                     |
| ------------ | -------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `staticName` | `string`                               | `'noArgs'` | Name of the generated static factory. Matches Java Lombok's `@NoArgsConstructor(staticName = "create")`.                                                    |
| `access`     | `'public' \| 'protected' \| 'private'` | `'public'` | Documented visibility of the factory. TypeScript has no runtime access modifiers, so this is recorded in metadata for tooling only; no runtime enforcement. |
| `force`      | `boolean`                              | `false`    | Allow the factory when a required instance field has no initializer. Those fields stay `undefined` (no Java-style `0` / `false` / `null` zeroing).          |

Use `@NoArgsConstructor({ staticName: 'create' })` for `Marker.create()`.

## Semantics

- **No field assignments.** The factory does not copy field initializers into the
  instance. If you need those defaults, call `new Marker()` yourself or use `@Builder`.
- **`force`.** Without `{ force: true }`, codegen fails when an instance field is
  required (not optional, no initializer) and names the class and the field. Static
  fields and `declare static` type shims are ignored. With `force`, the factory is
  still emitted and those fields stay `undefined`.
- **`Object.create`-based construction** means the user's constructor is **not**
  invoked.
- **No prototype pollution.** The decorator writes metadata only; the codegen companion
  installs the factory onto the class constructor via `applyAllGenerated(handlers)`.
- **Introspection.** Metadata is stored under `MetadataKeys.NO_ARGS_CONSTRUCTOR`
  (`{ staticName, access, force }`) at class scope.

## Composition

- Stacking with `@Data` or `@Value` is rejected at codegen time — those decorators
  already emit a constructor via `emitDataConstructor`. The validator surfaces a clear
  error naming the class.
- `@NoArgsConstructor` + `@AllArgsConstructor` compose: `Class.noArgs()` and
  `Class.allArgs(...)` sit side-by-side. Codegen rejects the pair when both resolve to
  the same `staticName`.
- `@NoArgsConstructor` + `@Builder` compose cleanly.

## Non-goals (v1)

- **True constructor replacement.** Not possible from a TypeScript decorator without
  class wrapping, which breaks `instanceof` identity.
- **Java primitive zeroing.** `{ force: true }` does not assign `0`, `false`, or `null`.
- **`@RequiredArgsConstructor`** — Phase 17, on the same static-factory pattern.

## Java Lombok migrants

| Java pattern                                       | Port                                                                                       |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `@NoArgsConstructor` class-level                   | `@NoArgsConstructor()` on the class; call `Class.noArgs()` instead of `new Class()`.       |
| `@NoArgsConstructor(staticName = "create")`        | `@NoArgsConstructor({ staticName: 'create' })`; call `Class.create()`.                     |
| `@NoArgsConstructor(force = true)`                 | `@NoArgsConstructor({ force: true })`; required fields stay `undefined`.                   |
| `@NoArgsConstructor(access = AccessLevel.PRIVATE)` | `@NoArgsConstructor({ access: 'private' })`; recorded in metadata, no runtime enforcement. |
