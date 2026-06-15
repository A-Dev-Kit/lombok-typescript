# Creational patterns

> **v0.1 shipped:** `@Singleton`, `@Factory`, `@Prototype`, `@Builder` — see [docs](https://a-dev-kit.github.io/lombok-typescript/decorators/overview). **Preview:** `@AbstractFactory` (Phase 4). `@Builder` is also covered in [04-data-classes.md](./04-data-classes.md).

## `@Singleton`

Enforces a single instance per class. `new Foo()` always returns the same object.

```ts
import { Singleton } from 'lombok-typescript/legacy';

@Singleton
class AppConfig {
  dbUrl = 'postgres://localhost/db';
  apiKey = 'secret';
}

const a = new AppConfig();
const b = new AppConfig();
a === b; // true
a.dbUrl === b.dbUrl; // true
```

The decorator replaces the constructor with one that returns the cached instance after the first call. Constructor arguments on subsequent calls are ignored (the first call wins).

### Resetting for tests

```ts
import { Singleton, resetSingleton } from 'lombok-typescript/legacy';

afterEach(() => {
  resetSingleton(AppConfig);
});
```

`resetSingleton` clears the cache so the next `new AppConfig()` builds a fresh instance. Useful for unit tests that need isolated state.

### NestJS

NestJS providers are already singleton-scoped within a module by default. Don't stack `@Singleton` on top of `@Injectable()`; pick one mechanism per class. If you want a singleton outside a NestJS module (e.g. a config object loaded at boot), `@Singleton` is fine.

## `@Factory`

Registers classes under a string key, exposes a static `Factory.create(key, ...args)` registry. Useful when you need to pick an implementation by config.

```ts
import { Factory } from 'lombok-typescript/legacy';

interface Notifier {
  send(message: string): Promise<void>;
}

@Factory('email')
class EmailNotifier implements Notifier {
  constructor(private smtpHost: string) {}
  async send(message: string) {
    /* ... */
  }
}

@Factory('sms')
class SmsNotifier implements Notifier {
  constructor(private apiKey: string) {}
  async send(message: string) {
    /* ... */
  }
}

const notifier = Factory.create<Notifier>('email', 'smtp.example.com');
await notifier.send('hello');
```

### Typed lookups

The codegen emits typed overloads of `Factory.create()` so `Factory.create('email', ...)` returns `EmailNotifier`, not just `Notifier`. You don't have to specify the generic in most cases.

### Per-family factories

If you have multiple factory families in one project, scope them by passing a family name:

```ts
@Factory('compression', 'gzip')
class GzipCompressor {}
@Factory('compression', 'brotli')
class BrotliCompressor {}

const c = Factory.create('compression', 'gzip');
```

When there's only one family, the second argument can be omitted (as in the first example).

### Listing registered keys

```ts
Factory.keys('compression'); // ['gzip', 'brotli']
Factory.has('compression', 'gzip'); // true
```

Useful for building dropdowns or validating user-supplied keys.

## `@Prototype`

Adds a `clone()` method that returns a deep copy of the instance.

```ts
import { Prototype } from 'lombok-typescript/legacy';

@Prototype
class Document {
  title = 'Untitled';
  pages: Page[] = [];
  metadata: Record<string, string> = {};
}

const doc = new Document();
doc.pages.push(new Page('First'));

const copy = doc.clone();
copy.pages.push(new Page('Second'));

doc.pages.length; // 1
copy.pages.length; // 2
```

Uses the `deepClone` helper from `lombok-typescript/utils` under the hood. Handles nested objects, arrays, and primitives. Doesn't handle `Date`, `Map`, `Set`, or class instances with prototype methods that need preserving; for those, override `clone()` manually or use a structured-clone library.

### NestJS

Conflicts semantically with `@Injectable({ scope: Scope.TRANSIENT })`. They both produce fresh instances but via different mechanisms. Pick one.

## `@AbstractFactory`

(Phase 4) Family of related factories. Marked Helper in the catalog because the decorator scaffolds the base class but you still wire the concrete products.

```ts
import { AbstractFactory } from 'lombok-typescript/legacy';

@AbstractFactory(['Button', 'Dialog', 'Menu'])
abstract class UIFactory {
  abstract createButton(): Button;
  abstract createDialog(): Dialog;
  abstract createMenu(): Menu;
}

class MaterialFactory extends UIFactory {
  createButton() {
    return new MaterialButton();
  }
  createDialog() {
    return new MaterialDialog();
  }
  createMenu() {
    return new MaterialMenu();
  }
}

class FluentFactory extends UIFactory {
  /* ... */
}
```

The decorator generates the abstract method signatures from the array argument, plus a typed `UIFactory.use(impl)` registry method. Concrete factories register themselves on import.

## Picking between them

| You want                                          | Reach for          |
| ------------------------------------------------- | ------------------ |
| One global instance everyone shares               | `@Singleton`       |
| Pick an implementation by string key at runtime   | `@Factory`         |
| A family of related factories (theme/skin/locale) | `@AbstractFactory` |
| Cheap deep copies of an instance                  | `@Prototype`       |
| Fluent construction with named arguments          | `@Builder`         |

Next: [07-method-wrappers.md](./07-method-wrappers.md).
