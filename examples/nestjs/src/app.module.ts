import { Module } from '@nestjs/common';
import { LombokModule } from '@a-dev-kit/lombok-typescript/nestjs';
import { AppService, EmailNotifier, SmsNotifier } from './app.service.js';

@Module({
  imports: [LombokModule.forRoot({ logAdapter: 'nest', defaultProviderScope: 'DEFAULT' })],
  providers: [AppService, EmailNotifier, SmsNotifier],
})
export class AppModule {}
