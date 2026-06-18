# @Getter / @Setter

Field-level accessors when you do not want the full [`@Data`](/decorators/data) bundle.

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Codegen            |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | Yes                |

## Example

```ts
import { Getter, Setter } from 'lombok-typescript/legacy';

class Account {
  @Getter
  @Setter
  balance!: number;
}
```

Pair with [`@Accessors`](/decorators/accessors) for fluent `set*` methods that return `this`.
