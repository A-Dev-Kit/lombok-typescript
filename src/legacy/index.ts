/**
 * Legacy decorator backend, for `experimentalDecorators: true`. Used by NestJS,
 * TypeORM, class-validator, and most existing decorator-based libraries.
 *
 * @example
 * import { defineClassDecorator } from 'lombok-typescript/legacy';
 *
 * const Tracked = defineClassDecorator((backend, target) => {
 *   backend.metadata.set('tracked', target, undefined, true);
 * });
 */

export { LegacyBackend, legacyBackend } from './backend.js';
export {
  defineClassDecorator,
  defineFieldDecorator,
  defineMethodDecorator,
  defineParameterDecorator,
} from './decorate.js';
export type {
  ClassDecoratorLogic,
  FieldDecoratorLogic,
  MethodDecoratorLogic,
  ParameterDecoratorLogic,
} from './decorate.js';
