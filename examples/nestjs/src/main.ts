import 'reflect-metadata';
import { demoNestInterop } from './app.service.js';

const result = demoNestInterop();
console.info('nestjs lombok interop', result);
