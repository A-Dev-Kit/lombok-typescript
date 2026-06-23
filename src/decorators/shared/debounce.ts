export interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
}

export interface DebouncedMethod<T extends (...args: unknown[]) => unknown> {
  (this: unknown, ...args: Parameters<T>): void;
  cancel(): void;
  flush(): void;
}

export function debounceMethod<T extends (...args: unknown[]) => unknown>(
  original: T,
  waitMs: number,
  options: DebounceOptions = {},
): DebouncedMethod<T> {
  const leading = options.leading ?? false;
  const trailing = options.trailing ?? true;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastThis: unknown;
  let lastArgs: Parameters<T> | undefined;

  const wrapped = function (this: unknown, ...args: Parameters<T>) {
    lastThis = this;
    lastArgs = args;
    const callLeading = leading && timer === undefined;
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
    if (callLeading) {
      original.apply(this, args);
    }
    if (trailing) {
      timer = setTimeout(() => {
        timer = undefined;
        if (!callLeading && lastArgs !== undefined) {
          original.apply(lastThis, lastArgs);
        }
      }, waitMs);
    }
  } as DebouncedMethod<T>;

  wrapped.cancel = () => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
    lastArgs = undefined;
  };

  wrapped.flush = function (this: unknown) {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
    if (lastArgs !== undefined) {
      original.apply(lastThis ?? this, lastArgs);
      lastArgs = undefined;
    }
  };

  return wrapped;
}
