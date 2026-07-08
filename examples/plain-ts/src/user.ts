import 'reflect-metadata';
import {
  Builder,
  BuilderDefault,
  Data,
  NonNull,
  Singular,
  ToString,
} from '@a-dev-kit/lombok-typescript/legacy';

@Data
@Builder
@ToString
export class User {
  @NonNull
  name!: string;
  age!: number;

  // @BuilderDefault keeps this initializer when the builder omits `role`.
  @BuilderDefault
  role: string = 'user';

  // @Singular generates tag()/tags()/clearTags() accumulator methods.
  @Singular()
  tags: string[] = [];
}
