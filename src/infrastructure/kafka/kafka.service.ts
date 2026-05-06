import { Injectable } from '@nestjs/common';
import { Kafka, Producer, Consumer } from 'kafkajs';
import { MessageQueueBase } from './message-queue';
import { LoggerService } from '@moveotech/logger';

@Injectable()
export class KafkaService extends MessageQueueBase {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  constructor(
    private brokers: string[],
    private groupId: string,
    private readonly logger: LoggerService,
  ) {
    super();
    this.kafka = new Kafka({ brokers: this.brokers });
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: this.groupId });
  }

  async connect(): Promise<void> {
    try {
      await this.producer.connect();
      await this.consumer.connect();
      this.logger.log('Connected to Kafka successfully');
    } catch (error) {
      this.logger.error('Failed to connect to Kafka', error.message);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.producer.disconnect();
      await this.consumer.disconnect();
      this.logger.log('Disconnected from Kafka successfully');
    } catch (error) {
      this.logger.error('Failed to disconnect from Kafka', error.message);
      throw error;
    }
  }

  async sendMessage(topic: string, message: any): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
      });
      this.logger.log(`Message sent to topic: ${topic}`);
    } catch (error) {
      this.logger.error(
        `Failed to send message to topic ${topic}:`,
        error.message,
      );
      throw error;
    }
  }

  consumeMessage(topic: string, callback: (message: any) => void): void {
    this.consumer
      .subscribe({ topic, fromBeginning: false })
      .then(() => {
        this.consumer.run({
          eachMessage: async ({ message }) => {
            try {
              const parsedMessage = JSON.parse(message.value.toString());
              callback(parsedMessage);
            } catch (error) {
              this.logger.error('Error processing message', error.message);
              throw error;
            }
          },
        });
        this.logger.log(`Subscribed to topic: ${topic}`);
      })
      .catch((error) => {
        this.logger.error(
          `Failed to subscribe to topic ${topic}:`,
          error.message,
        );
      });
  }
}
