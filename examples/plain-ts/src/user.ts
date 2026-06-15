import 'reflect-metadata';
import { Builder, Data, NonNull, ToString } from 'lombok-typescript/legacy';

@Data
@Builder
@ToString
export class User {
  @NonNull
  name!: string;
  age!: number;
}
