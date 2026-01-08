/**
 * Metadata Keys
 *
 * Constants for all metadata keys used by lombok-typescript decorators.
 * These keys are used with reflect-metadata to store decorator configuration.
 */

const PREFIX = 'lombok-ts:';

export const MetadataKeys = {
  // Class-level decorators
  DATA: `${PREFIX}data`,
  VALUE: `${PREFIX}value`,
  BUILDER: `${PREFIX}builder`,
  TO_STRING: `${PREFIX}toString`,
  EQUALS: `${PREFIX}equals`,
  UTILITY_CLASS: `${PREFIX}utilityClass`,
  FIELD_DEFAULTS: `${PREFIX}fieldDefaults`,
  ACCESSORS: `${PREFIX}accessors`,
  LOG: `${PREFIX}log`,
  OBSERVABLE: `${PREFIX}observable`,
  SERIALIZABLE: `${PREFIX}serializable`,
  DEEP_FREEZE: `${PREFIX}deepFreeze`,

  // Field-level decorators
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

  // Method-level decorators
  MEMOIZE: `${PREFIX}memoize`,
  DEBOUNCE: `${PREFIX}debounce`,
  THROTTLE: `${PREFIX}throttle`,
  TRACE: `${PREFIX}trace`,
  RETRY: `${PREFIX}retry`,

  // Parameter-level decorators
  NON_NULL_PARAM: `${PREFIX}nonNull:param`,

  // Internal
  FIELDS: `${PREFIX}fields`,
  CONSTRUCTOR_PARAMS: `${PREFIX}constructorParams`,
} as const;

export type MetadataKey = (typeof MetadataKeys)[keyof typeof MetadataKeys];

