# From class-validator

Use `@Validate` with the optional class-validator adapter subpath.

## Install

```bash
npm install lombok-typescript class-validator reflect-metadata
```

Enable the adapter once:

```typescript
import '@lombok-typescript/validators/class-validator';
```

## Mapping

| class-validator       | lombok-typescript                            |
| --------------------- | -------------------------------------------- |
| `@IsEmail()` on field | `@Validate([IsEmail()])`                     |
| `@MinLength(8)`       | `@Validate([MinLength(8)])`                  |
| `@IsOptional()`       | Optional field `?` + validators              |
| DTO class             | `@Validate` fields + `@Injectable()` in Nest |

## NestJS example

```typescript
import { Injectable } from '@nestjs/common';
import { Validate } from '@a-dev-kit/lombok-typescript/legacy';
import { IsEmail, MinLength } from 'class-validator';
import '@a-dev-kit/lombok-typescript/validators/class-validator';

@Injectable()
export class CreateUserDto {
  @Validate([IsEmail()])
  email = '';

  @Validate([MinLength(8)])
  password = '';
}
```

See [examples/nestjs](https://github.com/A-Dev-Kit/lombok-typescript/tree/main/examples/nestjs) for a runnable DTO.

Zod and Yup adapters: `lombok-typescript/validators/zod` and `validators/yup`.
