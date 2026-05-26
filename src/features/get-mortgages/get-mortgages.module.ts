import { Module } from '@nestjs/common';
import { LoggerModule } from '@moveotech/logger';
import { GetMortgagesController } from './get-mortgages.controller';
import { GetMortgagesService } from './get-mortgages.service';
import { StaticDataService } from './static-data/static-data.service';
import { HttpProxyModule } from '@moveotech/http-proxy';
import { SecretsManagerService } from '../../infrastructure/aws-secrets/aws-secrets.service';

@Module({
  imports: [
    HttpProxyModule,
    LoggerModule.forFeature('GetMortgagesService'),
  ],
  controllers: [GetMortgagesController],
  providers: [GetMortgagesService, SecretsManagerService, StaticDataService],
  exports: [GetMortgagesService],
})
export class GetMortgagesModule {}
