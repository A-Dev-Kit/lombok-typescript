# @Visitor / @Visitable

**Double-dispatch visitor** — visitable nodes call `visit{ClassName}` on a visitor.

|                         |                                |
| ----------------------- | ------------------------------ |
| **Kind**                | Hybrid                         |
| **Backends**            | `legacy`, `stage3`             |
| **Requires `generate`** | Yes (`accept` on `@Visitable`) |

## Example

```ts
import { Visitable, Visitor } from 'lombok-typescript/legacy';

@Visitable
class Circle {
  radius = 1;
}

@Visitable
class Square {
  side = 2;
}

@Visitor({ visitMethods: { Circle: 'visitCircle', Square: 'visitSquare' } })
class AreaVisitor {
  visitCircle(c: Circle) {
    return Math.PI * c.radius ** 2;
  }
  visitSquare(s: Square) {
    return s.side ** 2;
  }
}
```

After `lombok-ts generate`, each visitable class gets `accept(visitor)` calling `visitor.visit{ClassName}(this)`.

## Naming convention

Visitor methods must follow `visit` + PascalCase(class name): `Circle` → `visitCircle`.

## Limitations (v0.8.0)

Cross-file visitor dispatch is limited to classes seen in the same codegen pass (same source file unit).
