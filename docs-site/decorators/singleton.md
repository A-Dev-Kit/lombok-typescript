# @Singleton

Returns the same instance for every `new` call (runtime).

```ts
@Singleton
class Cache {}
```

In NestJS, prefer `@Injectable()` scope instead of stacking both.
