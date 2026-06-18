# @FieldDefaults

Class-level defaults for codegen: `makeFinal` treats non-readonly fields as readonly in generated accessors.

|                         |                                |
| ----------------------- | ------------------------------ |
| **Kind**                | Codegen metadata               |
| **Backends**            | `legacy`, `stage3`             |
| **Requires `generate`** | Yes (with `@Data` / `@Setter`) |

## Example

```ts
import { Data, FieldDefaults } from 'lombok-typescript/legacy';

@FieldDefaults({ makeFinal: true })
@Data
class Config {
  host!: string;
}
```

`host` gets a getter only in generated code when `makeFinal` is true.
