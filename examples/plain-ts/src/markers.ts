import 'reflect-metadata';
import { Adapter, Bridge, Facade, Interpreter, Mediator } from '@a-dev-kit/lombok-typescript/legacy';

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

export function describeMarkers(): string {
  return [
    new LegacyAdapter().ping(),
    new Shape({ draw: () => {} }) instanceof Shape,
    CheckoutFacade.name,
    ChatRoom.name,
    MiniLang.name,
  ].join(',');
}
