# @Data

**Composite data-class helper:** getters, setters (non-readonly fields), `equals`, and `toString` via codegen.

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Codegen            |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | Yes                |

## When to use

- Plain data holders (DTOs, entities, config objects) where you want Lombok-style accessors without hand-writing them
- Together with [`@Builder`](/decorators/builder) for fluent construction

## When not to use

- Classes with complex invariant logic in constructors (v0.1 does not inject a generated constructor)
- When you only need `toString` — use [`@ToString`](/decorators/to-string) alone

## Example

```ts
import { Data } from 'lombok-typescript/legacy';

@Data
export class User {
  name!: string;
  readonly id!: string;
  age?: number;
}
```

```bash
lombok-ts generate
```

```ts
import { User } from './user.js';
import { applyAllGenerated } from '../.lombok/src/user.lombok.js';

applyAllGenerated({ User });

const u = new User();
u.name = 'Ada';
u.getName(); // generated getter
```

## Codegen steps

1. `lombok-ts generate` emits accessor functions and `applyUserGenerated`.
2. Include `.lombok/**/*.ts` and `.lombok/**/*.d.ts` in tsconfig.
3. Call `applyAllGenerated({ User })` once at startup.

## v0.1 limitations

- Does **not** replace or auto-wire a multi-argument constructor; assign fields after `new User()` or use [`@Builder`](/decorators/builder).
- `readonly` fields get getters only (no setter) in generated code.
- `equals` uses referential field equality (`===`), not deep comparison.
