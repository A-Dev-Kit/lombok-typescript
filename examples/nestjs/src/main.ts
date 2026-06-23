import 'reflect-metadata';
import { demoNestInterop } from './app.service.js';
import { demoValidateDto } from './validate.dto.js';

const result = demoNestInterop();
const validated = demoValidateDto();
console.info('nestjs lombok interop', result, validated);
