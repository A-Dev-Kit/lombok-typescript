# @UtilityClass

Makes a class uninstantiable (constructor throws), similar to Java Lombok `@UtilityClass`.

|              |                    |
| ------------ | ------------------ |
| **Kind**     | Runtime            |
| **Backends** | `legacy`, `stage3` |

## Example

```ts
import { UtilityClass } from 'lombok-typescript/legacy';

@UtilityClass
class Strings {
  static isBlank(s: string) {
    return s.trim().length === 0;
  }
}

Strings.isBlank('  '); // true
// new Strings(); // TypeError
```
