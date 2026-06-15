# @NonNull

**Runtime null-safety** on fields (and method parameters where supported).

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Runtime            |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | No                 |

## When to use

- Enforce non-null invariants on mutable properties
- Document intent at decoration sites (similar to Java `@NonNull`)

## When not to use

- Optional fields — leave undecorated or use `?` in TypeScript
- Compile-time-only guarantees — TypeScript strict mode remains the primary tool

## Example

```ts
import { NonNull } from 'lombok-typescript/legacy';

class Account {
  @NonNull
  owner!: string;
}
```

Assigning `null` or `undefined` throws at runtime.

## Legacy vs Stage 3

- **Legacy:** field decorator on property declarations
- **Stage 3:** single-argument initializer decorator form per ECMAScript spec

## v0.1 limitations

- Runtime check only; does not change TypeScript's static type to exclude `null` from the declared type.
- Does not generate codegen companions.
