# @ToString

**Generated `toString()`** listing visible instance fields.

|                         |                                                             |
| ----------------------- | ----------------------------------------------------------- |
| **Kind**                | Codegen                                                     |
| **Backends**            | `legacy`, `stage3`                                          |
| **Requires `generate`** | Yes (unless combined with `@Data`, which includes toString) |

## When to use

- Debugging and logging for data classes
- Lightweight string representation without manual template strings

## When not to use

- Types containing secrets (passwords, tokens) — fields are included by default
- When you need JSON serialization — use `JSON.stringify` or a dedicated serializer

## Example

```ts
import { ToString } from 'lombok-typescript/legacy';

@ToString
export class Point {
  x!: number;
  y!: number;
}
```

```bash
lombok-ts generate
```

```ts
import { applyAllGenerated } from '../.lombok/src/point.lombok.js';
applyAllGenerated({ Point });

const p = new Point();
p.x = 1;
p.y = 2;
p.toString(); // Point(x=1, y=2)
```

## Configuration

Global `formatToString` in `lombok.config.ts` (formats: `pretty`, `json`, `compact`) — see [Configuration](/guide/configuration).

## v0.1 limitations

- All non-excluded fields are included; `@ToString.Exclude` field filtering is planned for later phases.
- Included automatically when [`@Data`](/decorators/data) is present on the same class.
