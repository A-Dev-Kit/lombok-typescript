# @Mediator

**Marker-only** — documents a mediator that coordinates colleagues without tight coupling.

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Marker-only class  |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | No                 |

## Example

```ts
import { Mediator } from 'lombok-typescript/legacy';

@Mediator
class ChatRoom {
  private users: { name: string; send(room: ChatRoom, msg: string): void }[] = [];

  join(user: { name: string; send(room: ChatRoom, msg: string): void }) {
    this.users.push(user);
  }

  broadcast(from: string, message: string) {
    for (const user of this.users) {
      if (user.name !== from) user.send(this, message);
    }
  }
}
```

The decorator does not wire colleagues automatically — it marks the architectural role.
