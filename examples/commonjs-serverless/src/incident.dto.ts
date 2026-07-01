import 'reflect-metadata';
import { Builder, Data } from '@a-dev-kit/lombok-typescript/legacy';

/**
 * Minimal DTO mirroring a Serverless + CommonJS consumer (see planning investigation).
 * Typecheck must pass without TS1479 when package exports wire require types to .d.cts.
 */
@Data
@Builder
export class IncidentPayload {
  incidentId!: string;
  priority!: number;
}
