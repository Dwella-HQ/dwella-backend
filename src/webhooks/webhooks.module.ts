import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { TransactionModule } from 'src/transaction/transaction.module';

@Module({
  imports: [TransactionModule],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
