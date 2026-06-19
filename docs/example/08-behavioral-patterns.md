# Behavioral patterns

> Phase 3 (v0.5.0–v0.6.0). Implemented decorators are documented on the [docs site](https://a-dev-kit.github.io/lombok-typescript/decorators/overview.html).

## `@Strategy`

Registers swappable algorithm classes under a strategy family. Pick one at runtime by string key.

```ts
import { Strategy, StrategyRegistry } from 'lombok-typescript/legacy';

interface Compressor {
  compress(data: Buffer): Buffer;
}

@Strategy('compression', 'gzip')
class GzipCompressor implements Compressor {
  compress(data: Buffer) {
    /* ... */
  }
}

@Strategy('compression', 'brotli')
class BrotliCompressor implements Compressor {
  compress(data: Buffer) {
    /* ... */
  }
}

@Strategy('compression', 'none')
class NoCompressor implements Compressor {
  compress(data: Buffer) {
    return data;
  }
}

const algo = StrategyRegistry.get<Compressor>('compression', 'gzip');
const compressed = algo.compress(input);
```

The registry is global within a process. Use it for plug-in style configurations where the choice is data-driven.

To list registered strategies in a family:

```ts
StrategyRegistry.list('compression'); // ['gzip', 'brotli', 'none']
```

## `@State`

Finite state machine on a class. `@Transition` on methods declares allowed transitions; the runtime rejects illegal ones.

```ts
import { State, Transition } from 'lombok-typescript/legacy';

@State({
  states: ['draft', 'submitted', 'approved', 'rejected', 'archived'],
  initial: 'draft',
})
class Application {
  @Transition({ from: 'draft', to: 'submitted' })
  submit() {
    // runs only if current state is 'draft'
  }

  @Transition({ from: 'submitted', to: 'approved' })
  approve(reviewer: string) {
    /* ... */
  }

  @Transition({ from: 'submitted', to: 'rejected' })
  reject(reason: string) {
    /* ... */
  }

  @Transition({ from: ['approved', 'rejected'], to: 'archived' })
  archive() {
    /* ... */
  }
}

const a = new Application();
a.state; // 'draft'
a.submit();
a.state; // 'submitted'
a.archive(); // throws: cannot transition from 'submitted' to 'archived'
```

Multiple `from` states are allowed (as in `archive()`). Hooks fire on transition: `onEnter`, `onExit`, `onTransition`.

```ts
@State({
  states: ['idle', 'running', 'done'],
  initial: 'idle',
  onTransition: (from, to) => console.log(`${from} -> ${to}`),
})
class Job {
  /* ... */
}
```

## `@Observer` / `@Observable`

Reactive property changes with a subscription API. The Lombok `@Observable` and the GoF Observer pattern collapse to one decorator.

```ts
import { Observable } from 'lombok-typescript/legacy';

@Observable
class Counter {
  count = 0;

  increment() {
    this.count++;
  }
}

const c = new Counter();
const unsubscribe = c.subscribe('count', (next, prev) => {
  console.log(`${prev} -> ${next}`);
});

c.increment(); // logs "0 -> 1"
c.count = 10; // logs "1 -> 10"

unsubscribe(); // stop receiving updates
```

Subscribe to all properties at once with `'*'`:

```ts
c.subscribe('*', (key, next, prev) => {
  console.log(`${String(key)} changed from ${prev} to ${next}`);
});
```

For computed/derived state (mostly Phase 3+):

```ts
@Observable
class Cart {
  items: Item[] = [];

  @Observable.Derived
  get total() {
    return this.items.reduce((sum, i) => sum + i.price, 0);
  }
}

cart.subscribe('total', (next, prev) => updateUI(next));
cart.items.push(new Item(...)); // triggers total recomputation and notification
```

For RxJS / MobX integration, opt-in adapters ship under `lombok-typescript/observers/{rxjs,mobx}` once Phase 3 lands.

## `@Command`

Class becomes a command object with `execute()` and `undo()`. Useful for undo/redo stacks and queued operations.

```ts
import { Command } from 'lombok-typescript/legacy';

interface Editor {
  text: string;
}

@Command
class InsertText {
  constructor(
    private editor: Editor,
    private position: number,
    private text: string,
  ) {}

  execute() {
    this.editor.text =
      this.editor.text.slice(0, this.position) + this.text + this.editor.text.slice(this.position);
  }

  undo() {
    this.editor.text =
      this.editor.text.slice(0, this.position) +
      this.editor.text.slice(this.position + this.text.length);
  }
}

const cmd = new InsertText(editor, 0, 'Hello ');
cmd.execute();
// ...later...
cmd.undo();
```

For an undo stack:

```ts
import { CommandHistory } from 'lombok-typescript/legacy';

const history = new CommandHistory();
history.execute(new InsertText(editor, 0, 'Hello '));
history.execute(new InsertText(editor, 6, 'world'));
history.undo(); // text reverts to 'Hello '
history.redo(); // text returns to 'Hello world'
```

## `@Memento`

Snapshots and restores instance state. Good for "save / restore" semantics that don't need full undo/redo history.

```ts
import { Memento } from 'lombok-typescript/legacy';

@Memento
class Editor {
  content = '';
  cursor = 0;
  selection: [number, number] | null = null;
}

const editor = new Editor();
editor.content = 'Hello world';
editor.cursor = 5;

const snapshot = editor.save();
editor.content = 'oops';
editor.cursor = 0;

editor.restore(snapshot); // back to 'Hello world', cursor at 5
```

`save()` returns an opaque token; `restore(token)` rolls back. Snapshots are deep copies (uses the same `deepClone` helper as `@Prototype`).

To exclude fields from the snapshot:

```ts
@Memento
class Editor {
  content = '';
  @Memento.Exclude transientCache: Map<string, unknown> = new Map();
}
```

## Picking between them

| You want                                     | Reach for     |
| -------------------------------------------- | ------------- |
| Choose an algorithm by config string         | `@Strategy`   |
| State machine with enforced transitions      | `@State`      |
| Reactive property updates with subscriptions | `@Observable` |
| Undo/redo with a command queue               | `@Command`    |
| Save / restore one snapshot at a time        | `@Memento`    |

Patterns NOT in this batch:

- `@TemplateMethod` (Phase 4)
- `@Visitor` / `@Visitable` (Phase 4)
- Marker-only patterns (`@Mediator`, `@Interpreter`): documentation aids only, no generated code
