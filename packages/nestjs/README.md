# @lombok-typescript/nestjs

Opt-in NestJS integration for [lombok-typescript](https://github.com/A-Dev-Kit/lombok-typescript).

## Install

```bash
npm install lombok-typescript @lombok-typescript/nestjs @nestjs/common @nestjs/core reflect-metadata
```

## Usage

```typescript
import { Module } from '@nestjs/common';
import { LombokModule, LogNest } from '@lombok-typescript/nestjs';

@Module({
  imports: [LombokModule.forRoot({ logAdapter: 'nest', defaultProviderScope: 'DEFAULT' })],
})
export class AppModule {}

@Injectable()
class OrdersService {
  @LogNest({ context: 'OrdersService' })
  list() {
    return [];
  }
}
```

See the main docs site **NestJS integration** guide for scope tables and migration notes.
