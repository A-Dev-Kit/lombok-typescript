export type BackoffStrategy = 'fixed' | 'linear' | 'exponential';

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function computeBackoffDelay(
  baseDelay: number,
  attempt: number,
  strategy: BackoffStrategy,
): number {
  switch (strategy) {
    case 'linear':
      return baseDelay * attempt;
    case 'exponential':
      return baseDelay * 2 ** (attempt - 1);
    default:
      return baseDelay;
  }
}
