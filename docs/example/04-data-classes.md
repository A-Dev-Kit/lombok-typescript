# Data classes

> **Phase 1+ preview.** None of these decorators are implemented yet. They ship in Phase 1 (`@Data`, `@Builder`, `@NonNull`, `@ToString`) and Phase 2 (`@Value`, `@With`, `@Equals` on its own, `@Getter`/`@Setter`, `@Accessors`, `@FieldDefaults`, `@Delegate`). Examples describe the planned API.

The decorators in this section take care of the boilerplate around classes that mostly hold data: getters, setters, builders, equality, string representation, immutable copies.

## `@Data`

The all-in-one. Generates getters and setters for every field, plus `toString()`, `equals()`, and a constructor.

```ts
import { Data } from 'lombok-typescript/legacy';

@Data
class User {
  name: string;
  readonly id: string;
  age?: number;
}

const u = new User('John', 'u1', 25);
u.getName();             // 'John'
u.setAge(26);
u.toString();            // 'User(name=John, id=u1, age=26)'
u.equals(new User(...)); // true if all fields match
```

Notes:

- `readonly` fields get a getter only, no setter.
- Optional fields (`age?:`) become optional in the constructor signature.
- `@Data` and `@Value` conflict (one is mutable, the other isn't). The codegen refuses the combination at compile time.

## `@Value`

Like `@Data` but immutable. Every field is `readonly`, no setters generated, instead you get `with*` methods to produce a new instance.

```ts
import { Value, With } from 'lombok-typescript/legacy';

@Value
class Point {
  x: number;
  y: number;
}

const p = new Point(1, 2);
const moved = p.withX(5); // new Point(5, 2); p unchanged
```

`@Value` implies `@With`; you don't need both. Use `@With` standalone if you want immutability without the rest of `@Value`.

## `@Builder`

Fluent construction. Generates a static `Builder()` method and a builder class with one setter per field.

```ts
import { Builder } from 'lombok-typescript/legacy';

@Builder
class User {
  name: string;
  age: number;
  email?: string;
}

const u = User.builder().name('John').age(25).email('j@example.com').build();
```

Combine with `@Data` for the most common case:

```ts
@Data
@Builder
class User {
  name: string;
  age: number;
}
```

For collection fields, `@Singular` lets you add one item at a time:

```ts
@Builder
class Team {
  name: string;
  @Singular tags: string[];
}

const t = Team.builder().name('alpha').tag('frontend').tag('typescript').build();
```

`@Builder.Default` keeps a default value when you skip the field in the builder chain:

```ts
@Builder
class User {
  name: string;
  @Builder.Default role: string = 'member';
}

User.builder().name('John').build().role; // 'member'
```

## `@With`

Per-field "copy with one change" methods. Generated as `with{FieldName}(value)`. Returns a new instance.

```ts
import { With } from 'lombok-typescript/legacy';

@With
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}

const p = new Point(1, 2);
const moved = p.withX(5); // new Point(5, 2)
```

Often used alongside `@Value`. If you only want immutability for select fields, `@With` is enough on its own.

## `@ToString`

Just the `toString()` method. Useful when you want a string form but don't want all the rest of `@Data`.

```ts
import { ToString } from 'lombok-typescript/legacy';

@ToString
class User {
  name: string = '';
  age: number = 0;
  @ToString.Exclude password: string = '';
}

new User().toString(); // 'User(name=, age=0)'  (password excluded)
```

`@ToString.Include` adds a getter or computed property to the output:

```ts
@ToString
class User {
  firstName: string = '';
  lastName: string = '';

  @ToString.Include
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
```

Format is configurable in `lombok.config.ts` via `formatToString`:

```ts
formatToString: {
  format: 'pretty',  // 'pretty' | 'json' | 'compact'
  includeClassName: true,
}
```

## `@Equals`

Just the `equals()` method. Deep structural comparison by default.

```ts
import { Equals } from 'lombok-typescript/legacy';

@Equals
class User {
  name: string = '';
  @Equals.Exclude tempId: string = ''; // not included in equality
}

new User().equals(new User()); // true regardless of tempId
```

Generates a static `User.equals(a, b)` form too, for null-safe comparisons.

## Composing them

Common pattern for a typical data class:

```ts
@Data
@Builder
class User {
  @NonNull name: string;
  age: number;
  email?: string;
}
```

`@Data` and `@Builder` are designed to work together. The codegen runs them in a defined order regardless of how you stacked them in source: `@FieldDefaults` first, then `@Data` / `@Value`, then field decorators (`@NonNull`, `@With`, etc.), then `@Builder`, then `@Log`, then runtime wrappers.

## What's missing here

`@Getter`, `@Setter`, `@Accessors`, `@FieldDefaults`, `@Delegate`, `@UtilityClass` ship in Phase 2. They follow the same patterns as the ones above; once they land, this doc gets filled out.

Next: [05-validation.md](./05-validation.md).
