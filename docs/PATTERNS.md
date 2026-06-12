# PATTERNS — Unified Decorator Catalog

> Authoritative catalog of every decorator candidate in `lombok-typescript`.
> Sources: Lombok-port (from [FEATURES.md](./FEATURES.md)) + Gang-of-Four (GoF) design patterns + TypeScript-unique extras.
>
> Use this doc to look up "what's a decorator", "where does it fit", "is it real or marker-only".
> See [MVP.md](./MVP.md) for phasing and scope decisions, and [DECISIONS.md](./DECISIONS.md) for open architectural questions referenced inline (e.g. ADR-15).

---

## Legend

**Source**
- `Lombok` — port of a Java Lombok feature
- `GoF-C` / `GoF-S` / `GoF-B` — Gang-of-Four Creational / Structural / Behavioral
- `TS-Unique` — no Java equivalent; specific to TypeScript / JS runtime

**Target** — what the decorator attaches to: `class`, `field`, `method`, `param`

**Mode**
- `Runtime` — pure runtime decorator using `reflect-metadata` (or Stage 3 metadata once decided in ADR-01/02)
- `Codegen` — relies on the ts-morph code generator (compile-time)
- `Hybrid` — runtime metadata + codegen companion

**Viability**
- `Real` — mechanically automatable; the decorator does meaningful work
- `Helper` — provides utilities/scaffolding to implement the pattern, but the user still writes most logic
- `Marker-only` — the pattern is architectural; the decorator only documents intent and provides typing aids

---

## Catalog at a glance

| # | Name | Source | Target | Mode | Viability | Phase |
|---|---|---|---|---|---|---|
| 1 | `@Builder` | Lombok / GoF-C | class | Codegen | Real | 1 |
| 2 | `@Data` | Lombok | class | Codegen | Real | 1 |
| 3 | `@Value` | Lombok | class | Codegen | Real | 2 |
| 4 | `@NonNull` | Lombok | field/param | Runtime | Real | 1 |
| 5 | `@ToString` | Lombok | class | Codegen | Real | 1 |
| 6 | `@Log` | Lombok | class | Runtime | Real | 2 |
| 7 | `@With` | Lombok | class | Codegen | Real | 2 |
| 8 | `@Getter` / `@Setter` | Lombok | field | Codegen | Real | 2 |
| 9 | `@Accessors` | Lombok | class | Codegen | Real | 2 |
| 10 | `@UtilityClass` | Lombok | class | Hybrid | Real | 2 |
| 11 | `@Delegate` | Lombok | field | Codegen | Real | 2 |
| 12 | `@Equals` | Lombok | class | Codegen | Real | 2 |
| 13 | `@FieldDefaults` | Lombok | class | Codegen | Real | 2 |
| 14 | `@Singleton` | GoF-C | class | Runtime | Real | 1 |
| 15 | `@Factory` | GoF-C | class/method | Hybrid | Real | 1 |
| 16 | `@AbstractFactory` | GoF-C | class | Codegen | Helper | 4 |
| 17 | `@Prototype` | GoF-C | class | Runtime | Real | 1 |
| 18 | `@Adapter` | GoF-S | class | Runtime | Marker-only | 6 |
| 19 | `@Bridge` | GoF-S | class | — | Marker-only | 6 |
| 20 | `@Composite` | GoF-S | class | Runtime | Real | 4 |
| 21 | `@Wraps` (GoF Decorator) | GoF-S | class | Runtime | Real | 4 |
| 22 | `@Facade` | GoF-S | class | — | Marker-only | 6 |
| 23 | `@Flyweight` | GoF-S | class | Runtime | Real | 4 |
| 24 | `@Proxy` | GoF-S | class/method | Hybrid | Real | 4 |
| 25 | `@ChainOfResponsibility` / `@Handler` | GoF-B | class/method | Runtime | Real | 3 |
| 26 | `@Command` | GoF-B | class | Runtime | Real | 3 |
| 27 | `@Interpreter` | GoF-B | class | — | Marker-only | 6 |
| 28 | `@Iterable` / `@Iterator` | GoF-B | class/field | Runtime | Real | 3 |
| 29 | `@Mediator` | GoF-B | class | — | Marker-only | 6 |
| 30 | `@Memento` | GoF-B | class | Runtime | Real | 3 |
| 31 | `@Observer` / `@Observable` | GoF-B / Lombok | class/field | Runtime | Real | 3 |
| 32 | `@State` | GoF-B | class | Runtime | Real | 3 |
| 33 | `@Strategy` | GoF-B | class | Runtime | Real | 3 |
| 34 | `@TemplateMethod` | GoF-B | class | Codegen | Real | 4 |
| 35 | `@Visitor` / `@Visitable` | GoF-B | class | Hybrid | Real | 4 |
| 36 | `@Memoize` | TS-Unique | method/getter | Runtime | Real | 1 |
| 37 | `@Retry` | TS-Unique | method | Runtime | Real | 5 |
| 38 | `@Debounce` / `@Throttle` | TS-Unique | method | Runtime | Real | 5 |
| 39 | `@Trace` | TS-Unique | class/method | Runtime | Real | 5 |
| 40 | `@Validate` | TS-Unique | field/class | Hybrid | Real | 5 |
| 41 | `@Serializable` | TS-Unique | class | Hybrid | Real | 5 |
| 42 | `@DeepFreeze` | TS-Unique | class | Runtime | Real | 5 |

**Totals:** 42 entries (after dedupe of `@Builder` and `@Observer`/`@Observable`). 36 Real + 1 Helper + 5 Marker-only.

---

## 1. Lombok-port decorators

Direct ports from Java's Project Lombok. Detailed semantics live in [FEATURES.md](./FEATURES.md); this section is the index.

### Tier 1 — Must Have

#### `@Builder`
Fluent builder pattern. **Overlaps with GoF Creational Builder** — single decorator covers both surfaces.
```typescript
@Builder
class User { name: string; age: number; }
const u = User.builder().name('John').age(25).build();
```
Notes: supports `@Builder.Default` and `@Singular` for collections. Generated `UserBuilder` companion class consumed via codegen.

#### `@Data`
Combines `@Getter` + `@Setter` + `@ToString` + `@Equals` + constructor.
```typescript
@Data class User { name: string; readonly id: string; age?: number; }
```
Notes: conflicts with `@Value` (mutable vs immutable) — see ADR-07.

#### `@Value`
Immutable data class. All fields readonly, no setters, only `with*` methods for evolution.
```typescript
@Value class User { name: string; age: number; }
```
Notes: implies `@With`. Composing with `@Data` is forbidden.

#### `@NonNull`
Runtime null/undefined validation on fields and method parameters.
```typescript
class User { @NonNull name: string; greet(@NonNull msg: string) {} }
```
Notes: throws `TypeError` with a clear field/param name. Pure runtime.

#### `@ToString`
Auto-generates `toString()`. Supports `@ToString.Exclude` and `@ToString.Include` on fields/getters.
```typescript
@ToString class User { name: string; @ToString.Exclude password: string; }
// "User(name=John)"
```

#### `@Log`
Injects a logger as `this.log`. Configurable backend (`console` | `winston` | `pino` | `bunyan`) — see ADR-09.
```typescript
@Log('winston') class UserService { do() { this.log.info('hi'); } }
```
NestJS note: collides with NestJS's built-in `Logger`. Recommend opting into one or the other per class.

#### `@With`
Generates `with{FieldName}(value)` immutable update methods.
```typescript
@Value class User { name: string; age: number; }
const older = user.withAge(26);
```

### Tier 2 — Should Have

#### `@Getter` / `@Setter`
Per-field accessors. Optional transform/validation hooks.
```typescript
class User { @Getter @Setter private _name: string; }
```

#### `@Accessors`
Class-level accessor style: `fluent`, `chain`, `prefix`.
```typescript
@Accessors({ fluent: true, chain: true })
class User { @Getter @Setter name: string; }
```

#### `@UtilityClass`
Static-only utility class. All methods become static; instantiation throws.
```typescript
@UtilityClass class StringUtils { capitalize(s: string) { return s[0].toUpperCase() + s.slice(1); } }
StringUtils.capitalize('hi'); // works
new StringUtils(); // throws
```

#### `@Delegate`
Forwards method calls to a composed field's public methods.
```typescript
class Repo { @Delegate private cache: Map<string, User>; }
```

#### `@Equals`
Generates `equals(other)` with optional `@Equals.Exclude` per field.
```typescript
@Equals class User { name: string; @Equals.Exclude tempId: string; }
```

#### `@FieldDefaults`
Apply default access modifiers / readonly to all fields.
```typescript
@FieldDefaults({ access: 'private', readonly: true })
class User { name: string; age: number; }
```

---

## 2. GoF Creational Patterns (5)

Patterns about object instantiation.

#### `@Singleton`
Enforces single instance per class. `new Foo()` always returns the same instance.
```typescript
@Singleton class AppConfig { dbUrl = 'postgres://...'; }
const a = new AppConfig();
const b = new AppConfig();
console.log(a === b); // true
```
NestJS note: NestJS providers are already singletons by default within a module scope. Avoid stacking `@Singleton` with `@Injectable()` — pick one mechanism per class.

#### `@Factory`
Registers classes as factory targets, exposes a static `Factory.create(key, ...args)` registry.
```typescript
@Factory('email') class EmailNotifier {}
@Factory('sms')   class SmsNotifier {}

const notifier = Factory.create('email'); // EmailNotifier instance
```
Notes: hybrid — runtime registry + codegen-generated typed `create()` overloads.

#### `@AbstractFactory`
Family of related factories. Marked `Helper` because abstract factory is inherently architectural — the decorator scaffolds the base + derived factory classes but the user wires concrete products.
```typescript
@AbstractFactory(['Button', 'Dialog'])
class UIFactory {}
class MaterialFactory extends UIFactory { /* ... */ }
class FluentFactory extends UIFactory { /* ... */ }
```

#### `@Prototype`
Adds a `clone()` method that performs deep clone of the instance.
```typescript
@Prototype class Document { title = ''; pages: Page[] = []; }
const copy = doc.clone(); // independent deep copy
```
Notes: uses [src/utils/index.ts → deepClone](../src/utils/index.ts) helper. Conflicts with NestJS `@Injectable({ scope: Scope.TRANSIENT })` semantically — not technically but worth a doc note.

#### `@Builder` *(see Lombok section)*
Listed under both Lombok and GoF Creational — the same decorator implementation serves both audiences.

---

## 3. GoF Structural Patterns (7)

Patterns about composing classes and objects.

#### `@Adapter` — _Marker-only_
TypeScript already supports interface-based adapters trivially. The decorator only annotates intent for documentation/tooling.
```typescript
@Adapter({ adapts: LegacyApi, target: ModernApi })
class LegacyApiAdapter implements ModernApi { /* manual implementation */ }
```
Rationale: there's no mechanical code we can generate that beats hand-writing the interface methods. Marker-only.

#### `@Bridge` — _Marker-only_
Architectural separation between abstraction and implementation. Cannot be auto-generated meaningfully.
```typescript
@Bridge class Shape { constructor(protected renderer: Renderer) {} }
```

#### `@Composite`
Adds tree-composition methods (`add`, `remove`, `getChild`, `traverse`) and a polymorphic operation runner.
```typescript
@Composite class FileNode { name: string; }
const root = new FileNode();
root.add(child1); root.add(child2);
root.traverse(node => console.log(node.name));
```

#### `@Wraps` (GoF "Decorator" pattern)
**Renamed to avoid clash with TS `@decorator` syntax — see ADR-15.** Wraps an existing class instance to add behavior.
```typescript
@Wraps(Coffee)
class WithMilk {
  cost() { return this.inner.cost() + 0.5; }
}
const drink = new WithMilk(new Coffee());
```

#### `@Facade` — _Marker-only_
Architectural simplification of a subsystem. Annotation only.
```typescript
@Facade({ subsystems: [PaymentApi, InventoryApi, ShippingApi] })
class CheckoutFacade { /* ... */ }
```

#### `@Flyweight`
Instance pooling — repeated construction with the same key returns the cached instance.
```typescript
@Flyweight({ key: (color: string) => color })
class TreeType { constructor(public color: string) {} }
const t1 = new TreeType('green');
const t2 = new TreeType('green');
console.log(t1 === t2); // true
```

#### `@Proxy`
Auto-wraps the class with a JS `Proxy`, with hooks for `before`/`after`/`around` on methods.
```typescript
@Proxy({
  before: (method, args) => console.log(`→ ${method}`, args),
  after:  (method, ret)  => console.log(`← ${method}`, ret),
})
class Service { doWork(x: number) { return x * 2; } }
```
Notes: hybrid — generated typed proxy class for IDE support, runtime Proxy for behavior.

---

## 4. GoF Behavioral Patterns (11)

Patterns about object communication and responsibilities.

#### `@ChainOfResponsibility` / `@Handler`
A class declares chain participation; `@Handler` methods are dispatched in order until one handles the request.
```typescript
@ChainOfResponsibility
class AuthMiddleware {
  @Handler({ order: 1 }) checkToken(req: Request) { /* ... */ }
  @Handler({ order: 2 }) checkRole(req: Request)  { /* ... */ }
}
```

#### `@Command`
Class becomes a command object with `execute()`/`undo()` plus optional `@Undoable` history.
```typescript
@Command
class DeleteUser {
  constructor(private id: string) {}
  execute() { /* ... */ }
  undo()    { /* ... */ }
}
```

#### `@Interpreter` — _Marker-only_
DSL parsing is too domain-specific to automate. Annotation only; users still write the grammar.

#### `@Iterable` / `@Iterator`
Auto-implements `Symbol.iterator`. `@Iterable` on a class with one collection field is the simple case; `@Iterator` on a method allows custom iteration.
```typescript
@Iterable class Playlist { @IterateOver songs: Song[] = []; }
for (const song of playlist) { /* ... */ }
```

#### `@Mediator` — _Marker-only_
Architectural coordination role. Annotation only.

#### `@Memento`
Adds `save(): Memento` and `restore(memento)` for state snapshots.
```typescript
@Memento class Editor { content = ''; }
const snap = editor.save();
editor.content = 'oops';
editor.restore(snap); // reverts
```

#### `@Observer` / `@Observable`
**Overlaps with Lombok `@Observable`** — single decorator. Reactive property changes with subscription API.
```typescript
@Observable class Store { count = 0; }
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
@Strategy('compression', 'gzip') class GzipCompressor implements Compressor {}
@Strategy('compression', 'brotli') class BrotliCompressor implements Compressor {}

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
@Visitable class Circle  { radius: number; }
@Visitable class Square  { side: number; }
@Visitor   class AreaVisitor {
  visitCircle(c: Circle) { return Math.PI * c.radius ** 2; }
  visitSquare(s: Square) { return s.side ** 2; }
}
```

---

## 5. TypeScript-Unique decorators

These have no Java Lombok equivalent and no GoF mapping — they're idiomatic TS/JS runtime utilities. Already specified in [FEATURES.md](./FEATURES.md) Tier 3.

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
Auto-logs entry/exit with timing and arguments. Supports sensitive-arg redaction.

#### `@Validate`
Schema validation on assignment / construction. Pluggable backend (Zod / Yup / class-validator) — see ADR-10.

#### `@Serializable`
`toJSON()` + static `fromJSON()` with field exclusion, transformers, aliases.

#### `@DeepFreeze`
Recursively freezes all nested objects at construction time.

---

## 6. Overlap & dedupe

Two cases where Lombok and GoF cover the same ground — we ship one decorator that satisfies both audiences:

| Decorator | Lombok view | GoF view |
|---|---|---|
| `@Builder` | Tier 1 boilerplate reducer | Creational pattern (fluent construction) |
| `@Observable` / `@Observer` | Tier 3 reactive utility | Behavioral pattern (subject/observer) |

No semantic conflicts — the documented behavior is identical from both lenses. Catalog count after dedupe: **42 entries** (vs 21 + 23 = 44 raw).

---

## 7. Patterns NOT (yet) included

The user mentioned "24 GoF patterns" but the canonical book lists 23 (see ADR-16). Common candidates for an unofficial 24th:

- **Object Pool** — reuse expensive instances. Strong candidate for a future `@Pool` decorator (similar to `@Flyweight` but with explicit lifecycle).
- **Null Object** — replace nullable references with safe no-op objects. Could become `@NullSafe` or a complement to `@NonNull`.
- **Multiton** — keyed singletons. Already representable via `@Singleton` + `@Flyweight` composition.

Decision deferred to a post-v1.0 release. See ADR-16.

Other patterns explicitly **out of scope** for now:
- DI container (NestJS, Inversify, tsyringe already exist)
- State management (Redux, Zustand, MobX already exist)
- ORM / repository abstractions

---

## 8. Cross-references

- Phasing & MVP scope per decorator → [MVP.md](./MVP.md)
- Open architectural questions (ADR-01 through ADR-17) → [DECISIONS.md](./DECISIONS.md)
- Original Lombok spec (Tier 1/2/3 detail) → [FEATURES.md](./FEATURES.md)
