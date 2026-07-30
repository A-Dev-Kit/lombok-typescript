import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { Cleanup } from '../../legacy/index.js';
import { Cleanup as CleanupS3 } from '../../stage3/index.js';
import { stage3Backend } from '../../stage3/backend.js';
import { cleanupFieldStage3 } from './cleanup.js';

function makeFieldContext(name: string): ClassFieldDecoratorContext {
  const initializers: Array<(this: unknown) => void> = [];
  return {
    kind: 'field',
    name,
    static: false,
    private: false,
    metadata: {},
    addInitializer(fn: (this: unknown) => void) {
      initializers.push(fn);
    },
    __initializers: initializers,
  } as unknown as ClassFieldDecoratorContext;
}

describe('Cleanup (legacy)', () => {
  it('installs [Symbol.dispose]() that calls close() on a marked field', () => {
    const close = vi.fn();
    class Session {
      @Cleanup() readonly conn = { close };
    }
    const s = new Session();
    (s as unknown as Disposable)[Symbol.dispose]();
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('honours a custom method name via string shorthand and options object', () => {
    const end = vi.fn();
    class ViaShorthand {
      @Cleanup('end') readonly stream = { end };
    }
    class ViaOptions {
      @Cleanup({ method: 'end' }) readonly stream = { end };
    }
    (new ViaShorthand() as unknown as Disposable)[Symbol.dispose]();
    (new ViaOptions() as unknown as Disposable)[Symbol.dispose]();
    expect(end).toHaveBeenCalledTimes(2);
  });

  it('cleans multiple fields in reverse declaration order (LIFO)', () => {
    const order: string[] = [];
    class S {
      @Cleanup() readonly a = { close: () => order.push('a') };
      @Cleanup() readonly b = { close: () => order.push('b') };
      @Cleanup() readonly c = { close: () => order.push('c') };
    }
    (new S() as unknown as Disposable)[Symbol.dispose]();
    expect(order).toEqual(['c', 'b', 'a']);
  });

  it('works with the `using` idiom', () => {
    const close = vi.fn();
    class R implements Disposable {
      @Cleanup() readonly h = { close };
      // Placeholder for the type checker; the field decorator installs the real one at runtime.
      declare [Symbol.dispose]: () => void;
    }
    {
      using _r = new R();
      expect(close).not.toHaveBeenCalled();
    }
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('skips null/undefined field values silently', () => {
    class S {
      @Cleanup() readonly missing: { close(): void } | null = null;
      @Cleanup() readonly present = { close: vi.fn() };
    }
    const s = new S();
    expect(() => (s as unknown as Disposable)[Symbol.dispose]()).not.toThrow();
    expect(s.present.close).toHaveBeenCalledTimes(1);
  });

  it('throws a clear error when the named method is missing on a non-null value', () => {
    class Bad {
      @Cleanup('end') readonly stream = { close: vi.fn() }; // has close, not end
    }
    expect(() => (new Bad() as unknown as Disposable)[Symbol.dispose]()).toThrow(
      /Cleanup: field 'stream' value has no method 'end'/,
    );
  });

  it('best-effort: one field throwing does not stop later fields; first error rethrown', () => {
    const bClose = vi.fn();
    const aClose = vi.fn();
    class S {
      @Cleanup() readonly a = { close: aClose };
      @Cleanup() readonly b = {
        close: () => {
          throw new Error('boom-b');
        },
      };
      @Cleanup() readonly c = { close: bClose };
    }
    // Order at dispose: c, b (throws), a
    expect(() => (new S() as unknown as Disposable)[Symbol.dispose]()).toThrow('boom-b');
    expect(bClose).toHaveBeenCalledTimes(1);
    expect(aClose).toHaveBeenCalledTimes(1);
  });

  it('chains a pre-existing user-defined [Symbol.dispose]() — user runs first', () => {
    const order: string[] = [];
    class HasDispose {
      readonly r = { close: () => order.push('field') };
      [Symbol.dispose]() {
        order.push('user');
      }
    }
    // Decorate the field *after* declaring the user dispose so the install
    // sees the pre-existing one and wraps it.
    Cleanup()(HasDispose.prototype, 'r');
    (new HasDispose() as unknown as Disposable)[Symbol.dispose]();
    expect(order).toEqual(['user', 'field']);
  });

  it('subclass with its own Cleanup fields also disposes the parent cleanup fields', () => {
    const order: string[] = [];
    class Parent {
      @Cleanup() readonly p = { close: () => order.push('parent-p') };
    }
    class Child extends Parent {
      @Cleanup() readonly c = { close: () => order.push('child-c') };
    }
    (new Child() as unknown as Disposable)[Symbol.dispose]();
    // Child's dispose runs its fields, then chains to inherited (Parent's) dispose.
    expect(order).toEqual(['child-c', 'parent-p']);
  });
});

describe('Cleanup (stage3)', () => {
  it('registers via addInitializer and disposes correctly', () => {
    const close = vi.fn();
    class R {
      readonly conn: { close(): void } = { close };
    }
    const ctx = makeFieldContext('conn');
    CleanupS3()(undefined as never, ctx);
    // stage3 test helper stashes initializers on the context; run them.
    const initializers = (ctx as unknown as { __initializers: Array<(this: unknown) => void> })
      .__initializers;
    const instance = new R();
    for (const init of initializers) init.call(instance);
    (instance as unknown as Disposable)[Symbol.dispose]();
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('stage3 glue writes CLEANUP metadata with the chosen method', () => {
    const ctx = makeFieldContext('handle');
    cleanupFieldStage3(stage3Backend, ctx, { method: 'end' });
    const stored = stage3Backend.metadata.get<{ method: string }>(
      'lombok-ts:cleanup',
      ctx.metadata as object,
      'handle',
    );
    expect(stored?.method).toBe('end');
  });
});
