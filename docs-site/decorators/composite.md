# @Composite

**Tree composite API** — add, remove, and traverse child nodes.

|                         |                                        |
| ----------------------- | -------------------------------------- |
| **Kind**                | Runtime                                |
| **Backends**            | `legacy`, `stage3`                     |
| **Requires `generate`** | No (declaration shim for tree methods) |

## Example

```ts
import { Composite } from 'lombok-typescript/legacy';

@Composite
class FileNode {
  name = '';
}

const root = new FileNode();
const child = new FileNode();
root.add(child);
root.traverse((node) => console.log(node));
```

## API

- `add(child)` / `remove(child)`
- `getChild(index)` / `getChildren()`
- `traverse(callback)` — depth-first, includes root
- `[Symbol.iterator]()` — iterates direct children

Children are stored internally (not as a user-visible field).
