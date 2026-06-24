# @Facade

**Marker-only** — documents a facade that simplifies access to one or more subsystems.

|                         |                    |
| ----------------------- | ------------------ |
| **Kind**                | Marker-only class  |
| **Backends**            | `legacy`, `stage3` |
| **Requires `generate`** | No                 |

## Example

```ts
import { Facade } from 'lombok-typescript/legacy';

class PaymentApi {
  charge(amount: number) {
    return `charged ${amount}`;
  }
}

class InventoryApi {
  reserve(sku: string) {
    return `reserved ${sku}`;
  }
}

@Facade({ subsystems: [PaymentApi, InventoryApi] })
class CheckoutFacade {
  constructor(
    private payments = new PaymentApi(),
    private inventory = new InventoryApi(),
  ) {}
  checkout(sku: string, amount: number) {
    return [this.inventory.reserve(sku), this.payments.charge(amount)];
  }
}
```

Optional `subsystems` are stored in metadata for documentation tooling.
