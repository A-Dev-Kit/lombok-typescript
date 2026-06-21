import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { AnyClass } from '../../legacy/decorate.js';

const CHILDREN = Symbol('lombok-ts:composite-children');

function getChildren(instance: object): object[] {
  const bag = instance as Record<symbol, object[]>;
  if (!bag[CHILDREN]) {
    bag[CHILDREN] = [];
  }
  return bag[CHILDREN];
}

function wrapCompositeClass(target: AnyClass): AnyClass {
  const CompositeClass = class extends target {
    add(child: object): void {
      getChildren(this).push(child);
    }

    remove(child: object): void {
      const children = getChildren(this);
      const index = children.indexOf(child);
      if (index >= 0) {
        children.splice(index, 1);
      }
    }

    getChild(index: number): object {
      const children = getChildren(this);
      const child = children[index];
      if (child === undefined) {
        throw new RangeError(`@Composite: no child at index ${index}`);
      }
      return child;
    }

    getChildren(): readonly object[] {
      return [...getChildren(this)];
    }

    traverse(callback: (node: object) => void): void {
      const visit = (node: object): void => {
        callback(node);
        for (const child of getChildren(node)) {
          visit(child);
        }
      };
      visit(this);
    }

    *[Symbol.iterator](): IterableIterator<object> {
      yield* getChildren(this);
    }
  };

  return CompositeClass as AnyClass;
}

export function compositeClassLegacy(backend: Backend, target: AnyClass): AnyClass {
  backend.metadata.set(MetadataKeys.COMPOSITE, target, undefined, true);
  return wrapCompositeClass(target);
}

export function compositeClassStage3(
  backend: Backend,
  value: AnyClass,
  context: ClassDecoratorContext,
): AnyClass {
  backend.metadata.set(MetadataKeys.COMPOSITE, context.metadata as object, undefined, true);
  return wrapCompositeClass(value);
}
