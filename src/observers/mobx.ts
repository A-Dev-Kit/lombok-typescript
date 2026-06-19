import { observable } from 'mobx';
import type { ObservableInstance } from '../decorators/shared/observable.js';

/**
 * Wrap a `@Observable` instance with MobX `observable()` and forward lombok
 * `subscribe` notifications to the provided effect.
 */
export function makeLombokObservable<
  T extends ObservableInstance & Record<string | symbol, unknown>,
>(instance: T, key: string | symbol, effect: (next: unknown, prev: unknown) => void): () => void {
  observable(instance);
  return instance.subscribe(key, effect);
}

export { observable as toMobxObservable };
