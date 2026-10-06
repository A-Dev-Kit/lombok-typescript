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

  it('rejects @AllArgsConstructor with @Data on the same class', () => {
    const [info] = analyzeSourceString(`
      @AllArgsConstructor()
      @Data
      class User { name: string; }
    `);
    expect(() => validateClassComposition(info!)).toThrow(
      /@AllArgsConstructor and @Data cannot be used together/,
    );
  });

  it('rejects @AllArgsConstructor with @Value on the same class', () => {
    const [info] = analyzeSourceString(`
      @AllArgsConstructor()
      @Value
      class User { name: string; }
    `);
    expect(() => validateClassComposition(info!)).toThrow(
      /@AllArgsConstructor and @Value cannot be used together/,
    );
  });

  it('rejects @NoArgsConstructor with @Data on the same class', () => {
    const [info] = analyzeSourceString(`
      @NoArgsConstructor()
      @Data
      class User { name: string; }
    `);
    expect(() => validateClassComposition(info!)).toThrow(
      /Class "User": @NoArgsConstructor and @Data cannot be used together/,
    );
  });

  it('rejects @NoArgsConstructor with @Value on the same class', () => {
    const [info] = analyzeSourceString(`
      @NoArgsConstructor()
      @Value
      class User { name: string; }
    `);
    expect(() => validateClassComposition(info!)).toThrow(
      /Class "User": @NoArgsConstructor and @Value cannot be used together/,
    );
  });

  it('allows @NoArgsConstructor with @AllArgsConstructor and @Builder', () => {
    const classes = analyzeSourceString(`
      @NoArgsConstructor()
      @AllArgsConstructor()
      class A { x = 0; }
      @NoArgsConstructor({ staticName: 'create' })
      @Builder
      class B { y = ''; }
    `);
    expect(() => validateAllClassCompositions(classes)).not.toThrow();
  });

  it('allows @AllArgsConstructor alone and with @Builder', () => {
    const classes = analyzeSourceString(`
      @AllArgsConstructor()
      class A { x: number; }
      @AllArgsConstructor({ staticName: 'of' })
      @Builder
      class B { y: string; }
    `);
    expect(() => validateAllClassCompositions(classes)).not.toThrow();
  });
});
