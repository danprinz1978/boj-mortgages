import { Module } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { KafkaService } from './kafka.service';
import { MessageQueueBase } from './message-queue';
import { LoggerModule, LoggerService } from '@moveotech/logger';
import { KafkaController } from './kafka.controller';

@Module({
  imports: [ConfigModule, LoggerModule.forFeature('KafkaModule')],
  controllers: [KafkaController],
  providers: [
    {
      provide: KafkaService,
      useFactory: (configService: ConfigService, logger: LoggerService) => {
        const brokers = [configService.get<string>('KAFKA_BROKER')];
        const groupId = configService.get<string>('KAFKA_GROUP_ID');
        const kafkaService = new KafkaService(brokers, groupId, logger);
        kafkaService.connect();
        return kafkaService;
      },
      inject: [ConfigService, LoggerService],
    },
    {
      provide: MessageQueueBase,
      useExisting: KafkaService,
    },
  ],
  exports: [MessageQueueBase],
})
export class KafkaModule {}
