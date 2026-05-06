import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AllExceptionsFilter } from './shared/filters/exception-filter';
import { LoggerService, initTracing } from '@moveotech/logger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get the AppService and ConfigService from the NestJS context
  const configService = app.get(ConfigService);

  // Initialize OpenTelemetry tracing
  const logger = await app.resolve(LoggerService);
  await initTracing(configService, logger);

  const globalPrefix = 'api';

  app.use(helmet()); // Use Helmet middleware

  app.enableCors({
    origin: [...configService.get<string>('CORS_ORIGINS').split(' ')],
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'UPDATE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'RequestChannel',
      'Page',
      'GPS',
      'SysSession',
      'OSVersion',
      'ApplicationId',
      'ExtraInfo',
    ].join(', '),
  });

  // Enable global DTO validation
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  app.useGlobalFilters(new AllExceptionsFilter());

  // Start the NestJS HTTP server on the specified port
  const port = configService.get<number>('PORT', 3000);

  setupSwagger(globalPrefix, app);

  await app.listen(port);

  // Log that the server is running and specify the port
  console.log(`Server listening on port : ${port}`);
}

bootstrap();

const setupSwagger = (url: string, app: INestApplication) => {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('boj-template service')
    .setDescription('Api for boj-template actions.')
    .setVersion('1.0')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(url, app, swaggerDocument);
};
