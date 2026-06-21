import { Composite, Flyweight, Proxy } from '@a-dev-kit/lombok-typescript/legacy';

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
