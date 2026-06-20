import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import { Factory, Memoize, Singleton, createFromFactory } from '@a-dev-kit/lombok-typescript/legacy';

@Injectable()
@Singleton
export class AppService {
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

export function demoNestInterop() {
  const service = new AppService();
  const same = new AppService();
  const email = createFromFactory<{ channel: string }>('email');
  return {
    singleton: service === same,
    memoized: service.greet('Nest') === service.greet('Nest'),
    factory: email.channel,
  };
}
