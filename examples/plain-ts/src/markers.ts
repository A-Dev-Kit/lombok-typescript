import 'reflect-metadata';
import {
  Adapter,
  Bridge,
  Facade,
  Interpreter,
  Mediator,
  NullObject,
} from '@a-dev-kit/lombok-typescript/legacy';

class TargetApi {
  ping(): string {
    return 'pong';
  }
}

class LegacyApi {
  hello() {
    return 'pong';
  }
}

@Adapter({ adapts: LegacyApi, target: TargetApi })
class LegacyAdapter implements TargetApi {
  private inner = new LegacyApi();
  ping() {
    return this.inner.hello();
  }
}

@Bridge
class Shape {
  constructor(protected renderer: { draw(): void }) {}
}

@Facade({ subsystems: [LegacyApi] })
class CheckoutFacade {}

@Mediator
class ChatRoom {}

@Interpreter
class MiniLang {}

// GoF Null Object — a safe do-nothing implementation of the ConsoleLogger contract.
class ConsoleLogger {
  log(msg: string) {
    console.info(msg);
  }
}

@NullObject({ of: ConsoleLogger })
class NullLogger implements ConsoleLogger {
  log(_msg: string) {
    /* no-op */
  }
}

export function describeMarkers(): string {
  return [
    new LegacyAdapter().ping(),
    new Shape({ draw: () => {} }) instanceof Shape,
    CheckoutFacade.name,
    ChatRoom.name,
    MiniLang.name,
    (new NullLogger().log('quiet'), NullLogger.name),
  ].join(',');
}
