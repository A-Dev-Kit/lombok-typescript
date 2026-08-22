import 'reflect-metadata';
import {
  Cleanup,
  Data,
  Builder,
  DeepFreeze,
  ExtensionMethod,
  Retry,
  Serializable,
  Synchronized,
  Trace,
  Validate,
} from '@a-dev-kit/lombok-typescript/legacy';
import { z } from 'zod';
import '@a-dev-kit/lombok-typescript/validators/zod';

@Trace({ args: false, result: false, timing: true })
class ApiClient {
  private attempts = 0;

  @Retry({ attempts: 2, delay: 10 })
  async fetchStatus(): Promise<string> {
    this.attempts += 1;
    if (this.attempts === 1) throw new Error('transient');
    return 'ok';
  }
}

@Data
@Builder
class SignupDto {
  @Validate(z.string().email())
  email!: string;
}

@DeepFreeze
class FeatureFlags {
  enabled = { auth: true, billing: false };
}

@Serializable
class Profile {
  name: string;
  @Serializable.Exclude
  internalId: string;

  constructor(name: string, internalId: string) {
    this.name = name;
    this.internalId = internalId;
  }
}

/** Cleanup: fields with `close()`/custom methods auto-torn-down at `[Symbol.dispose]()`. */
class Session implements Disposable {
  @Cleanup() readonly conn = { close: () => teardownOrder.push('conn.close') };
  @Cleanup('end') readonly stream = { end: () => teardownOrder.push('stream.end') };
  declare [Symbol.dispose]: () => void;
}
const teardownOrder: string[] = [];

/** ExtensionMethod: a helper class's statics are installed as instance methods forwarding `this`. */
class BoxUtils {
  static describe(box: { value: number }, prefix: string): string {
    return `${prefix}:${box.value}`;
  }
  static double(box: { value: number }): number {
    return box.value * 2;
  }
}

@ExtensionMethod([BoxUtils])
class Box {
  constructor(public value: number) {}
  declare describe: (prefix: string) => string;
  declare double: () => number;
}

/** Synchronized: overlapping async calls queue, so read-modify-write can't interleave. */
class Wallet {
  balance = 100;

  @Synchronized()
  async withdraw(amount: number) {
    const before = this.balance;
    await new Promise((r) => setTimeout(r, 5)); // interleaving point without the mutex
    this.balance = before - amount;
  }
}

export async function demoPhase5Utilities() {
  const api = new ApiClient();
  const status = await api.fetchStatus();

  const wallet = new Wallet();
  await Promise.all([wallet.withdraw(50), wallet.withdraw(50)]);
  // 0 with Synchronized; 50 if the two calls had interleaved.
  const synchronizedBalance = wallet.balance;

  // Cleanup: `using` fires [Symbol.dispose]() which walks Cleanup fields in reverse.
  teardownOrder.length = 0;
  {
    using _session = new Session();
    // …use _session.conn / _session.stream…
  }
  // teardownOrder is now ['stream.end', 'conn.close'] (LIFO).
  const cleanupOrder = [...teardownOrder];

  const signup = SignupDto.builder().email('user@example.com').build();

  const flags = new FeatureFlags();
  const frozen = (() => {
    try {
      (flags.enabled as { auth: boolean }).auth = false;
      return false;
    } catch {
      return true;
    }
  })();

  const box = new Box(21);
  const boxExt = { described: box.describe('n'), doubled: box.double() };

  return {
    status,
    signupEmail: signup.email,
    frozen,
    synchronizedBalance,
    cleanupOrder,
    profileJson: { name: 'Ana', internalId: 'secret' },
    boxExt,
  };
}

export { ApiClient, SignupDto, FeatureFlags, Profile, Box };
