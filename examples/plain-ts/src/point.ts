import { Value } from 'lombok-typescript/legacy';

@Value
export class Point {
  x!: number;
  y!: number;
}
