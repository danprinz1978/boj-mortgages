import { Module } from '@nestjs/common';
import { LoggerModule } from '@moveotech/logger';
import { GetMortgagesController } from './get-mortgages.controller';
import { GetMortgagesService } from './get-mortgages.service';
import { HttpProxyModule } from '@moveotech/http-proxy';
import { SecretsManagerService } from '../../infrastructure/aws-secrets/aws-secrets.service';

@Module({
  imports: [
    HttpProxyModule,
    LoggerModule.forFeature('GetMortgagesService'),
  ],
  controllers: [GetMortgagesController],
  providers: [GetMortgagesService, SecretsManagerService],
  exports: [GetMortgagesService],
})
export class GetMortgagesModule {}
