# Lombok-TypeScript Feature List

> Implementation Approach: **Hybrid (Decorators + Codegen)**
> - Use decorators for marking/metadata
> - Use code generator (ts-morph) to generate companion code
> - Zero runtime overhead for generated code, decorators for runtime features

---

## Tier 1 - Must Have (High Value, High Feasibility)

### 1. @Builder
**Purpose:** Implements the builder pattern for fluent object creation

**Java Lombok:**
```java
@Builder
public class User {
    private String name;
    private int age;
}
// Usage: User.builder().name("John").age(25).build();
```

**TypeScript Target:**
```typescript
@Builder
class User {
  name: string;
  age: number;
}
// Usage: User.builder().name("John").age(25).build();
```

**Implementation Notes:**
- Generate a static `builder()` method
- Generate a `UserBuilder` class with fluent setters
- Support `@Builder.Default` for default values
- Support `@Singular` for collection fields

---

### 2. @Data
**Purpose:** Complete data class generation - combines multiple annotations

**Generates:**
- Getters for all fields
- Setters for all non-readonly fields
- `toString()` method
- `equals()` method
- `hashCode()` method (as `toHash()` in TS)
- Constructor with required fields

**TypeScript Target:**
```typescript
@Data
class User {
  name: string;
  readonly id: string;
  age?: number;
}
```

**Implementation Notes:**
- Analyze field modifiers (readonly, optional)
- Generate appropriate constructor signature
- Make it composable with other decorators

---

### 3. @Value
**Purpose:** Immutable data class (all fields readonly, no setters)

**TypeScript Target:**
```typescript
@Value
class User {
  name: string;  // Treated as readonly
  age: number;   // Treated as readonly
}
```

**Implementation Notes:**
- Mark all fields as `readonly` at compile time
- Generate only getters
- Generate `with*` methods for immutable updates
- Deep freeze the object at runtime

---

### 4. @NonNull
**Purpose:** Runtime null/undefined validation

**TypeScript Target:**
```typescript
class User {
  @NonNull name: string;
  
  greet(@NonNull message: string) { }
}
```

**Implementation Notes:**
- Throw `TypeError` if null/undefined is assigned
- Work on both fields and method parameters
- Provide clear error messages with field/param names
- Optional: integrate with validation libraries

---

### 5. @ToString
**Purpose:** Auto-generate `toString()` method

**TypeScript Target:**
```typescript
@ToString
class User {
  name: string;
  @ToString.Exclude password: string;
  @ToString.Include get fullName() { return this.name; }
}
// Output: "User(name=John, fullName=John Doe)"
```

**Implementation Notes:**
- Include all fields by default
- Support `@ToString.Exclude` to skip fields
- Support `@ToString.Include` for computed properties
- Configurable format (JSON, pretty, compact)

---

### 6. @Log
**Purpose:** Auto-inject a logger instance

**TypeScript Target:**
```typescript
@Log // Uses console by default
@Log('winston') // Uses winston
@Log('pino') // Uses pino
class UserService {
  doSomething() {
    this.log.info('Doing something');
  }
}
```

**Implementation Notes:**
- Support multiple logging backends (console, winston, pino, bunyan)
- Inject `log` property with appropriate type
- Support log level configuration
- Auto-include class name in log context

---

### 7. @With
**Purpose:** Generate immutable copy-with-change methods

**TypeScript Target:**
```typescript
@Value
class User {
  name: string;
  age: number;
}

const user = new User("John", 25);
const older = user.withAge(26); // Returns new User("John", 26)
```

**Implementation Notes:**
- Generate `with{FieldName}(value)` for each field
- Return new instance with updated field
- Preserve immutability
- Support deep copying for nested objects

---

## Tier 2 - Should Have (Good Value)

### 8. @Getter / @Setter
**Purpose:** Auto-generate getter/setter with optional hooks

**TypeScript Target:**
```typescript
class User {
  @Getter @Setter 
  private _name: string;
  
  @Getter 
  @Setter({ transform: (v) => v.trim() })
  private _email: string;
}
```

**Implementation Notes:**
- Generate get/set accessors
- Support transformation functions
- Support validation in setters
- Support lazy initialization in getters

---

### 9. @Accessors
**Purpose:** Configure accessor style (fluent, chain, prefix)

**TypeScript Target:**
```typescript
@Accessors({ fluent: true, chain: true })
class User {
  @Getter @Setter name: string;
  @Getter @Setter age: number;
}

// Fluent: user.name("John").age(25) instead of user.setName("John")
// Chain: setters return 'this' for method chaining
```

**Implementation Notes:**
- `fluent: true` - getter/setter same name as field
- `chain: true` - setters return `this`
- `prefix: string` - custom prefix for accessors

---

### 10. @UtilityClass
**Purpose:** Static-only utility class pattern

**TypeScript Target:**
```typescript
@UtilityClass
class StringUtils {
  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  isEmpty(str: string): boolean {
    return !str || str.length === 0;
  }
}

// Usage: StringUtils.capitalize("hello")
// Prevented: new StringUtils() // Error!
```

**Implementation Notes:**
- Make all methods static
- Throw error on instantiation
- Make class non-extendable
- Consider generating as object/namespace instead

---

### 11. @Delegate
**Purpose:** Delegate method calls to a composed field

**TypeScript Target:**
```typescript
class UserRepository {
  @Delegate
  private cache: Map<string, User>;
  
  // Automatically gets: get(), set(), has(), delete(), clear(), etc.
}
```

**Implementation Notes:**
- Introspect the delegate field type
- Generate wrapper methods for public methods
- Support `@Delegate.Exclude` to skip methods
- Support `@Delegate.Include` for whitelist approach

---

### 12. @Equals
**Purpose:** Deep equality comparison

**TypeScript Target:**
```typescript
@Equals
class User {
  name: string;
  @Equals.Exclude metadata: object;
}

user1.equals(user2); // Deep comparison of name only
```

**Implementation Notes:**
- Generate `equals(other: T): boolean` method
- Deep comparison by default
- Support `@Equals.Exclude` for fields to skip
- Support custom comparators for specific fields
- Generate static `equals(a, b)` method too

---

### 13. @FieldDefaults
**Purpose:** Set default access modifiers for all fields

**TypeScript Target:**
```typescript
@FieldDefaults({ access: 'private', readonly: true })
class User {
  name: string;  // Treated as: private readonly name: string
  age: number;   // Treated as: private readonly age: number
}
```

**Implementation Notes:**
- Apply at compile time via transformer
- Support `access: 'private' | 'protected' | 'public'`
- Support `readonly: boolean`
- Allow field-level overrides

---

## Tier 3 - Unique TypeScript Opportunities

These features don't exist in Java Lombok but are valuable for TypeScript.

### 14. @Memoize
**Purpose:** Cache expensive method/getter results

**TypeScript Target:**
```typescript
class Calculator {
  @Memoize
  fibonacci(n: number): number {
    if (n <= 1) return n;
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }
  
  @Memoize({ ttl: 60000 }) // Cache for 60 seconds
  async fetchUser(id: string): Promise<User> {
    return await api.getUser(id);
  }
}
```

**Implementation Notes:**
- Cache based on serialized arguments
- Support TTL (time-to-live)
- Support max cache size (LRU eviction)
- Support cache invalidation
- Work with both sync and async methods

---

### 15. @Debounce / @Throttle
**Purpose:** Rate-limit method calls

**TypeScript Target:**
```typescript
class SearchComponent {
  @Debounce(300)
  onSearchInput(query: string) {
    this.performSearch(query);
  }
  
  @Throttle(1000)
  onScroll(position: number) {
    this.updateVisibleItems(position);
  }
}
```

**Implementation Notes:**
- Debounce: delay execution until pause in calls
- Throttle: limit execution to once per interval
- Support leading/trailing edge options
- Support cancel/flush methods

---

### 16. @Trace
**Purpose:** Auto-log method entry/exit with timing

**TypeScript Target:**
```typescript
@Trace
class UserService {
  async createUser(data: UserData): Promise<User> {
    // Logs: "→ UserService.createUser({ name: 'John' })"
    // Logs: "← UserService.createUser [45ms] → User { id: '123' }"
    return await this.repo.create(data);
  }
}
```

**Implementation Notes:**
- Log method entry with arguments
- Log method exit with return value and duration
- Support async methods
- Configurable log level
- Support argument/return value sanitization (hide sensitive data)

---

### 17. @Retry
**Purpose:** Automatic retry logic for async methods

**TypeScript Target:**
```typescript
class ApiClient {
  @Retry({ attempts: 3, delay: 1000, backoff: 'exponential' })
  async fetchData(endpoint: string): Promise<Data> {
    return await fetch(endpoint).then(r => r.json());
  }
}
```

**Implementation Notes:**
- Configurable retry attempts
- Configurable delay between retries
- Support backoff strategies (fixed, linear, exponential)
- Support retry conditions (which errors to retry)
- Support timeout per attempt

---

### 18. @Validate
**Purpose:** Schema validation integration

**TypeScript Target:**
```typescript
class User {
  @Validate(z.string().email())
  email: string;
  
  @Validate(z.number().min(0).max(120))
  age: number;
}

// Or class-level with schema inference
@Validate
class User {
  email: string;  // Infers: z.string()
  age: number;    // Infers: z.number()
}
```

**Implementation Notes:**
- Integrate with Zod, Yup, or class-validator
- Validate on assignment
- Validate on construction
- Support custom error messages
- Generate schema from TypeScript types

---

### 19. @Observable
**Purpose:** Make properties reactive for frameworks

**TypeScript Target:**
```typescript
@Observable
class Store {
  count: number = 0;
  
  increment() {
    this.count++; // Automatically triggers subscribers
  }
}

store.subscribe('count', (newVal, oldVal) => {
  console.log(`Count changed: ${oldVal} → ${newVal}`);
});
```

**Implementation Notes:**
- Support subscription to property changes
- Support computed/derived properties
- Optional: integrate with RxJS
- Optional: integrate with framework reactivity (Vue, MobX)

---

### 20. @Serializable
**Purpose:** JSON serialization with custom transformers

**TypeScript Target:**
```typescript
@Serializable
class User {
  name: string;
  
  @Serializable.Exclude
  password: string;
  
  @Serializable.Transform((date) => date.toISOString())
  createdAt: Date;
  
  @Serializable.Alias('user_email')
  email: string;
}

const json = user.toJSON();  // Serialized with transforms
const user = User.fromJSON(json);  // Deserialized
```

**Implementation Notes:**
- Generate `toJSON()` method
- Generate static `fromJSON()` method
- Support field exclusion
- Support custom transformers (serialize/deserialize)
- Support field aliasing (different JSON key)
- Handle circular references

---

### 21. @DeepFreeze
**Purpose:** Create truly immutable objects

**TypeScript Target:**
```typescript
@DeepFreeze
class Config {
  database: {
    host: string;
    port: number;
  };
  features: string[];
}

const config = new Config();
config.database.host = 'new'; // TypeError: Cannot assign to read-only property
config.features.push('new');  // TypeError: Cannot add property
```

**Implementation Notes:**
- Recursively freeze all nested objects
- Freeze arrays (prevent push, pop, etc.)
- Apply at construction time
- TypeScript type should reflect `Readonly<T>` deeply

---

## Configuration System

### lombok.config.ts

```typescript
import { defineConfig } from 'lombok-typescript';

export default defineConfig({
  // Global settings
  log: {
    provider: 'winston',
    defaultLevel: 'info',
  },
  
  // Builder settings
  builder: {
    prefix: '',        // Method prefix (e.g., 'with' → withName())
    buildMethodName: 'build',
    builderMethodName: 'builder',
  },
  
  // ToString settings
  toString: {
    format: 'pretty',  // 'pretty' | 'json' | 'compact'
    includeClassName: true,
  },
  
  // Validation
  validate: {
    provider: 'zod',   // 'zod' | 'yup' | 'class-validator'
    throwOnError: true,
  },
  
  // Codegen
  codegen: {
    outputDir: '.lombok',
    watch: true,
  },
});
```

---

## Implementation Phases

### Phase 1: Foundation
- [ ] Project setup (TypeScript, build tools)
- [ ] Decorator infrastructure
- [ ] Metadata reflection system
- [ ] Code generator with ts-morph

### Phase 2: Core Features
- [ ] @NonNull
- [ ] @ToString
- [ ] @Equals
- [ ] @Getter / @Setter

### Phase 3: Data Classes
- [ ] @Data
- [ ] @Value
- [ ] @With
- [ ] @Builder

### Phase 4: Advanced Features
- [ ] @Log
- [ ] @Delegate
- [ ] @UtilityClass
- [ ] @FieldDefaults
- [ ] @Accessors

### Phase 5: TypeScript Unique
- [ ] @Memoize
- [ ] @Debounce / @Throttle
- [ ] @Trace
- [ ] @Retry
- [ ] @Validate
- [ ] @Observable
- [ ] @Serializable
- [ ] @DeepFreeze

---

## References

- [Project Lombok](https://projectlombok.org/)
- [TypeScript Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
- [ts-morph](https://ts-morph.com/)
- [reflect-metadata](https://github.com/rbuckton/reflect-metadata)

