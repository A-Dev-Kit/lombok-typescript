# @AbstractFactory

**Helper scaffold** for the Abstract Factory pattern.

|                         |                                                              |
| ----------------------- | ------------------------------------------------------------ |
| **Kind**                | Codegen Helper                                               |
| **Backends**            | `legacy`, `stage3`                                           |
| **Requires `generate`** | Yes                                                          |
| **Viability**           | **Helper** — emits abstract stubs; concrete wiring is manual |

## Example

```ts
import { AbstractFactory } from 'lombok-typescript/legacy';

@AbstractFactory(['Button', 'Dialog'])
abstract class UIFactory {}
```

Codegen emits a companion mixin with abstract methods:

```ts
abstract createButton(): Button;
abstract createDialog(): Dialog;
```

You declare product types and extend the mixin in your source. Unlike `@Factory`, there is no runtime registry.
