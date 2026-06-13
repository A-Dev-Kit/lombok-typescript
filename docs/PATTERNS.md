# Decorator catalog

Every decorator the library plans to ship, in one place. Lombok ports, Gang-of-Four design patterns, and a handful of TypeScript-only utilities. Use this to answer "what is `@X`?", "what tier does it sit in?", and "is it actually doing work or just an annotation?".

For phasing and scope decisions, see [MVP.md](./MVP.md). For open architectural questions referenced inline (e.g. [ADR-15](./adr/0015-gof-decorator-pattern-naming.md)), see [docs/adr/](./adr/).

## Legend

**Source.**

- `Lombok`: a port of an existing Java Lombok feature
- `GoF-C` / `GoF-S` / `GoF-B`: Gang-of-Four Creational, Structural, or Behavioral
- `TS-Unique`: no Java analogue, idiomatic TS/JS

**Target.** What the decorator attaches to: class, field, method, or param.

**Mode.**

- `Runtime`: pure runtime, using `reflect-metadata` (legacy backend) or `Symbol.metadata` (Stage 3 backend), per [ADR-01](./adr/0001-decorator-standard.md) and [ADR-02](./adr/0002-metadata-strategy.md)
- `Codegen`: relies on the ts-morph code generator at compile time
- `Hybrid`: runtime metadata plus a codegen companion

**Viability.**

- `Real`: the decorator does meaningful work
- `Helper`: gives you scaffolding, you still write most of the logic
- `Marker-only`: the pattern is architectural, the decorator just documents intent and provides typing aids

## Catalog

| #   | Name                                  | Source         | Target        | Mode    | Viability   | Phase |
| --- | ------------------------------------- | -------------- | ------------- | ------- | ----------- | ----- |
| 1   | `@Builder`                            | Lombok / GoF-C | class         | Codegen | Real        | 1     |
| 2   | `@Data`                               | Lombok         | class         | Codegen | Real        | 1     |
| 3   | `@Value`                              | Lombok         | class         | Codegen | Real        | 2     |
| 4   | `@NonNull`                            | Lombok         | field/param   | Runtime | Real        | 1     |
| 5   | `@ToString`                           | Lombok         | class         | Codegen | Real        | 1     |
| 6   | `@Log`                                | Lombok         | class         | Runtime | Real        | 2     |
| 7   | `@With`                               | Lombok         | class         | Codegen | Real        | 2     |
| 8   | `@Getter` / `@Setter`                 | Lombok         | field         | Codegen | Real        | 2     |
| 9   | `@Accessors`                          | Lombok         | class         | Codegen | Real        | 2     |
| 10  | `@UtilityClass`                       | Lombok         | class         | Hybrid  | Real        | 2     |
| 11  | `@Delegate`                           | Lombok         | field         | Codegen | Real        | 2     |
| 12  | `@Equals`                             | Lombok         | class         | Codegen | Real        | 2     |
| 13  | `@FieldDefaults`                      | Lombok         | class         | Codegen | Real        | 2     |
| 14  | `@Singleton`                          | GoF-C          | class         | Runtime | Real        | 1     |
| 15  | `@Factory`                            | GoF-C          | class/method  | Hybrid  | Real        | 1     |
| 16  | `@AbstractFactory`                    | GoF-C          | class         | Codegen | Helper      | 4     |
| 17  | `@Prototype`                          | GoF-C          | class         | Runtime | Real        | 1     |
| 18  | `@Adapter`                            | GoF-S          | class         | Runtime | Marker-only | 6     |
| 19  | `@Bridge`                             | GoF-S          | class         | —       | Marker-only | 6     |
| 20  | `@Composite`                          | GoF-S          | class         | Runtime | Real        | 4     |
| 21  | `@Wraps` (GoF Decorator)              | GoF-S          | class         | Runtime | Real        | 4     |
| 22  | `@Facade`                             | GoF-S          | class         | —       | Marker-only | 6     |
| 23  | `@Flyweight`                          | GoF-S          | class         | Runtime | Real        | 4     |
| 24  | `@Proxy`                              | GoF-S          | class/method  | Hybrid  | Real        | 4     |
| 25  | `@ChainOfResponsibility` / `@Handler` | GoF-B          | class/method  | Runtime | Real        | 3     |
| 26  | `@Command`                            | GoF-B          | class         | Runtime | Real        | 3     |
| 27  | `@Interpreter`                        | GoF-B          | class         | —       | Marker-only | 6     |
| 28  | `@Iterable` / `@Iterator`             | GoF-B          | class/field   | Runtime | Real        | 3     |
| 29  | `@Mediator`                           | GoF-B          | class         | —       | Marker-only | 6     |
| 30  | `@Memento`                            | GoF-B          | class         | Runtime | Real        | 3     |
| 31  | `@Observer` / `@Observable`           | GoF-B / Lombok | class/field   | Runtime | Real        | 3     |
| 32  | `@State`                              | GoF-B          | class         | Runtime | Real        | 3     |
| 33  | `@Strategy`                           | GoF-B          | class         | Runtime | Real        | 3     |
| 34  | `@TemplateMethod`                     | GoF-B          | class         | Codegen | Real        | 4     |
| 35  | `@Visitor` / `@Visitable`             | GoF-B          | class         | Hybrid  | Real        | 4     |
| 36  | `@Memoize`                            | TS-Unique      | method/getter | Runtime | Real        | 1     |
| 37  | `@Retry`                              | TS-Unique      | method        | Runtime | Real        | 5     |
| 38  | `@Debounce` / `@Throttle`             | TS-Unique      | method        | Runtime | Real        | 5     |
| 39  | `@Trace`                              | TS-Unique      | class/method  | Runtime | Real        | 5     |
| 40  | `@Validate`                           | TS-Unique      | field/class   | Hybrid  | Real        | 5     |
| 41  | `@Serializable`                       | TS-Unique      | class         | Hybrid  | Real        | 5     |
| 42  | `@DeepFreeze`                         | TS-Unique      | class         | Runtime | Real        | 5     |

42 entries after de-duping `@Builder` and `@Observer`/`@Observable`. 36 are Real, 1 is a Helper, 5 are Marker-only.

## Lombok ports

Direct ports from Java's Project Lombok. Detailed semantics live in [FEATURES.md](./FEATURES.md); this section is the index.

### Must have

#### `@Builder`

Fluent builder pattern. Same decorator covers Lombok's `@Builder` and the GoF Creational Builder pattern.

```typescript
@Builder
class User {
  name: string;
  age: number;
}
const u = User.builder().name('John').age(25).build();
```

Supports `@Builder.Default` and `@Singular` for collections. Codegen produces a `UserBuilder` companion class.

#### `@Data`

`@Getter` + `@Setter` + `@ToString` + `@Equals` + a constructor, all in one.

```typescript
@Data
class User {
  name: string;
  readonly id: string;
  age?: number;
}
```

Conflicts with `@Value` (mutable vs immutable), see [ADR-07](./adr/0007-decorator-composition-rules.md).

#### `@Value`

Immutable data class. All fields readonly, no setters, only `with*` methods for evolution.

```typescript
@Value
class User {
  name: string;
  age: number;
}
```

Implies `@With`. Composing with `@Data` is forbidden.

#### `@NonNull`

Runtime null/undefined validation on fields and method parameters.

```typescript
class User {
  @NonNull name: string;
  greet(@NonNull msg: string) {}
}
```

Throws `TypeError` with the field or param name in the message. Pure runtime, no codegen.

#### `@ToString`

Auto-generates `toString()`. Supports `@ToString.Exclude` and `@ToString.Include` on fields and getters.

```typescript
@ToString
class User {
  name: string;
  @ToString.Exclude password: string;
}
// "User(name=John)"
```

#### `@Log`

Injects a logger as `this.log`. Configurable backend (`console`, `winston`, `pino`, `bunyan`), see [ADR-09](./adr/0009-logger-backend-dependency-strategy.md).

```typescript
@Log('winston')
class UserService {
  do() {
    this.log.info('hi');
  }
}
```

In NestJS this collides with the built-in `Logger`. Pick one or the other per class.

#### `@With`

Generates `with{FieldName}(value)` methods that return a new instance with that one field changed.

```typescript
@Value
class User {
  name: string;
  age: number;
}
const older = user.withAge(26);
```

### Should have

#### `@Getter` / `@Setter`

Per-field accessors with optional transform/validation hooks.

```typescript
class User {
  @Getter @Setter private _name: string;
}
```

#### `@Accessors`

Class-level accessor style: `fluent`, `chain`, `prefix`.

```typescript
@Accessors({ fluent: true, chain: true })
class User {
  @Getter @Setter name: string;
}
```

#### `@UtilityClass`

Static-only utility class. All methods become static; instantiation throws.

```typescript
@UtilityClass
class StringUtils {
  capitalize(s: string) {
    return s[0].toUpperCase() + s.slice(1);
  }
}
StringUtils.capitalize('hi'); // works
new StringUtils(); // throws
```

#### `@Delegate`

Forwards method calls to a composed field's public methods.

```typescript
class Repo {
  @Delegate private cache: Map<string, User>;
}
```

#### `@Equals`

Generates `equals(other)`. Per-field opt-out via `@Equals.Exclude`.

```typescript
@Equals
class User {
  name: string;
  @Equals.Exclude tempId: string;
}
```

#### `@FieldDefaults`

Apply default access modifiers and/or `readonly` to all fields.

```typescript
@FieldDefaults({ access: 'private', readonly: true })
class User {
  name: string;
  age: number;
}
```

## GoF Creational (5)

Patterns about object instantiation.

#### `@Singleton`

Single instance per class. `new Foo()` always returns the same instance.

```typescript
@Singleton
class AppConfig {
  dbUrl = 'postgres://...';
}
const a = new AppConfig();
const b = new AppConfig();
console.log(a === b); // true
```

In NestJS, providers are already singletons by default within a module scope. Stacking `@Singleton` on top of `@Injectable()` is redundant; pick one.

#### `@Factory`

Registers classes as factory targets and exposes a static `Factory.create(key, ...args)` registry.

```typescript
@Factory('email')
class EmailNotifier {}
@Factory('sms')
class SmsNotifier {}

const notifier = Factory.create('email'); // EmailNotifier instance
```

Hybrid: runtime registry plus codegen-generated typed `create()` overloads.

#### `@AbstractFactory`

Family of related factories. Marked Helper because abstract factory is inherently architectural; the decorator scaffolds the base and derived factory classes, but you wire the concrete products.

```typescript
@AbstractFactory(['Button', 'Dialog'])
class UIFactory {}
class MaterialFactory extends UIFactory {
  /* ... */
}
class FluentFactory extends UIFactory {
  /* ... */
}
```

#### `@Prototype`

Adds a `clone()` method that does a deep clone of the instance. Uses the existing `deepClone` helper in [src/utils/index.ts](../src/utils/index.ts).

```typescript
@Prototype
class Document {
  title = '';
  pages: Page[] = [];
}
const copy = doc.clone(); // independent deep copy
```

Conflicts with NestJS `@Injectable({ scope: Scope.TRANSIENT })` semantically (not technically) and is worth a doc note when this lands.

#### `@Builder`

Already covered under [Lombok ports](#must-have). The same implementation serves both audiences.

## GoF Structural (7)

Patterns about composing classes and objects.

#### `@Adapter` (Marker-only)

TypeScript already supports interface-based adapters trivially. The decorator just annotates intent for documentation/tooling. There's no useful code we could generate that beats hand-writing the interface methods.

```typescript
@Adapter({ adapts: LegacyApi, target: ModernApi })
class LegacyApiAdapter implements ModernApi {
  /* manual implementation */
}
```

#### `@Bridge` (Marker-only)

Architectural separation between abstraction and implementation. Can't be auto-generated meaningfully.

```typescript
@Bridge
class Shape {
  constructor(protected renderer: Renderer) {}
}
```

#### `@Composite`

Adds tree-composition methods (`add`, `remove`, `getChild`, `traverse`) and a polymorphic operation runner.

```typescript
@Composite
class FileNode {
  name: string;
}
const root = new FileNode();
root.add(child1);
root.add(child2);
root.traverse((node) => console.log(node.name));
```

#### `@Wraps` (GoF "Decorator")

Renamed to avoid the obvious clash with TS `@decorator` syntax, see [ADR-15](./adr/0015-gof-decorator-pattern-naming.md). Wraps an existing class instance to add behavior.

```typescript
@Wraps(Coffee)
class WithMilk {
  cost() {
    return this.inner.cost() + 0.5;
  }
}
const drink = new WithMilk(new Coffee());
```

#### `@Facade` (Marker-only)

Architectural simplification of a subsystem. Annotation only.

```typescript
@Facade({ subsystems: [PaymentApi, InventoryApi, ShippingApi] })
class CheckoutFacade {
  /* ... */
}
```

#### `@Flyweight`

Instance pooling. Repeated construction with the same key returns the cached instance.

```typescript
@Flyweight({ key: (color: string) => color })
class TreeType {
  constructor(public color: string) {}
}
const t1 = new TreeType('green');
const t2 = new TreeType('green');
console.log(t1 === t2); // true
```

#### `@Proxy`

Wraps the class with a JS `Proxy`, with hooks for `before`, `after`, and `around` on methods.

```typescript
@Proxy({
  before: (method, args) => console.log(`> ${method}`, args),
  after: (method, ret) => console.log(`< ${method}`, ret),
})
class Service {
  doWork(x: number) {
    return x * 2;
  }
}
```

Hybrid: a generated typed proxy class for IDE support, runtime `Proxy` for behavior.

## GoF Behavioral (11)

Patterns about object communication and responsibilities.

#### `@ChainOfResponsibility` / `@Handler`

A class declares chain participation; `@Handler` methods are dispatched in order until one handles the request.

```typescript
@ChainOfResponsibility
class AuthMiddleware {
  @Handler({ order: 1 }) checkToken(req: Request) {
    /* ... */
  }
  @Handler({ order: 2 }) checkRole(req: Request) {
    /* ... */
  }
}
```

#### `@Command`

Class becomes a command object with `execute()` / `undo()` and an optional `@Undoable` history.

```typescript
@Command
class DeleteUser {
  constructor(private id: string) {}
  execute() {
    /* ... */
  }
  undo() {
    /* ... */
  }
}
```

#### `@Interpreter` (Marker-only)

DSL parsing is too domain-specific to automate. Annotation only; you still write the grammar.

#### `@Iterable` / `@Iterator`

Auto-implements `Symbol.iterator`. `@Iterable` on a class with one collection field is the simple case. `@Iterator` on a method allows custom iteration.

```typescript
@Iterable
class Playlist {
  @IterateOver songs: Song[] = [];
}
for (const song of playlist) {
  /* ... */
}
```

#### `@Mediator` (Marker-only)

Architectural coordination role. Annotation only.

#### `@Memento`

Adds `save(): Memento` and `restore(memento)` for state snapshots.

```typescript
@Memento
class Editor {
  content = '';
}
const snap = editor.save();
editor.content = 'oops';
editor.restore(snap); // reverts
```

#### `@Observer` / `@Observable`

Reactive property changes with a subscription API. Lombok's `@Observable` and the GoF Observer pattern collapse into one decorator here.

```typescript
@Observable
class Store {
  count = 0;
}
store.subscribe('count', (next, prev) => console.log(next, prev));
store.count++; // triggers
```

#### `@State`

Finite state machine on a class. `@Transition` on methods declares allowed transitions.

```typescript
@State({ states: ['draft', 'published', 'archived'], initial: 'draft' })
class Post {
  @Transition({ from: 'draft', to: 'published' }) publish() {}
  @Transition({ from: 'published', to: 'archived' }) archive() {}
}
```

#### `@Strategy`

Registers swappable algorithm classes under a strategy family.

```typescript
@Strategy('compression', 'gzip')
class GzipCompressor implements Compressor {}
@Strategy('compression', 'brotli')
class BrotliCompressor implements Compressor {}

const c = StrategyRegistry.get<Compressor>('compression', 'gzip');
```

#### `@TemplateMethod`

Codegen produces an abstract base class with `@Hook`-marked extension points.

```typescript
@TemplateMethod
class DataExporter {
  export() { this.fetch(); this.transform(); this.write(); }
  @Hook protected abstract fetch():     void;
  @Hook protected abstract transform(): void;
  @Hook protected abstract write():     void;
}
```

#### `@Visitor` / `@Visitable`

Double-dispatch. `@Visitable` classes accept `@Visitor` instances; codegen generates the dispatch table.

```typescript
@Visitable
class Circle {
  radius: number;
}
@Visitable
class Square {
  side: number;
}
@Visitor
class AreaVisitor {
  visitCircle(c: Circle) {
    return Math.PI * c.radius ** 2;
  }
  visitSquare(s: Square) {
    return s.side ** 2;
  }
}
```

## TypeScript-only utilities

No Java analogue, no GoF mapping. Idiomatic TS/JS runtime helpers, already specified as Tier 3 in [FEATURES.md](./FEATURES.md).

#### `@Memoize`

Method-result caching with optional TTL and LRU.

```typescript
@Memoize({ ttl: 60_000 }) async fetchUser(id: string) { /* ... */ }
```

#### `@Retry`

Configurable retry for async methods (attempts, delay, backoff strategy).

#### `@Debounce` / `@Throttle`

Rate-limited method calls.

#### `@Trace`

Auto-logs entry/exit with timing and arguments. Sensitive args can be redacted.

#### `@Validate`

Schema validation on assignment or construction. Pluggable backend (Zod, Yup, class-validator), see [ADR-10](./adr/0010-validation-library-coupling.md).

#### `@Serializable`

`toJSON()` plus a static `fromJSON()`, with field exclusion, transformers, and aliases.

#### `@DeepFreeze`

Recursively freezes all nested objects at construction time.

## Overlaps

Two cases where Lombok and GoF cover the same ground. One decorator serves both audiences:

| Decorator                   | Lombok view                | GoF view                                 |
| --------------------------- | -------------------------- | ---------------------------------------- |
| `@Builder`                  | Tier 1 boilerplate reducer | Creational pattern (fluent construction) |
| `@Observable` / `@Observer` | Tier 3 reactive utility    | Behavioral pattern (subject/observer)    |

No semantic conflicts; the documented behavior reads identical from both lenses. After de-dupe, 42 entries (vs 21 + 23 = 44 raw).

## What's not in here

The canonical GoF book lists 23 patterns, not 24 (see [ADR-16](./adr/0016-23-vs-24-gof-patterns.md)). Common candidates for an unofficial 24th, if we ever want one:

- **Object Pool**: reuse expensive instances. Strong candidate for a future `@Pool` decorator (similar to `@Flyweight` but with explicit lifecycle).
- **Null Object**: replace nullable references with safe no-op objects. Could become `@NullSafe`, or a complement to `@NonNull`.
- **Multiton**: keyed singletons. Already representable via `@Singleton` + `@Flyweight` composition.

Decision deferred to post-v1.0.

Other things explicitly out of scope:

- DI containers (NestJS, Inversify, tsyringe own this)
- State management (Redux, Zustand, MobX own this)
- ORM / repository abstractions
