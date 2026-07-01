import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { AppService } from './app.service.js';
import { demoNestInterop } from './app.service.js';
import { demoValidateDto } from './validate.dto.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const service = app.get(AppService);

  const interop = demoNestInterop();
  demoValidateDto();
  const greeted = service.greet('Nest');

  console.info('nestjs lombok interop', interop, { greeted });
  await app.close();
}

void bootstrap();
