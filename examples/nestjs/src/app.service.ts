import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import { LogNest } from '@a-dev-kit/lombok-typescript/nestjs';
import {
  Factory,
  Memoize,
  Pool,
  type Pooled,
  Singleton,
  createFromFactory,
} from '@a-dev-kit/lombok-typescript/legacy';

@Injectable()
@Singleton
export class AppService {
  @LogNest({ context: 'AppService' })
  @Memoize()
  greet(name: string): string {
    return `Hello, ${name}!`;
  }
}

@Factory('email')
@Injectable()
export class EmailNotifier {
  channel = 'email';
}

@Factory('sms')
@Injectable()
export class SmsNotifier {
  channel = 'sms';
}

/**
 * @Pool reuses helper instances *within* the (Nest-singleton) provider — this is
 * object reuse, not a Nest provider-scope replacement. @Pool coexists with any
 * @Injectable scope.
 */
@Pool({ size: 2, reset: (h: RequestHasher) => (h.count = 0) })
export class RequestHasher {
  count = 0;
  hash(value: string): string {
    this.count += 1;
    return `h(${value})#${this.count}`;
  }
}
const HasherPool = RequestHasher as Pooled<typeof RequestHasher>;

export function demoNestInterop() {
  const service = new AppService();
  const same = new AppService();
  const email = createFromFactory<{ channel: string }>('email');
  const h = HasherPool.acquire();
  const digest = h.hash('nest');
  HasherPool.release(h);
  return {
    singleton: service === same,
    memoized: service.greet('Nest') === service.greet('Nest'),
    factory: email.channel,
    pooled: digest,
  };
}
