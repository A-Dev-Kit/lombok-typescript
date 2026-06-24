# @Interpreter

**Marker-only** — documents an interpreter for a small language or DSL. Grammar and evaluation remain hand-written.

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Marker-only class  |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | No                 |

## Example

```ts
import { Interpreter } from 'lombok-typescript/legacy';

type Expr = { type: 'num'; value: number } | { type: 'add'; left: Expr; right: Expr };

@Interpreter
class CalcInterpreter {
  eval(node: Expr): number {
    if (node.type === 'num') return node.value;
    return this.eval(node.left) + this.eval(node.right);
  }
}
```

Use this decorator to signal intent in docs and metadata, not to parse expressions automatically.
