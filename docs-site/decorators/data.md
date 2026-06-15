# @Data

Composite Lombok decorator: getters, setters, `equals`, `toString`, and constructor (codegen).

```ts
import { Data } from 'lombok-typescript/legacy';

@Data
class User {
  name!: string;
  age!: number;
}
```

Run `lombok-ts generate` then call `applyAllGenerated({ User })` from the companion file.
