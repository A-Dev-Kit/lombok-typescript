import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import { Validate } from '@a-dev-kit/lombok-typescript/legacy';
import { IsEmail, MinLength } from 'class-validator';
import '@a-dev-kit/lombok-typescript/validators/class-validator';

@Injectable()
export class CreateUserDto {
  @Validate([IsEmail()])
  email = '';

  @Validate([MinLength(8)])
  password = '';
}

export function demoValidateDto() {
  const dto = new CreateUserDto();
  dto.email = 'user@example.com';
  dto.password = 'long-enough';
  return { email: dto.email, passwordLength: dto.password.length };
}
