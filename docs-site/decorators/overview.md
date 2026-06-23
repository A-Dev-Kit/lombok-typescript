# Decorator overview

All decorators are exported from **`lombok-typescript/legacy`** and **`lombok-typescript/stage3`**.

## Phase 1 (v0.1)

| Decorator                             | Kind              | Codegen? | Summary                                   |
| ------------------------------------- | ----------------- | -------- | ----------------------------------------- |
| [`@NonNull`](/decorators/non-null)    | Runtime field     | No       | Reject `null` / `undefined` on assignment |
| [`@ToString`](/decorators/to-string)  | Codegen           | Yes      | Generated `toString()`                    |
| [`@Builder`](/decorators/builder)     | Codegen           | Yes      | Fluent builder class                      |
| [`@Data`](/decorators/data)           | Codegen composite | Yes      | Getters, setters, `equals`, `toString`    |
| [`@Singleton`](/decorators/singleton) | Runtime class     | No       | Single shared instance per class          |
| [`@Prototype`](/decorators/prototype) | Runtime class     | No       | New instance on every `new`               |
| [`@Factory`](/decorators/factory)     | Hybrid            | Partial  | Named factory registry                    |
| [`@Memoize`](/decorators/memoize)     | Runtime method    | No       | Cache method results by arguments         |

## Phase 2 (v0.2.0–0.4.0)

| Decorator                                          | Kind              | Codegen? | Summary                             |
| -------------------------------------------------- | ----------------- | -------- | ----------------------------------- |
| [`@Value`](/decorators/value)                      | Codegen composite | Yes      | Immutable `@Data` + `with*`         |
| [`@With`](/decorators/with)                        | Codegen           | Yes      | Per-field immutable copy helpers    |
| [`@Equals`](/decorators/equals)                    | Codegen           | Yes      | Structural `equals` + static helper |
| [`@Getter` / `@Setter`](/decorators/getter-setter) | Codegen field     | Yes      | Single-field accessors              |
| [`@Log`](/decorators/log)                          | Runtime           | No       | Method entry logging                |
| [`@Accessors`](/decorators/accessors)              | Codegen metadata  | Yes      | Fluent/chained setter style         |
| [`@UtilityClass`](/decorators/utility-class)       | Runtime           | No       | Uninstantiable utility holder       |
| [`@FieldDefaults`](/decorators/field-defaults)     | Codegen metadata  | Yes      | Default readonly for generated code |
| [`@Delegate`](/decorators/delegate)                | Codegen field     | Yes      | Forward methods to a field          |

`@Data` and `@Value` **cannot** be combined — codegen enforces this at generation time.

## Phase 3 (v0.5.0–v0.6.0)

| Decorator                                                       | Kind    | Codegen? | Summary                         |
| --------------------------------------------------------------- | ------- | -------- | ------------------------------- |
| [`@Strategy`](/decorators/strategy)                             | Hybrid  | No       | Two-level algorithm registry    |
| [`@State` / `@Transition`](/decorators/state)                   | Runtime | No       | Finite state machine            |
| [`@Command`](/decorators/command)                               | Runtime | No       | Command objects + undo stack    |
| [`@Memento`](/decorators/memento)                               | Runtime | No       | Snapshot / restore              |
| [`@Observable`](/decorators/observable)                         | Runtime | No       | Reactive property subscriptions |
| [`@ChainOfResponsibility`](/decorators/chain-of-responsibility) | Runtime | No       | Ordered handler chain           |
| [`@Iterable`](/decorators/iterable)                             | Runtime | No       | `Symbol.iterator` over a field  |

Observer adapters: [RxJS / MobX](/decorators/observers-adapters).

## Phase 4a (v0.7.0)

| Decorator                             | Kind             | Codegen? | Summary                            |
| ------------------------------------- | ---------------- | -------- | ---------------------------------- |
| [`@Flyweight`](/decorators/flyweight) | Runtime          | No       | Instance pool keyed by constructor |
| [`@Proxy`](/decorators/proxy)         | Hybrid (runtime) | No       | Method before/after hooks          |
| [`@Composite`](/decorators/composite) | Runtime          | Shim     | Tree add/remove/traverse API       |

## Phase 4b (v0.8.0)

| Decorator                                                  | Kind               | Codegen? | Summary                           |
| ---------------------------------------------------------- | ------------------ | -------- | --------------------------------- |
| [`@Wraps`](/decorators/wraps)                              | Runtime            | Shim     | GoF Decorator — inner delegation  |
| [`@TemplateMethod` / `@Hook`](/decorators/template-method) | Codegen + metadata | Yes      | Ordered template method steps     |
| [`@AbstractFactory`](/decorators/abstract-factory)         | Codegen Helper     | Yes      | Abstract product factory stubs    |
| [`@Visitor` / `@Visitable`](/decorators/visitor)           | Hybrid             | Yes      | Double-dispatch `accept(visitor)` |

## Phase 5 (v0.9.0)

| Decorator                                              | Kind               | Codegen? | Summary                              |
| ------------------------------------------------------ | ------------------ | -------- | ------------------------------------ |
| [`@Retry`](/decorators/retry)                          | Runtime method     | No       | Async retry with backoff             |
| [`@Debounce` / `@Throttle`](/decorators/debounce-throttle) | Runtime method | No       | Debounce or throttle invocations     |
| [`@Trace`](/decorators/trace)                          | Runtime            | No       | Method entry/exit logging            |
| [`@DeepFreeze`](/decorators/deep-freeze)               | Runtime class      | No       | Recursive `Object.freeze` on `new`   |
| [`@Validate`](/decorators/validate)                    | Hybrid             | Partial  | Zod/Yup/class-validator adapters   |
| [`@Serializable`](/decorators/serializable)            | Hybrid             | Yes      | `toJSON` / `fromJSON` codegen        |

Validator adapters: `lombok-typescript/validators/{zod,yup,class-validator}` (optional peer deps).

## Codegen decorators

Run after changing decorated classes:

```bash
lombok-ts generate
# or watch for changes:
lombok-ts watch
```

Then call `applyAllGenerated` (or per-class `apply*Generated`) from the `.lombok.ts` companion.

## Choosing a backend

```ts
// Legacy
import { Data, Value } from 'lombok-typescript/legacy';

// Stage 3
import { Data, Value } from 'lombok-typescript/stage3';
```

See [Getting started](/guide/getting-started) for tsconfig requirements.
