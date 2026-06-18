# @Value

**Immutable data class:** getters, `with*` copy methods, `equals`, and `toString` — no setters.

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Codegen            |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | Yes                |

## Example

```ts
import { Value } from 'lombok-typescript/legacy';

@Value
export class Point {
  x!: number;
  y!: number;
}
```

After `lombok-ts generate`, call `applyAllGenerated` and use `withX` for immutable updates:

```ts
const p = new Point();
p.x = 1;
p.y = 2;
const moved = p.withX(5); // new instance; p unchanged
```

## Composition

- **Conflicts with `@Data`** — codegen rejects classes that use both.
- Implies `@With` behavior for all fields (you do not need both decorators).
