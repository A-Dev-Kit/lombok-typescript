# @Equals

Generates structural `equals(other)` and a static null-safe `Class.equals(a, b)` helper.

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Codegen            |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | Yes                |

## Example

```ts
import { Equals, EqualsExclude } from 'lombok-typescript/legacy';

@Equals
class User {
  name!: string;
  @EqualsExclude
  tempId!: string;
}
```

Excluded fields are omitted from equality checks. [`@Data`](/decorators/data) and [`@Value`](/decorators/value) include `equals` without a separate `@Equals`.
