# @Memoize

Caches method return values (runtime). Optional TTL in milliseconds.

```ts
class Api {
  @Memoize({ ttl: 60_000 })
  fetchUser(id: string) {
    return { id };
  }
}
```
