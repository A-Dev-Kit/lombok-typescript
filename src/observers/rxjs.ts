import { Observable } from 'rxjs';
import type { ObservableListener } from '../decorators/shared/observable.js';

export interface ObservableInstance {
  subscribe(key: string | symbol, listener: ObservableListener): () => void;
}

/**
 * Bridge a `@Observable` property to an RxJS `Observable`.
 * Requires `rxjs` as a peer dependency.
 */
export function toObservable<T>(instance: ObservableInstance, key: string | symbol): Observable<T> {
  return new Observable<T>((subscriber) => {
    const unsubscribe = instance.subscribe(key, (next) => {
      subscriber.next(next as T);
    });
    return unsubscribe;
  });
}
