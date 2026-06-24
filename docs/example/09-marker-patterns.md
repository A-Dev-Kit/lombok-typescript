# Marker patterns (Phase 6)

> **Shipped in v0.10.0** — metadata-only GoF markers. No generated code.

These five decorators complete GoF coverage per [ADR-13](https://github.com/A-Dev-Kit/lombok-typescript-planning/blob/main/adr/0013-gof-coverage-strategy.md). They store metadata and document intent; you still implement behavior by hand.

| Decorator | Role |
| --------- | ---- |
| `@Adapter` | Wraps a legacy API behind a modern interface |
| `@Bridge` | Separates abstraction from implementation |
| `@Facade` | Simplifies a subsystem |
| `@Mediator` | Coordinates colleagues |
| `@Interpreter` | Evaluates a small DSL |

## `@Adapter`

```typescript
import { Adapter } from 'lombok-typescript/legacy';

interface ModernApi {
  fetch(): Promise<string>;
}

class LegacyApi {
  load(cb: (err: Error | null, data: string) => void) {
    cb(null, 'ok');
  }
}

@Adapter({ adapts: LegacyApi, target: ModernApi })
class LegacyApiAdapter implements ModernApi {
  private legacy = new LegacyApi();
  fetch() {
    return new Promise<string>((resolve, reject) => {
      this.legacy.load((err, data) => (err ? reject(err) : resolve(data)));
    });
  }
}
```

> `@Adapter` (GoF) is **not** `ValidatorAdapter` from `lombok-typescript/validators/*`.

## `@Bridge`, `@Facade`, `@Mediator`, `@Interpreter`

```typescript
import { Bridge, Facade, Mediator, Interpreter } from 'lombok-typescript/legacy';

class PaymentApi {}
class InventoryApi {}

@Bridge
class Shape {
  constructor(protected renderer: { render(): void }) {}
}

@Facade({ subsystems: [PaymentApi, InventoryApi] })
class CheckoutFacade {}

@Mediator
class ChatRoom {}

@Interpreter
class ExprEvaluator {}
```

See the [docs site](https://a-dev-kit.github.io/lombok-typescript/decorators/adapter) for full pages per decorator.
