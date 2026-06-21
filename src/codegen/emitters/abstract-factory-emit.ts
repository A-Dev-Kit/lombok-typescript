import type { ClassInfo } from '../types.js';
import { getAbstractFactoryProducts, hasClassDecorator } from './helpers.js';

export function emitAbstractFactoryMixin(info: ClassInfo): string {
  if (!hasClassDecorator(info, 'AbstractFactory')) return '';

  const products = getAbstractFactoryProducts(info);
  if (products.length === 0) {
    throw new Error(`@AbstractFactory on ${info.name}: product list is empty`);
  }

  const methods = products
    .map((product) => {
      const methodName = `create${product}`;
      return `  abstract ${methodName}(): ${product};`;
    })
    .join('\n');

  return `
export abstract class ${info.name}Mixin {
${methods}
}`.trim();
}

export function emitAbstractFactoryApplyAssignment(_info: ClassInfo): string | undefined {
  return undefined;
}
