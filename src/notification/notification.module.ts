import { Global, Module } from '@nestjs/common';
import { EmailModule } from './email/email.module';
import { AppModule } from './app/app.module';

@Global()
@Module({
  imports: [EmailModule, AppModule],
  exports: [EmailModule, AppModule],
})
export class NotificationModule {}
