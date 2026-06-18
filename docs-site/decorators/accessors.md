# @Accessors

Controls generated setter style. With `chain: true` (or `fluent: true`), setters return `this`.

|                         |                      |
| ----------------------- | -------------------- |
| **Kind**                | Codegen metadata     |
| **Backends**            | `legacy`, `stage3`   |
| **Requires `generate`** | Yes (with `@Setter`) |

## Example

```ts
import { Accessors, Getter, Setter } from 'lombok-typescript/legacy';

@Accessors({ chain: true })
class BuilderStyle {
  @Getter
  @Setter
  name!: string;
}
```
