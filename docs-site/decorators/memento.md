# @Memento

**Snapshot / restore** — capture deep-cloned state and roll back without a full undo stack.

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Runtime            |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | No                 |

## Example

```ts
import { Memento } from 'lombok-typescript/legacy';

@Memento
class Editor {
  content = '';
  @Memento.Exclude
  cache = new Map<string, unknown>();
}

const editor = new Editor();
editor.content = 'Hello';
const snap = editor.save();
editor.content = 'oops';
editor.restore(snap);
```

Excluded fields are not stored in the snapshot and are not restored.
