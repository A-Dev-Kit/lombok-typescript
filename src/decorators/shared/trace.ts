export interface TraceLogger {
  log(message: string, ...args: unknown[]): void;
}

export interface TraceOptions {
  /** Argument names to redact in logs. */
  redact?: string[];
  logger?: TraceLogger;
  /** Log method entry with arguments. Default `true`. */
  args?: boolean;
  /** Log return value on exit. Default `true`. */
  result?: boolean;
  /** Log elapsed time on exit. Default `true`. */
  timing?: boolean;
  /** Logger name prefix. Defaults to class or method name. */
  name?: string;
}

const defaultLogger: TraceLogger = {
  log: (message, ...args) => console.info(message, ...args),
};

export function formatTraceArgs(
  args: unknown[],
  argNames: string[] | undefined,
  redact: string[] | undefined,
): unknown[] {
  if (!redact?.length) return args;
  const redactSet = new Set(redact);
  return args.map((value, index) => {
    const name = argNames?.[index];
    if (name !== undefined && redactSet.has(name)) {
      return '[REDACTED]';
    }
    return value;
  });
}

export function traceMethod<T extends (...args: unknown[]) => unknown>(
  original: T,
  options: TraceOptions = {},
  contextName: string,
): T {
  const logger = options.logger ?? defaultLogger;
  const logArgs = options.args ?? true;
  const logResult = options.result ?? true;
  const logTiming = options.timing ?? true;
  const redact = options.redact;

  return function (this: unknown, ...args: unknown[]) {
    const start = logTiming ? performance.now() : 0;
    if (logArgs) {
      logger.log(`> ${contextName}`, ...formatTraceArgs(args, undefined, redact));
    }
    try {
      const result = original.apply(this, args);
      if (result instanceof Promise) {
        return result.then(
          (value) => {
            logExit(logger, contextName, value, start, logTiming, logResult);
            return value;
          },
          (error) => {
            logError(logger, contextName, error, start, logTiming);
            throw error;
          },
        ) as ReturnType<T>;
      }
      logExit(logger, contextName, result, start, logTiming, logResult);
      return result;
    } catch (error) {
      logError(logger, contextName, error, start, logTiming);
      throw error;
    }
  } as T;
}

function logExit(
  logger: TraceLogger,
  contextName: string,
  result: unknown,
  start: number,
  logTiming: boolean,
  logResult: boolean,
): void {
  const elapsed = logTiming ? Math.round(performance.now() - start) : 0;
  if (logResult && logTiming) {
    logger.log(`< ${contextName} [${elapsed}ms] ->`, result);
  } else if (logTiming) {
    logger.log(`< ${contextName} [${elapsed}ms]`);
  } else if (logResult) {
    logger.log(`< ${contextName} ->`, result);
  } else {
    logger.log(`< ${contextName}`);
  }
}

function logError(
  logger: TraceLogger,
  contextName: string,
  error: unknown,
  start: number,
  logTiming: boolean,
): void {
  const elapsed = logTiming ? Math.round(performance.now() - start) : 0;
  logger.log(`! ${contextName}${logTiming ? ` [${elapsed}ms]` : ''}`, error);
}

export function traceClassMethods(target: new (...args: unknown[]) => unknown, options: TraceOptions): void {
  const className = options.name ?? target.name;
  const proto = target.prototype as Record<string, unknown>;
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key === 'constructor') continue;
    const desc = Object.getOwnPropertyDescriptor(proto, key);
    if (!desc || typeof desc.value !== 'function') continue;
    const contextName = `${className}.${key}`;
    desc.value = traceMethod(
      desc.value as (...args: unknown[]) => unknown,
      options,
      contextName,
    );
    Object.defineProperty(proto, key, desc);
  }
}
