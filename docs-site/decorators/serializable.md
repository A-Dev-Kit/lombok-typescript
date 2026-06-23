# @Serializable

**Codegen `toJSON` / `fromJSON`** with field markers for exclusion, aliasing, and transforms.

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Hybrid (codegen)   |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | Yes                |

## Example

```ts
import { Serializable } from 'lombok-typescript/legacy';

@Serializable
class User {
  name: string;
  @Serializable.Exclude
  secret: string;
  @Serializable.Alias('user_email')
  email: string;
  @Serializable.Transform({
    serialize: (d: Date) => d.toISOString(),
    deserialize: (s: string) => new Date(s),
  })
  createdAt: Date;
}
```

Run `lombok-ts generate`, then call `applyUserGenerated` from the companion file.

## Field markers

| Marker                    | Effect                           |
| ------------------------- | -------------------------------- |
| `@Serializable.Exclude`   | Omit field from JSON             |
| `@Serializable.Alias`     | Use a different JSON key         |
| `@Serializable.Transform` | Custom serialize/deserialize fns |

## Limitations (v0.9.0)

Serialization covers declared fields only — shallow copy per field. Nested object graphs with circular references are not automatically detected; avoid mutual references in serialized fields or add custom transforms.
