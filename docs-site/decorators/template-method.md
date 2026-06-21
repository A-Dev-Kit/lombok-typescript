# @TemplateMethod / @Hook

**Template method pattern** — codegen wires a template method to call ordered hook steps.

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Codegen + metadata |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | Yes                |

## Example

```ts
import { TemplateMethod, Hook } from 'lombok-typescript/legacy';

@TemplateMethod({ steps: ['fetch', 'transform', 'write'], template: 'export' })
class DataExporter {
  @Hook()
  fetch() {}

  @Hook()
  transform() {}

  @Hook()
  write() {}
}
```

Run `lombok-ts generate`. The companion assigns `export()` (or your `template` name) to call each hook in `steps` order.

## Options

- `steps` — required hook names in call order
- `template` — method name to generate (default `execute`)

Each step must have a matching `@Hook()` method (or `@Hook({ name: 'step' })`).
