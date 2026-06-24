# @Bridge

**Marker-only** — documents the Bridge pattern (abstraction separated from implementation).

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Marker-only class  |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | No                 |

## Example

```ts
import { Bridge } from 'lombok-typescript/legacy';

interface Renderer {
  render(shape: string): void;
}

@Bridge
class Shape {
  constructor(protected renderer: Renderer) {}
  draw(name: string) {
    this.renderer.render(name);
  }
}
```

No code is generated; the decorator records intent in metadata.
