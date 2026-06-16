export interface GeneratorOptions {
  /** Where generated files go. Default `.lombok`. */
  outputDir: string;

  /** Watch mode. Default `false`. */
  watch: boolean;

  /** Glob patterns for files to process. Default `['src/** /*.ts']`. */
  include: string[];

  /** Glob patterns for files to skip. Default excludes test files and `dist`. */
  exclude: string[];

  /** Path to the project's tsconfig. Default `tsconfig.json`. */
  tsConfigPath: string;
}

export interface GeneratedFile {
  sourcePath: string;
  outputPath: string;
  content: string;
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
