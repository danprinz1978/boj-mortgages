import { Controller, Get, Post } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { Topics } from '../../shared/enums/topics.enum';
import { LoggerService } from '@moveotech/logger';

@Controller('kafka')
export class KafkaController {
  constructor(
    private readonly kafkaService: KafkaService,
    private readonly logger: LoggerService,
  ) {}

  @Post('send-message')
  async sendMessage(): Promise<string> {
    try {
      await this.kafkaService.sendMessage(Topics.Example, { key: 'value' });
      this.logger.log('Message sent to Kafka topic');
      return 'Message sent to Kafka!';
    } catch (error) {
      this.logger.error('Failed to send message to Kafka:', error.message);
      throw error;
    }
  }

  @Get('consume-messages')
  consumeMessages(): string {
    this.kafkaService.consumeMessage(Topics.Example, (message) => {
      this.logger.log('Received message:', message);
    });
    this.logger.log('Started consuming messages');
    return 'Consuming messages from Kafka... Check logs for details.';
  }
}
