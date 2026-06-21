import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { Composite, Flyweight, Proxy } from '../../legacy/index.js';
import {
  Composite as CompositeS3,
  Flyweight as FlyweightS3,
  Proxy as ProxyS3,
} from '../../stage3/index.js';

describe('Phase 4a legacy @Flyweight', () => {
  it('returns the same instance for the same key', () => {
    @Flyweight({ key: (...args: unknown[]) => String(args[0]) })
    class TreeType {
      constructor(public color: string) {}
    }

    const a = new TreeType('green');
    const b = new TreeType('green');
    const c = new TreeType('brown');
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a.color).toBe('green');
  });

  it('throws when key function is missing', () => {
    expect(() => {
      // @ts-expect-error invalid options
      @Flyweight({})
      class _Bad {}
      void _Bad;
    }).toThrow(/key/);
  });
});

describe('Phase 4a legacy @Composite', () => {
  it('adds, removes, and traverses children', () => {
    @Composite
    class Node {
      name = '';
    }

    type CompositeNode = InstanceType<typeof Node> & {
      add(child: object): void;
      remove(child: object): void;
      getChild(index: number): object;
      getChildren(): readonly object[];
      traverse(callback: (node: object) => void): void;
      [Symbol.iterator](): IterableIterator<object>;
    };

    const root = new Node() as CompositeNode;
    const child = new Node() as CompositeNode;
    root.add(child);
    expect(root.getChildren()).toHaveLength(1);
    expect(root.getChild(0)).toBe(child);
    expect([...root]).toEqual([child]);

    const visited: object[] = [];
    root.traverse((node) => visited.push(node));
    expect(visited).toEqual([root, child]);

    root.remove(child);
    expect(root.getChildren()).toHaveLength(0);
  });

  it('throws on invalid child index', () => {
    @Composite
    class Node {}
    const node = new Node() as InstanceType<typeof Node> & {
      getChild(index: number): object;
    };
    expect(() => node.getChild(0)).toThrow(/no child at index/);
  });
});

describe('Phase 4a legacy @Proxy', () => {
  it('calls before and after hooks and preserves return value', () => {
    const order: string[] = [];
    @Proxy({
      before: (method) => order.push(`before:${method}`),
      after: (method, result) => order.push(`after:${method}:${result}`),
    })
    class Service {
      compute(x: number) {
        return x * 2;
      }
    }

    const svc = new Service();
    expect(svc.compute(3)).toBe(6);
    expect(order).toEqual(['before:compute', 'after:compute:6']);
  });

  it('does not wrap non-method properties', () => {
    @Proxy({ before: () => {} })
    class Box {
      value = 1;
    }
    const box = new Box();
    expect(box.value).toBe(1);
    box.value = 2;
    expect(box.value).toBe(2);
  });
});

describe('Phase 4a stage3 parity', () => {
  function makeClassContext(name: string): ClassDecoratorContext & { metadata: object } {
    const metadata: Record<PropertyKey, unknown> = {};
    return {
      kind: 'class',
      name,
      metadata,
      addInitializer: () => {},
    } as unknown as ClassDecoratorContext & { metadata: object };
  }

  it('@Flyweight pools instances on stage3', () => {
    class TreeType {
      constructor(public color: string) {}
    }
    const Wrapped = FlyweightS3({ key: (...args: unknown[]) => String(args[0]) })(
      TreeType,
      makeClassContext('TreeType'),
    ) as typeof TreeType;
    expect(new Wrapped('a')).toBe(new Wrapped('a'));
  });

  it('@Composite tree API on stage3', () => {
    class Node {
      name = '';
    }
    type CompositeNode = InstanceType<typeof Node> & {
      add(child: object): void;
      getChildren(): readonly object[];
    };
    const Wrapped = CompositeS3(Node, makeClassContext('Node')) as new () => CompositeNode;
    const root = new Wrapped();
    const child = new Wrapped();
    root.add(child);
    expect(root.getChildren()).toHaveLength(1);
  });

  it('@Proxy hooks on stage3', () => {
    class Svc {
      run() {
        return 1;
      }
    }
    const spy = vi.fn();
    const Wrapped = ProxyS3({ before: spy })(Svc, makeClassContext('Svc')) as typeof Svc;
    expect(new Wrapped().run()).toBe(1);
    expect(spy).toHaveBeenCalledWith('run', []);
  });
});
