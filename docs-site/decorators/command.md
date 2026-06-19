# @Command / CommandHistory

**Command pattern** — encapsulate actions with `execute()` and optional `undo()`; stack them in `CommandHistory`.

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Runtime            |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | No                 |

## Example

```ts
import { Command, CommandHistory } from 'lombok-typescript/legacy';

@Command
class InsertText {
  constructor(
    private editor: { text: string },
    private chunk: string,
  ) {}

  execute() {
    this.editor.text += this.chunk;
  }

  undo() {
    this.editor.text = this.editor.text.slice(0, -this.chunk.length);
  }
}

const history = new CommandHistory();
history.execute(new InsertText({ text: '' }, 'Hello'));
history.undo();
history.redo();
```

`@Command` validates that `execute()` exists when the class is decorated.
