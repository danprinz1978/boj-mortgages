import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './shared/constants/validation.schema';
import { AppController } from './app.controller';
import { SecretsManagerService } from './infrastructure/aws-secrets/aws-secrets.service';
import { AwsSecretsModule } from './infrastructure/aws-secrets/aws-secrets.module';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { TracingMiddleware } from '@moveotech/logger';
import { HttpProxyModule } from '@moveotech/http-proxy';
import { LoggerModule } from '@moveotech/logger';
import { AuthJwtModule } from './shared/auth/auth-jwt.module';
//import { PrismaService } from './infrastructure/prisma/prisma.service';
//import { KafkaModule } from './infrastructure/kafka/kafka.module';
import { GetMortgagesModule } from './features/get-mortgages/get-mortgages.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`, // Set NODE_ENV to the desired env file.
      validationSchema,
    }),
    HttpProxyModule,
    LoggerModule,
    SharedModule,
    AwsSecretsModule,
    AuthJwtModule,
    GetMortgagesModule
    //KafkaModule,
  ],
  controllers: [AppController],
  providers: [AppService, SecretsManagerService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TracingMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
