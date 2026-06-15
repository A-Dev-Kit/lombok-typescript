# Decorator overview (v0.1)

Phase 1 ships eight decorators. All are exported from **`lombok-typescript/legacy`** and **`lombok-typescript/stage3`**.

| Decorator                             | Kind              | Codegen? | Summary                                   |
| ------------------------------------- | ----------------- | -------- | ----------------------------------------- |
| [`@NonNull`](/decorators/non-null)    | Runtime field     | No       | Reject `null` / `undefined` on assignment |
| [`@ToString`](/decorators/to-string)  | Codegen           | Yes      | Generated `toString()`                    |
| [`@Builder`](/decorators/builder)     | Codegen           | Yes      | Fluent builder class                      |
| [`@Data`](/decorators/data)           | Codegen composite | Yes      | Getters, setters, `equals`, `toString`    |
| [`@Singleton`](/decorators/singleton) | Runtime class     | No       | Single shared instance per class          |
| [`@Prototype`](/decorators/prototype) | Runtime class     | No       | New instance on every `new`               |
| [`@Factory`](/decorators/factory)     | Hybrid            | Partial  | Named factory registry                    |
| [`@Memoize`](/decorators/memoize)     | Runtime method    | No       | Cache method results by arguments         |

## Codegen decorators

Run after changing decorated classes:

```bash
lombok-ts generate
```

Then call `applyAllGenerated` (or per-class `apply*Generated`) from the `.lombok.ts` companion.

## Choosing a backend

```ts
// Legacy
import { Data } from 'lombok-typescript/legacy';

// Stage 3
import { Data } from 'lombok-typescript/stage3';
```

See [Getting started](/guide/getting-started) for tsconfig requirements.

## Roadmap

Future phases add `@Value`, `@Log`, GoF behavioral patterns, and more. v0.1 is intentionally small and stable.
