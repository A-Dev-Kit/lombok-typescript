# lombok-typescript

> Lombok-like decorators and code generation for TypeScript. Reduce boilerplate with powerful annotations.

## 🚀 Features

- **@Builder** - Fluent builder pattern for object creation
- **@Data** - Complete data class (getters, setters, toString, equals)
- **@Value** - Immutable data class
- **@NonNull** - Runtime null validation
- **@Log** - Auto-inject logger
- **@Memoize** - Cache method results
- **@Retry** - Automatic retry logic
- And many more...

## 📦 Installation

```bash
# Using npm
npm install lombok-typescript

# Using yarn
yarn add lombok-typescript

# Using pnpm
pnpm add lombok-typescript
```

> **Note:** This library requires Node.js >= 18.0.0

## 🔧 Quick Start

```typescript
import { Data, Builder, NonNull, Log } from 'lombok-typescript';

@Data
@Builder
@Log
class User {
  @NonNull name: string;
  age: number;
  email?: string;
}

// Builder pattern
const user = User.builder()
  .name('John')
  .age(25)
  .email('john@example.com')
  .build();

// Auto-generated toString
console.log(user.toString());
// Output: User(name=John, age=25, email=john@example.com)

// Auto-generated equals
const sameUser = User.builder().name('John').age(25).build();
console.log(user.equals(sameUser)); // true

// Logging
this.log.info('User created', { user });
```

## 📚 Documentation

See [docs/FEATURES.md](./docs/FEATURES.md) for the complete feature list and implementation details.

## 🏗️ Implementation Approach

This library uses a **hybrid approach**:

1. **Decorators (Runtime)** - Mark classes/fields with metadata
2. **Code Generation (Compile-time)** - Generate companion code using ts-morph

This provides the best of both worlds:
- Clean decorator syntax
- Zero runtime overhead for generated code
- Full TypeScript type support

## 🛠️ Development

> **Note:** Development uses Node.js 22 and pnpm. Use `nvm use` to switch to the correct Node version.

```bash
# Install dependencies (pnpm required for development)
pnpm install

# Build
pnpm build

# Test
pnpm test

# Type check
pnpm typecheck

# Watch mode
pnpm build:watch
```

## 📄 License

MIT

