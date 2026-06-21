import {
  AbstractFactory,
  Composite,
  Flyweight,
  Hook,
  Proxy,
  TemplateMethod,
  Visitable,
  Visitor,
  Wraps,
} from '@a-dev-kit/lombok-typescript/legacy';

@Flyweight({ key: (...args: unknown[]) => String(args[0]) })
export class TreeType {
  constructor(public color: string) {}
}

@Composite
export class FileNode {
  name = '';
}

@Proxy({
  before: (method: string) => console.info(`[proxy] before ${method}`),
})
export class Service {
  work() {
    return 'done';
  }
}

export class Coffee {
  cost() {
    return 2;
  }
}

/** GoF Decorator — wraps {@link Coffee}. */
@Wraps(Coffee)
export class WithMilk {
  cost() {
    return this.inner.cost() + 0.5;
  }
}

@TemplateMethod({ steps: ['fetch', 'transform', 'write'], template: 'export' })
export class DataExporter {
  log: string[] = [];

  @Hook()
  fetch() {
    this.log.push('fetch');
  }

  @Hook()
  transform() {
    this.log.push('transform');
  }

  @Hook()
  write() {
    this.log.push('write');
  }
}

@AbstractFactory(['Button', 'Dialog'])
export abstract class UIFactory {}

/** Product placeholders for {@link UIFactory} codegen. */
export class Button {}
export class Dialog {}

@Visitable
export class Circle {
  radius = 1;
}

@Visitable
export class Square {
  side = 2;
}

@Visitor({ visitMethods: { Circle: 'visitCircle', Square: 'visitSquare' } })
export class AreaVisitor {
  visitCircle(c: Circle) {
    return Math.PI * c.radius ** 2;
  }

  visitSquare(s: Square) {
    return s.side ** 2;
  }
}
