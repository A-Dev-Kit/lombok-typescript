export interface ThrottledMethod<T extends (...args: unknown[]) => unknown> {
  (this: unknown, ...args: Parameters<T>): void;
  cancel(): void;
  flush(): void;
}

export function throttleMethod<T extends (...args: unknown[]) => unknown>(
  original: T,
  intervalMs: number,
): ThrottledMethod<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastThis: unknown;
  let lastArgs: Parameters<T> | undefined;
  let throttled = false;

  const wrapped = function (this: unknown, ...args: Parameters<T>) {
    lastThis = this;
    lastArgs = args;
    if (!throttled) {
      throttled = true;
      original.apply(this, args);
      timer = setTimeout(() => {
        throttled = false;
        timer = undefined;
      }, intervalMs);
    }
  } as ThrottledMethod<T>;

  wrapped.cancel = () => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
    throttled = false;
    lastArgs = undefined;
  };

  wrapped.flush = function (this: unknown) {
    if (lastArgs !== undefined) {
      original.apply(lastThis ?? this, lastArgs);
      lastArgs = undefined;
    }
    wrapped.cancel();
  };

  return wrapped;
}
