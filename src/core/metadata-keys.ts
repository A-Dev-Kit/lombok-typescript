/**
 * Metadata keys used across the library. Adding one? Use the `lombok-ts:`
 * prefix and check `metadata-keys.test.ts` so uniqueness stays enforced.
 */

const PREFIX = 'lombok-ts:';

export const MetadataKeys = {
  // Class-level (Lombok)
  DATA: `${PREFIX}data`,
  VALUE: `${PREFIX}value`,
  BUILDER: `${PREFIX}builder`,
  TO_STRING: `${PREFIX}toString`,
  EQUALS: `${PREFIX}equals`,
  UTILITY_CLASS: `${PREFIX}utilityClass`,
  FIELD_DEFAULTS: `${PREFIX}fieldDefaults`,
  ACCESSORS: `${PREFIX}accessors`,
  LOG: `${PREFIX}log`,

  // Class-level (TS-only)
  OBSERVABLE: `${PREFIX}observable`,
  SERIALIZABLE: `${PREFIX}serializable`,
  DEEP_FREEZE: `${PREFIX}deepFreeze`,
  TRACE: `${PREFIX}trace`,

  // Class-level (GoF)
  SINGLETON: `${PREFIX}singleton`,
  FACTORY: `${PREFIX}factory`,
  ABSTRACT_FACTORY: `${PREFIX}abstractFactory`,
  PROTOTYPE: `${PREFIX}prototype`,
  ADAPTER: `${PREFIX}adapter`,
  BRIDGE: `${PREFIX}bridge`,
  COMPOSITE: `${PREFIX}composite`,
  WRAPS: `${PREFIX}wraps`,
  FACADE: `${PREFIX}facade`,
  FLYWEIGHT: `${PREFIX}flyweight`,
  PROXY: `${PREFIX}proxy`,
  CHAIN_OF_RESPONSIBILITY: `${PREFIX}chainOfResponsibility`,
  COMMAND: `${PREFIX}command`,
  INTERPRETER: `${PREFIX}interpreter`,
  ITERABLE: `${PREFIX}iterable`,
  MEDIATOR: `${PREFIX}mediator`,
  MEMENTO: `${PREFIX}memento`,
  MEMENTO_EXCLUDE: `${PREFIX}memento:exclude`,
  STATE: `${PREFIX}state`,
  STRATEGY: `${PREFIX}strategy`,
  TEMPLATE_METHOD: `${PREFIX}templateMethod`,
  VISITABLE: `${PREFIX}visitable`,
  VISITOR: `${PREFIX}visitor`,

  // Field-level
  GETTER: `${PREFIX}getter`,
  SETTER: `${PREFIX}setter`,
  NON_NULL: `${PREFIX}nonNull`,
  WITH: `${PREFIX}with`,
  DELEGATE: `${PREFIX}delegate`,
  VALIDATE: `${PREFIX}validate`,
  TO_STRING_EXCLUDE: `${PREFIX}toString:exclude`,
  TO_STRING_INCLUDE: `${PREFIX}toString:include`,
  EQUALS_EXCLUDE: `${PREFIX}equals:exclude`,
  SERIALIZABLE_EXCLUDE: `${PREFIX}serializable:exclude`,
  SERIALIZABLE_TRANSFORM: `${PREFIX}serializable:transform`,
  SERIALIZABLE_ALIAS: `${PREFIX}serializable:alias`,
  BUILDER_DEFAULT: `${PREFIX}builder:default`,
  SINGULAR: `${PREFIX}singular`,
  ITERATE_OVER: `${PREFIX}iterateOver`,

  // Method-level
  MEMOIZE: `${PREFIX}memoize`,
  DEBOUNCE: `${PREFIX}debounce`,
  THROTTLE: `${PREFIX}throttle`,
  RETRY: `${PREFIX}retry`,
  HANDLER: `${PREFIX}handler`,
  TRANSITION: `${PREFIX}transition`,
  HOOK: `${PREFIX}hook`,

  // Parameter-level
  NON_NULL_PARAM: `${PREFIX}nonNull:param`,

  // Internal, framework-managed
  FIELDS: `${PREFIX}internal:fields`,
  CONSTRUCTOR_PARAMS: `${PREFIX}internal:constructorParams`,
  BACKEND: `${PREFIX}internal:backend`,
} as const;

export type MetadataKey = (typeof MetadataKeys)[keyof typeof MetadataKeys];

export const METADATA_KEY_PREFIX = PREFIX;
