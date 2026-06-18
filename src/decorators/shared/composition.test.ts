import { describe, expect, it } from 'vitest';
import { analyzeSourceString } from '../../codegen/analyzer.js';
import {
  classHasDecorator,
  validateAllClassCompositions,
  validateClassComposition,
} from './composition.js';

describe('composition rules', () => {
  it('detects class decorators by name', () => {
    const [info] = analyzeSourceString(`
      @Data
      class User { name: string; }
    `);
    expect(classHasDecorator(info!, 'Data')).toBe(true);
    expect(classHasDecorator(info!, 'Value')).toBe(false);
  });

  it('rejects @Data and @Value on the same class', () => {
    const [info] = analyzeSourceString(`
      @Data
      @Value
      class User { name: string; }
    `);
    expect(() => validateClassComposition(info!)).toThrow(/cannot be used together/);
  });

  it('validateAllClassCompositions checks every class', () => {
    const classes = analyzeSourceString(`
      @Data
      class Ok {}
      @Data
      @Value
      class Bad {}
    `);
    expect(() => validateAllClassCompositions(classes)).toThrow(/Bad/);
  });
});
