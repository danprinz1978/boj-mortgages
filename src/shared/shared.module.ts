import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import {
  CorrelationIdMiddleware,
  LoggerModule,
  LoggerService,
  OpenTelemetrySharedModule,
  TracingRuntimeModule,
} from '@moveotech/logger';

@Module({
  imports: [OpenTelemetrySharedModule, TracingRuntimeModule, LoggerModule.forFeature('SharedModule')],
  exports: [LoggerModule, OpenTelemetrySharedModule, TracingRuntimeModule],
})
export class SharedModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
