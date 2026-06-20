import { Value } from '@a-dev-kit/lombok-typescript/legacy';

@Value
export class Point {
  x!: number;
  y!: number;
}
