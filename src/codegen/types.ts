/**
 * Code Generation Types
 */

export interface GeneratorOptions {
  /**
   * Directory to output generated files
   * @default '.lombok'
   */
  outputDir: string;

  /**
   * Watch for file changes and regenerate
   * @default false
   */
  watch: boolean;

  /**
   * Glob patterns for files to process
   * @default ['src/** /*.ts']
   */
  include: string[];

  /**
   * Glob patterns for files to exclude
   * @default ['node_modules', '**\/*.test.ts', '**\/*.spec.ts']
   */
  exclude: string[];

  /**
   * TypeScript configuration file path
   * @default 'tsconfig.json'
   */
  tsConfigPath: string;
}

export interface GeneratedFile {
  /**
   * Original source file path
   */
  sourcePath: string;

  /**
   * Generated file path
   */
  outputPath: string;

  /**
   * Generated code content
   */
  content: string;

  /**
   * Classes that were processed
   */
  processedClasses: string[];
}

export interface FieldInfo {
  name: string;
  type: string;
  isOptional: boolean;
  isReadonly: boolean;
  hasDefault: boolean;
  defaultValue?: string;
  decorators: DecoratorInfo[];
}

export interface DecoratorInfo {
  name: string;
  arguments: unknown[];
}

export interface ClassInfo {
  name: string;
  fields: FieldInfo[];
  decorators: DecoratorInfo[];
  methods: MethodInfo[];
}

export interface MethodInfo {
  name: string;
  returnType: string;
  parameters: ParameterInfo[];
  decorators: DecoratorInfo[];
  isAsync: boolean;
  isStatic: boolean;
}

export interface ParameterInfo {
  name: string;
  type: string;
  isOptional: boolean;
  decorators: DecoratorInfo[];
}

