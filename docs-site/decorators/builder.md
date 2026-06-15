# @Builder

Fluent builder companion class (codegen).

```ts
import { Builder } from 'lombok-typescript/legacy';

@Builder
class User {
  name!: string;
  age!: number;
}
```

After codegen: `User.builder().name('Ada').age(30).build()`.
