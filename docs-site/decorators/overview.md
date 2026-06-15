# Decorator overview (v0.1)

| Decorator    | Kind              | Backend         |
| ------------ | ----------------- | --------------- |
| `@NonNull`   | Runtime field     | legacy + stage3 |
| `@ToString`  | Codegen           | legacy + stage3 |
| `@Builder`   | Codegen           | legacy + stage3 |
| `@Data`      | Codegen composite | legacy + stage3 |
| `@Singleton` | Runtime class     | legacy + stage3 |
| `@Prototype` | Runtime class     | legacy + stage3 |
| `@Factory`   | Hybrid registry   | legacy + stage3 |
| `@Memoize`   | Runtime method    | legacy + stage3 |

Run `lombok-ts generate` after applying codegen decorators.
