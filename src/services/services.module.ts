import { Global, Module } from '@nestjs/common';
import { FacebookModule } from './facebook/facebook.module';
import { GoogleModule } from './google/google.module';
import { AwsModule } from './aws/aws.module';
import { FlutterwaveModule } from './flutterwave/flutterwave.module';
import { MonnifyModule } from './monnify/monnify.module';
import { PaystackModule } from './paystack/paystack.module';

@Global()
@Module({
  imports: [
    FacebookModule,
    GoogleModule,
    AwsModule,
    FlutterwaveModule,
    MonnifyModule,
    PaystackModule,
  ],
  exports: [
    FacebookModule,
    GoogleModule,
    AwsModule,
    FlutterwaveModule,
    MonnifyModule,
    PaystackModule,
  ],
})
export class ServicesModule {}
