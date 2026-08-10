import { Global, Module } from '@nestjs/common';
import { EmailModule } from './email/email.module';
import { AppModule } from './app/app.module';
import { NotificationService } from './notification.service';

@Global()
@Module({
  imports: [EmailModule, AppModule],
  providers: [NotificationService],
  exports: [EmailModule, AppModule, NotificationService],
})
export class NotificationModule {}
