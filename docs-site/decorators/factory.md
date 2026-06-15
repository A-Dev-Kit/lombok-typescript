# @Factory

Registers a class in a global factory registry (hybrid).

```ts
@Factory('email')
class EmailNotifier {}

import { createFromFactory } from 'lombok-typescript/legacy';
const notifier = createFromFactory('email');
```
