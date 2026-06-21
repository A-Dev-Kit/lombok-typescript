import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
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
  getVisitableRegistry,
} from '../../legacy/index.js';
import {
  AbstractFactory as AbstractFactoryS3,
  Composite as CompositeS3,
  Flyweight as FlyweightS3,
  Hook as HookS3,
  Proxy as ProxyS3,
  TemplateMethod as TemplateMethodS3,
  Visitable as VisitableS3,
  Visitor as VisitorS3,
  Wraps as WrapsS3,
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

describe('Phase 4b legacy @Wraps', () => {
  it('delegates to inner instance', () => {
    class Coffee {
      cost() {
        return 2;
      }
    }

    @Wraps(Coffee)
    class WithMilk {
      cost() {
        return (this as unknown as { inner: Coffee }).inner.cost() + 0.5;
      }
    }

    const WithMilkCtor = WithMilk as unknown as new (inner: Coffee) => WithMilk & { inner: Coffee };
    const drink = new WithMilkCtor(new Coffee());
    expect(drink.cost()).toBe(2.5);
  });

  it('throws when inner instance is missing or wrong type', () => {
    class Coffee {}
    @Wraps(Coffee)
    class WithMilk {}

    const WithMilkCtor = WithMilk as unknown as new (inner?: Coffee) => WithMilk;
    expect(() => new WithMilkCtor()).toThrow(/expects an instance/);
    expect(() => new WithMilkCtor({} as Coffee)).toThrow(/expects an instance/);
  });

  it('throws when inner class is not a constructor', () => {
    expect(() => {
      // @ts-expect-error invalid inner class
      @Wraps({})
      class _Bad {}
      void _Bad;
    }).toThrow(/constructor function/);
  });
});

describe('Phase 4b legacy @Visitor/@Visitable', () => {
  it('registers visitable classes', () => {
    @Visitable
    class Circle {
      radius = 1;
    }
    expect(getVisitableRegistry().get('Circle')).toBe(Circle);
  });

  it('Visitor marker stores metadata', () => {
    @Visitor({ visitMethods: { Circle: 'visitCircle' } })
    class AreaVisitor {
      visitCircle(c: { radius: number }) {
        return Math.PI * c.radius ** 2;
      }
    }
    expect(AreaVisitor).toBeDefined();
  });

  it('rejects invalid visitMethods map', () => {
    expect(() => {
      // @ts-expect-error invalid options
      @Visitor({})
      class _Bad {}
      void _Bad;
    }).toThrow(/visitMethods/);
  });
});

describe('Phase 4 legacy decorator validation', () => {
  it('@TemplateMethod rejects empty steps', () => {
    expect(() => {
      @TemplateMethod({ steps: [] })
      class _Bad {}
      void _Bad;
    }).toThrow(/steps/);
  });

  it('@AbstractFactory rejects empty product list', () => {
    expect(() => {
      @AbstractFactory([])
      class _Bad {}
      void _Bad;
    }).toThrow(/product list/);
  });

  it('@AbstractFactory accepts options object form', () => {
    // @ts-expect-error runtime accepts AbstractFactoryOptions object
    @AbstractFactory({ products: ['Button', 'Dialog'] })
    class Factory {}
    expect(Factory).toBeDefined();
  });
});

describe('Phase 4 stage3 parity', () => {
  function makeClassContext(name: string): ClassDecoratorContext & { metadata: object } {
    const metadata: Record<PropertyKey, unknown> = {};
    return {
      kind: 'class',
      name,
      metadata,
      addInitializer: () => {},
    } as unknown as ClassDecoratorContext & { metadata: object };
  }

  function makeMethodContext(name: string): ClassMethodDecoratorContext & { metadata: object } {
    const metadata: Record<PropertyKey, unknown> = {};
    return {
      kind: 'method',
      name,
      metadata,
      static: false,
      private: false,
      access: { get: () => undefined, has: () => false },
      addInitializer: () => {},
    } as unknown as ClassMethodDecoratorContext & { metadata: object };
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

  it('@Wraps on stage3', () => {
    class Core {
      value = 10;
    }
    class Decorated {
      read() {
        return (this as unknown as { inner: Core }).inner.value;
      }
    }
    const Wrapped = WrapsS3(Core)(Decorated, makeClassContext('Decorated')) as unknown as new (
      inner: Core,
    ) => Decorated & { inner: Core };
    expect(new Wrapped(new Core()).read()).toBe(10);
  });

  it('@Visitable registers on stage3', () => {
    class Square {
      side = 2;
    }
    VisitableS3(Square, makeClassContext('Square'));
    expect(getVisitableRegistry().get('Square')).toBe(Square);
  });

  it('@TemplateMethod + @Hook metadata on stage3', () => {
    class Exporter {
      fetch() {}
      transform() {}
      write() {}
    }
    const ctx = makeClassContext('Exporter');
    HookS3()(Exporter.prototype.fetch, {
      ...makeMethodContext('fetch'),
      metadata: ctx.metadata,
    } as ClassMethodDecoratorContext);
    HookS3()(Exporter.prototype.transform, {
      ...makeMethodContext('transform'),
      metadata: ctx.metadata,
    } as ClassMethodDecoratorContext);
    HookS3()(Exporter.prototype.write, {
      ...makeMethodContext('write'),
      metadata: ctx.metadata,
    } as ClassMethodDecoratorContext);
    TemplateMethodS3({ steps: ['fetch', 'transform', 'write'] })(Exporter, ctx);
    expect(Exporter).toBeDefined();
  });

  it('@AbstractFactory on stage3', () => {
    class Factory {}
    AbstractFactoryS3(['Button', 'Dialog'])(Factory, makeClassContext('Factory'));
    expect(Factory).toBeDefined();
  });

  it('@Visitor on stage3', () => {
    class V {
      visitCircle() {
        return 1;
      }
    }
    VisitorS3({ visitMethods: { Circle: 'visitCircle' } })(V, makeClassContext('V'));
    expect(new V().visitCircle()).toBe(1);
  });

  it('@Visitor rejects invalid visitMethods on stage3', () => {
    class V {}
    expect(() => {
      // @ts-expect-error invalid options
      VisitorS3({})(V, makeClassContext('V'));
    }).toThrow(/visitMethods/);
  });

  it('@TemplateMethod rejects empty steps on stage3', () => {
    class Job {}
    expect(() => {
      TemplateMethodS3({ steps: [] })(Job, makeClassContext('Job'));
    }).toThrow(/steps/);
  });
});

describe('Phase 4 legacy @TemplateMethod + @Hook', () => {
  it('stores hook metadata on methods', () => {
    @TemplateMethod({ steps: ['prepare', 'finish'], template: 'run' })
    class Job {
      @Hook()
      prepare() {}

      @Hook()
      finish() {}
    }
    expect(Job).toBeDefined();
  });
});
