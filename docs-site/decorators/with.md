# @With

Generates `with{Field}(value)` methods that return a **new instance** with one field changed.

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Codegen            |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | Yes                |

## Class or field level

```ts
import { With } from 'lombok-typescript/legacy';

@With
class Point {
  x!: number;
  y!: number;
}

// Or per-field:
class Label {
  @With
  text!: string;
}
```

[`@Value`](/decorators/value) includes `@With` for every field automatically.
