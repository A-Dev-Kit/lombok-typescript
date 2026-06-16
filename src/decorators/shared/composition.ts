import type { ClassInfo } from '../../codegen/types.js';

/** Pairs of class decorators that must not appear on the same class. */
export const CONFLICTING_CLASS_DECORATOR_PAIRS: readonly (readonly [string, string])[] = [
  ['Data', 'Value'],
];

export function classHasDecorator(
  info: Pick<ClassInfo, 'decorators'>,
  name: string,
): boolean {
  return info.decorators.some((d) => d.name === name);
}

/**
 * Enforce composition rules before codegen runs.
 * `@Data` and `@Value` are mutually exclusive (mutable vs immutable).
 */
export function validateClassComposition(info: ClassInfo): void {
  for (const [a, b] of CONFLICTING_CLASS_DECORATOR_PAIRS) {
    if (classHasDecorator(info, a) && classHasDecorator(info, b)) {
      throw new Error(
        `Class "${info.name}": @${a} and @${b} cannot be used together.`,
      );
    }
  }
}

export function validateAllClassCompositions(classes: readonly ClassInfo[]): void {
  for (const info of classes) {
    validateClassComposition(info);
  }
}
