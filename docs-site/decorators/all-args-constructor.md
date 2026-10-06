# AllArgsConstructor

**Codegen a static factory on the class that constructs an instance and assigns every
declared field in order.** The TypeScript analogue of Java Lombok's
`@AllArgsConstructor` — ships as a static factory alongside the user's own constructor
rather than replacing it.

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Codegen            |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | Yes                |

## Java parity — with a twist

Java Lombok's `@AllArgsConstructor` generates `public User(name, age)` directly on the
class. TypeScript decorators can't replace an existing class's constructor without
wrapping-and-replacing the class reference, which breaks `instanceof` identity for any
pre-existing imports and silently clobbers any constructor the user already wrote. The
port here is additive: codegen emits a **static factory** `Class.allArgs(...)` on the
class, so the user's own constructor stays intact and `instanceof` works unchanged. The
factory itself uses `Object.create(Class.prototype)` under the hood, so it does not
invoke any user-defined constructor and does not run user-written initialisers — the
assignment is purely field-by-field in declaration order.

```ts
import { AllArgsConstructor } from 'lombok-typescript/legacy';

@AllArgsConstructor()
class User {
  name!: string;
  age!: number;
  // Type shim; the real body is installed by applyAllGenerated() from the companion.
  declare static allArgs: (name: string, age: number) => User;
}

const u = User.allArgs('ada', 36);
u instanceof User; // true
u.name; // 'ada'
```

## Options

| Option       | Type                                   | Default     | Purpose                                                                                                                                                     |
| ------------ | -------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `staticName` | `string`                               | `'allArgs'` | Name of the generated static factory. Matches Java Lombok's `@AllArgsConstructor(staticName = "of")`.                                                       |
| `access`     | `'public' \| 'protected' \| 'private'` | `'public'`  | Documented visibility of the factory. TypeScript has no runtime access modifiers, so this is recorded in metadata for tooling only; no runtime enforcement. |

Use `@AllArgsConstructor({ staticName: 'of' })` for the Java-idiomatic `User.of('ada', 36)`.

## Semantics

- **Field order = declaration order** (matches Java Lombok).
- **Optional fields** (`age?: number`) are emitted as optional parameters in the factory
  signature, matching the TypeScript source.
- **`Object.create`-based construction** means the user's constructor is **not**
  invoked. If you need user-written constructor side effects, call that constructor
  yourself; the static factory is a straight field-assignment helper.
- **No prototype pollution.** The decorator writes metadata only; the codegen companion
  installs the factory onto the class constructor via `applyAllGenerated(handlers)`,
  the same mechanism used by `@Builder` / `@Data` / `@Equals`.
- **Introspection.** Metadata is stored under `MetadataKeys.ALL_ARGS_CONSTRUCTOR`
  (`{ staticName, access }`) at class scope.

## Composition

- Stacking with `@Data` or `@Value` is rejected at codegen time — those decorators
  already emit a constructor via `emitDataConstructor`, so adding a factory would
  duplicate state assignment. The validator surfaces a clear error naming the class.
- `@AllArgsConstructor` + `@Builder` compose cleanly: `Class.allArgs(...)` and
  `Class.builder()` sit side-by-side on the constructor.

## Non-goals (v1)

- **True constructor replacement.** Not possible from a TypeScript decorator without
  class wrapping, which breaks `instanceof` identity.
- **`@RequiredArgsConstructor`** — Phase 17, on the same static-factory pattern.
  `@NoArgsConstructor` already ships as `Class.noArgs()`.

## Java Lombok migrants

| Java pattern                                              | Port                                                                                         |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `@AllArgsConstructor` class-level                         | `@AllArgsConstructor()` on the class; call `Class.allArgs(...)` instead of `new Class(...)`. |
| `@AllArgsConstructor(staticName = "of")`                  | `@AllArgsConstructor({ staticName: 'of' })`; call `Class.of(...)`.                           |
| `@AllArgsConstructor(access = AccessLevel.PRIVATE)`       | `@AllArgsConstructor({ access: 'private' })`; recorded in metadata, no runtime enforcement.  |
| `new User("ada", 36)` with Lombok's generated constructor | `User.allArgs('ada', 36)` (or `User.of(...)` with `staticName`).                             |
