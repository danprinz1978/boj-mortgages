import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SecretsManagerService } from './aws-secrets.service';

@Module({
  imports: [ConfigModule],
  providers: [SecretsManagerService],
  exports: [SecretsManagerService],
})
export class AwsSecretsModule {}

