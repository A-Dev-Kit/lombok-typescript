import 'reflect-metadata';
import { demoNestInterop } from './app.service.js';

const result = demoNestInterop();
console.log('nestjs lombok interop', result);
