# Observer adapters (RxJS / MobX)

Optional bridges for `@Observable` instances. Install the peer dependency you need.

## RxJS

```bash
npm install rxjs
```

```ts
import { Observable } from 'lombok-typescript/legacy';
import { toObservable } from 'lombok-typescript/observers/rxjs';

@Observable
class Store {
  count = 0;
}

const store = new Store();
toObservable<number>(store, 'count').subscribe((n) => console.log(n));
```

## MobX

```bash
npm install mobx
```

```ts
import { Observable } from 'lombok-typescript/legacy';
import { makeLombokObservable } from 'lombok-typescript/observers/mobx';

@Observable
class Store {
  count = 0;
}

const store = new Store();
makeLombokObservable(store, 'count', (next, prev) => console.log(next, prev));
```

`toMobxObservable` re-exports MobX `observable()` for advanced setups.
