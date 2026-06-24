import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { MetadataKeys } from '../../core/metadata-keys.js';
import { legacyBackend } from '../../legacy/backend.js';
import { stage3Backend } from '../../stage3/backend.js';
import { Adapter, Bridge, Facade, Interpreter, Mediator } from '../../legacy/index.js';
import {
  adapterClassLegacy,
  adapterClassStage3,
  bridgeClassStage3,
  facadeClassStage3,
  getGoFMarkerMetadata,
  interpreterClassStage3,
  mediatorClassStage3,
} from './markers-gof.js';

function makeClassContext(name: string): ClassDecoratorContext {
  return {
    kind: 'class',
    name,
    metadata: {},
    addInitializer: () => {},
  } as ClassDecoratorContext;
}

describe('GoF marker decorators (legacy)', () => {
  it('@Adapter stores adapts/target metadata', () => {
    class Legacy {}
    class Modern {}
    @Adapter({ adapts: Legacy, target: Modern })
    class LegacyAdapter {}
    expect(getGoFMarkerMetadata(LegacyAdapter, MetadataKeys.ADAPTER)).toEqual({
      adapts: Legacy,
      target: Modern,
    });
  });

  it('@Adapter rejects non-constructor options', () => {
    class Modern {}
    expect(() =>
      adapterClassLegacy(legacyBackend, class X {}, {
        adapts: 'nope' as unknown as typeof Modern,
        target: Modern,
      }),
    ).toThrow(/adapts/);
  });

  it('@Bridge, @Mediator, and @Interpreter set metadata flags', () => {
    @Bridge
    class Shape {}
    @Mediator
    class ChatRoom {}
    @Interpreter
    class Grammar {}
    expect(getGoFMarkerMetadata(Shape, MetadataKeys.BRIDGE)).toBe(true);
    expect(getGoFMarkerMetadata(ChatRoom, MetadataKeys.MEDIATOR)).toBe(true);
    expect(getGoFMarkerMetadata(Grammar, MetadataKeys.INTERPRETER)).toBe(true);
  });

  it('@Facade stores optional subsystems', () => {
    class Payment {}
    class Inventory {}
    @Facade({ subsystems: [Payment, Inventory] })
    class Checkout {}
    expect(getGoFMarkerMetadata(Checkout, MetadataKeys.FACADE)).toEqual({
      subsystems: [Payment, Inventory],
    });
  });

  it('@Facade rejects invalid subsystem entries', () => {
    expect(() =>
      facadeClassStage3(stage3Backend, class Bad {}, makeClassContext('Bad'), {
        subsystems: ['x'] as unknown as (new () => unknown)[],
      }),
    ).toThrow(/subsystems/);
  });

  it('markers do not wrap constructors', () => {
    @Bridge
    class Box {
      value = 1;
    }
    expect(new Box().value).toBe(1);
  });
});

describe('GoF marker decorators (stage3)', () => {
  it('stores metadata on Symbol.metadata', () => {
    class Legacy {}
    class Modern {}
    class LegacyAdapter {}
    const ctx = makeClassContext('LegacyAdapter');
    adapterClassStage3(stage3Backend, LegacyAdapter, ctx, { adapts: Legacy, target: Modern });
    bridgeClassStage3(stage3Backend, class Shape {}, makeClassContext('Shape'));
    mediatorClassStage3(stage3Backend, class Room {}, makeClassContext('Room'));
    interpreterClassStage3(stage3Backend, class Grammar {}, makeClassContext('Grammar'));
    facadeClassStage3(stage3Backend, class Checkout {}, makeClassContext('Checkout'), {
      subsystems: [Legacy],
    });
    expect(
      stage3Backend.metadata.get(MetadataKeys.ADAPTER, ctx.metadata as object, undefined),
    ).toEqual({
      adapts: Legacy,
      target: Modern,
    });
  });
});
