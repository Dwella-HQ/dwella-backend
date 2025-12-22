import { Global, Module } from '@nestjs/common';
import { FacebookModule } from './facebook/facebook.module';
import { GoogleModule } from './google/google.module';
import { AwsModule } from './aws/aws.module';

@Global()
@Module({
  imports: [FacebookModule, GoogleModule, AwsModule],
  exports: [FacebookModule, GoogleModule, AwsModule],
})
export class ServicesModule {}
