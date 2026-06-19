# @Iterable / @IterateOver

**Collection iteration** — implement `Symbol.iterator` over a single `@IterateOver` field.

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Runtime            |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | No                 |

## Example

```ts
import { Iterable, IterateOver } from 'lombok-typescript/legacy';

@Iterable
class Playlist {
  @IterateOver
  songs: string[] = ['a', 'b', 'c'];
}

for (const song of new Playlist()) {
  console.log(song);
}
```

Exactly one `@IterateOver` field is required per class.
