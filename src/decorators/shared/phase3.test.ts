import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { toObservable } from '../../observers/rxjs.js';
import { makeLombokObservable } from '../../observers/mobx.js';
import type { MementoSnapshot } from './memento.js';
import type { ObservableInstance } from './observable.js';
import {
  ChainOfResponsibility,
  Command,
  CommandHistory,
  Handler,
  Iterable,
  IterateOver,
  Memento,
  Observable,
  State,
  Strategy,
  StrategyRegistry,
  Transition,
} from '../../legacy/index.js';
import {
  ChainOfResponsibility as ChainS3,
  Command as CommandS3,
  Handler as HandlerS3,
  Iterable as IterableS3,
  IterateOver as IterateOverS3,
  Memento as MementoS3,
  Observable as ObservableS3,
  State as StateS3,
  Strategy as StrategyS3,
  Transition as TransitionS3,
} from '../../stage3/index.js';

type Stateful<T> = T & { state: string };
type MementoInstance<T> = T & { save(): MementoSnapshot; restore(snapshot: MementoSnapshot): void };
type ChainInstance<T> = T & { handle(context: unknown): boolean };
type IterableInstance = Iterable<unknown>;

describe('Phase 3 legacy @Strategy', () => {
  it('registers and resolves strategies by family and name', () => {
    @Strategy('compression', 'gzip')
    class _Gzip {
      tag = 'gzip';
    }

    @Strategy('compression', 'brotli')
    class _Brotli {
      tag = 'brotli';
    }

    const gzip = StrategyRegistry.get<{ tag: string }>('compression', 'gzip');
    expect(gzip.tag).toBe('gzip');
    expect(StrategyRegistry.list('compression').sort()).toEqual(['brotli', 'gzip']);
  });

  it('throws when strategy is missing', () => {
    expect(() => StrategyRegistry.get('missing', 'nope')).toThrow(/No strategy registered/);
  });
});

describe('Phase 3 legacy @State', () => {
  it('enforces transitions and exposes state', () => {
    @State({ states: ['draft', 'submitted', 'archived'], initial: 'draft' })
    class Application {
      @Transition({ from: 'draft', to: 'submitted' })
      submit() {
        return 'ok';
      }

      @Transition({ from: ['submitted'], to: 'archived' })
      archive() {
        return 'archived';
      }
    }

    const app = new Application() as InstanceType<typeof Application> & { state: string };
    expect(app.state).toBe('draft');
    expect(app.submit()).toBe('ok');
    expect(app.state).toBe('submitted');
    expect(() => app.archive()).not.toThrow();
    expect(app.state).toBe('archived');
  });

  it('throws on illegal transition', () => {
    @State({ states: ['draft', 'submitted'], initial: 'draft' })
    class App {
      @Transition({ from: 'draft', to: 'submitted' })
      submit() {}
    }

    const app = new App();
    expect(() => app.submit()).not.toThrow();
    expect(() => app.submit()).toThrow(/Cannot transition/);
  });

  it('fires lifecycle hooks', () => {
    const onTransition = vi.fn();
    @State({
      states: ['idle', 'running'],
      initial: 'idle',
      onTransition,
    })
    class Job {
      @Transition({ from: 'idle', to: 'running' })
      start() {}
    }

    new Job().start();
    expect(onTransition).toHaveBeenCalledWith('idle', 'running');
  });
});

describe('Phase 3 legacy @Command', () => {
  it('supports execute/undo via CommandHistory', () => {
    const editor = { text: '' };

    @Command
    class Insert {
      constructor(private readonly value: string) {}

      execute() {
        editor.text += this.value;
      }

      undo() {
        editor.text = editor.text.slice(0, -this.value.length);
      }
    }

    const history = new CommandHistory();
    history.execute(new Insert('Hello'));
    expect(editor.text).toBe('Hello');
    history.undo();
    expect(editor.text).toBe('');
    history.redo();
    expect(editor.text).toBe('Hello');
  });

  it('requires execute()', () => {
    expect(() => {
      @Command
      class _Bad {}
    }).toThrow(/execute\(\)/);
  });
});

describe('Phase 3 legacy @Memento', () => {
  it('save and restore snapshots', () => {
    @Memento
    class Editor {
      content = '';
      cursor = 0;
    }

    const editor = new Editor() as MementoInstance<Editor>;
    editor.content = 'Hello';
    editor.cursor = 3;
    const snap = editor.save();
    editor.content = 'oops';
    editor.restore(snap);
    expect(editor.content).toBe('Hello');
    expect(editor.cursor).toBe(3);
  });

  it('excludes fields marked with @Memento.Exclude', () => {
    @Memento
    class Editor {
      content = '';
      @Memento.Exclude
      cache = { hits: 1 };
    }

    const editor = new Editor() as MementoInstance<Editor>;
    editor.content = 'A';
    editor.cache.hits = 99;
    const snap = editor.save();
    editor.content = 'B';
    editor.cache.hits = 0;
    editor.restore(snap);
    expect(editor.content).toBe('A');
    expect(editor.cache.hits).toBe(0);
  });
});

describe('Phase 3 legacy @Observable', () => {
  it('notifies subscribers on property changes', () => {
    @Observable
    class Counter {
      count = 0;
    }

    const c = new Counter() as Counter & ObservableInstance;
    const listener = vi.fn();
    const unsub = c.subscribe('count', listener);
    c.count = 1;
    expect(listener).toHaveBeenCalledWith(1, 0);
    unsub();
    c.count = 2;
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('supports wildcard subscriptions', () => {
    @Observable
    class Box {
      value = 1;
    }

    const box = new Box() as Box & ObservableInstance;
    const listener = vi.fn();
    box.subscribe('*', listener);
    box.value = 2;
    expect(listener).toHaveBeenCalledWith('value', 2, 1);
  });

  it('recomputes @Observable.Derived getters', () => {
    @Observable
    class Cart {
      items: number[] = [];

      @Observable.Derived
      get total() {
        return this.items.reduce((sum, n) => sum + n, 0);
      }
    }

    const cart = new Cart() as Cart & ObservableInstance;
    const listener = vi.fn();
    cart.subscribe('total', listener);
    cart.items = [1, 2];
    expect(listener).toHaveBeenCalled();
  });
});

describe('Phase 3 legacy @ChainOfResponsibility', () => {
  it('dispatches handlers in order until handled', () => {
    const log: string[] = [];

    @ChainOfResponsibility
    class Pipeline {
      @Handler({ order: 2 })
      second() {
        log.push('second');
        return true;
      }

      @Handler({ order: 1 })
      first() {
        log.push('first');
        return false;
      }
    }

    const pipeline = new Pipeline() as ChainInstance<Pipeline>;
    expect(pipeline.handle(null)).toBe(true);
    expect(log).toEqual(['first', 'second']);
  });
});

describe('Phase 3 legacy @Iterable', () => {
  it('implements Symbol.iterator over @IterateOver field', () => {
    @Iterable
    class Playlist {
      @IterateOver
      songs: string[] = ['a', 'b'];
    }

    expect([...(new Playlist() as IterableInstance)]).toEqual(['a', 'b']);
  });
});

describe('Phase 3 observer adapters', () => {
  it('rxjs toObservable emits property changes', async () => {
    @Observable
    class Counter {
      count = 0;
    }

    const c = new Counter() as Counter & ObservableInstance;
    const values: number[] = [];
    const sub = toObservable<number>(c, 'count').subscribe((v) => values.push(v));
    c.count = 1;
    c.count = 2;
    sub.unsubscribe();
    expect(values).toEqual([1, 2]);
  });

  it('mobx makeLombokObservable runs reactions', () => {
    @Observable
    class Store {
      count = 0;
    }

    const store = new Store() as Store & ObservableInstance;
    const spy = vi.fn();
    const dispose = makeLombokObservable(store, 'count', spy);
    store.count = 1;
    expect(spy).toHaveBeenCalled();
    dispose();
  });
});

describe('Phase 3 stage3 decorators', () => {
  function makeClassContext(name: string): ClassDecoratorContext & { metadata: object } {
    const metadata: Record<PropertyKey, unknown> = {};
    return {
      kind: 'class',
      name,
      metadata,
      addInitializer: () => {},
    } as unknown as ClassDecoratorContext & { metadata: object };
  }

  function makeFieldContext(name: string): ClassFieldDecoratorContext & { metadata: object } {
    const metadata: Record<PropertyKey, unknown> = {};
    return {
      kind: 'field',
      name,
      metadata,
      static: false,
      private: false,
      access: { get: () => undefined, set: () => {}, has: () => false },
      addInitializer: () => {},
    } as unknown as ClassFieldDecoratorContext & { metadata: object };
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

  it('@Strategy registers implementations', () => {
    class Basic {
      kind = 'basic';
    }
    StrategyS3('auth', 'basic')(Basic, makeClassContext('Basic'));
    expect(new Basic().kind).toBe('basic');
  });

  it('@State @Transition work on stage3 backend', () => {
    class Door {
      close() {}
    }
    const ctx = makeClassContext('Door');
    TransitionS3({ from: 'open', to: 'closed' })(Door.prototype.close, {
      ...makeMethodContext('close'),
      metadata: ctx.metadata,
    } as ClassMethodDecoratorContext);
    const Wrapped = StateS3({ states: ['open', 'closed'], initial: 'open' })(
      Door,
      ctx,
    ) as typeof Door;

    const door = new Wrapped() as Stateful<typeof Wrapped>;
    expect(door.state).toBe('open');
    door.close();
    expect(door.state).toBe('closed');
  });

  it('@Command requires execute on stage3', () => {
    class Cmd {
      execute() {
        return 1;
      }
    }
    CommandS3(Cmd, makeClassContext('Cmd'));
    expect(new Cmd().execute()).toBe(1);
  });

  it('@Memento save/restore on stage3', () => {
    class Note {
      text = '';
    }
    const WrappedNote = MementoS3()(Note, makeClassContext('Note')) as typeof Note & {
      save(): MementoSnapshot;
      restore(snapshot: MementoSnapshot): void;
    };
    const note = new WrappedNote();
    note.text = 'hi';
    const snap = note.save();
    note.text = 'bye';
    note.restore(snap);
    expect(note.text).toBe('hi');
  });

  it('@Observable notifies on stage3', () => {
    class Box {
      value = 0;
    }
    const WrappedBox = ObservableS3()(Box, makeClassContext('Box')) as typeof Box &
      ObservableInstance;
    const box = new WrappedBox();
    const spy = vi.fn();
    box.subscribe('value', spy);
    box.value = 1;
    expect(spy).toHaveBeenCalledWith(1, 0);
  });

  it('@ChainOfResponsibility @Handler on stage3', () => {
    class Chain {
      run() {
        return true;
      }
    }
    const ctx = makeClassContext('Chain');
    HandlerS3({ order: 1 })(Chain.prototype.run, {
      ...makeMethodContext('run'),
      metadata: ctx.metadata,
    } as ClassMethodDecoratorContext);
    const Wrapped = ChainS3(Chain, ctx) as typeof Chain;
    expect((new Wrapped() as ChainInstance<typeof Wrapped>).handle({})).toBe(true);
  });

  it('@Iterable @IterateOver on stage3', () => {
    class List {
      items = [1, 2, 3];
    }
    const ctx = makeClassContext('List');
    IterateOverS3(undefined, { ...makeFieldContext('items'), metadata: ctx.metadata });
    IterableS3(List, ctx);
    expect([...(new List() as IterableInstance)]).toEqual([1, 2, 3]);
  });
});
