import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import { Builder, BuilderDefault, Singular, Validate } from '@a-dev-kit/lombok-typescript/legacy';
import { IsEmail, MinLength } from 'class-validator';
import '@a-dev-kit/lombok-typescript/validators/class-validator';
import { applyAllGenerated } from '../.lombok/src/validate.dto.lombok.js';

@Injectable()
export class CreateUserDto {
  @Validate([IsEmail()])
  email = '';

  @Validate([MinLength(8)])
  password = '';
}

@Builder
export class AccountDto {
  name = '';

  // @BuilderDefault keeps 'member' unless the builder sets `role`.
  @BuilderDefault
  role: string = 'member';

  // @Singular generates permission()/permissions()/clearPermissions().
  @Singular()
  permissions: string[] = [];
}

applyAllGenerated({ AccountDto });

export function demoValidateDto() {
  const dto = new CreateUserDto();
  dto.email = 'user@example.com';
  dto.password = 'long-enough';

  const account = AccountDto.builder().name('nest').permission('read').permission('write').build();
  return {
    email: dto.email,
    passwordLength: dto.password.length,
    defaultRole: account.role,
    permissions: account.permissions,
  };
}
