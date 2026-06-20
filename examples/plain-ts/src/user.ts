import 'reflect-metadata';
import { Builder, Data, NonNull, ToString } from '@a-dev-kit/lombok-typescript/legacy';

@Data
@Builder
@ToString
export class User {
  @NonNull
  name!: string;
  age!: number;
}
