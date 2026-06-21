import type { Backend } from '../../core/backend.js';
import { MetadataKeys } from '../../core/metadata-keys.js';
import type { AnyClass } from '../../legacy/decorate.js';

export interface AbstractFactoryOptions {
  products: string[];
}

function normalizeProducts(productsOrOptions: string[] | AbstractFactoryOptions): string[] {
  const products = Array.isArray(productsOrOptions)
    ? productsOrOptions
    : productsOrOptions.products;
  if (!Array.isArray(products) || products.length === 0) {
    throw new Error('@AbstractFactory requires a non-empty product list');
  }
  return products;
}

export function abstractFactoryClassLegacy(
  backend: Backend,
  target: AnyClass,
  productsOrOptions: string[] | AbstractFactoryOptions,
): void {
  const products = normalizeProducts(productsOrOptions);
  backend.metadata.set(MetadataKeys.ABSTRACT_FACTORY, target, undefined, { products });
}

export function abstractFactoryClassStage3(
  backend: Backend,
  _value: AnyClass,
  context: ClassDecoratorContext,
  productsOrOptions: string[] | AbstractFactoryOptions,
): void {
  const products = normalizeProducts(productsOrOptions);
  backend.metadata.set(MetadataKeys.ABSTRACT_FACTORY, context.metadata as object, undefined, {
    products,
  });
}
