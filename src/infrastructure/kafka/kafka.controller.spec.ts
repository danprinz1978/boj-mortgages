import { Test, TestingModule } from '@nestjs/testing';
import { KafkaController } from './kafka.controller';
import { KafkaService } from './kafka.service';
import { LoggerService } from '@moveotech/logger';
import { Topics } from '../../shared/enums/topics.enum';

describe('KafkaController', () => {
  let kafkaController: KafkaController;
  let kafkaService: KafkaService;
  let loggerService: LoggerService;

  const mockKafkaService = {
    sendMessage: jest.fn(),
    consumeMessage: jest.fn(),
  };

  const mockLoggerService = {
    log: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KafkaController],
      providers: [
        { provide: KafkaService, useValue: mockKafkaService },
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    kafkaController = module.get<KafkaController>(KafkaController);
    kafkaService = module.get<KafkaService>(KafkaService);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(kafkaController).toBeDefined();
    expect(kafkaService).toBeDefined();
    expect(loggerService).toBeDefined();
  });

  describe('sendMessage', () => {
    it('should call KafkaService.sendMessage with the correct parameters', async () => {
      const topic = Topics.Example;
      const payload = { key: 'value' };

      await kafkaController.sendMessage();

      expect(kafkaService.sendMessage).toHaveBeenCalledWith(topic, payload);
      expect(loggerService.log).toHaveBeenCalledWith(
        'Message sent to Kafka topic',
      );
    });

    it('should handle errors and log them', async () => {
      const error = new Error('Test error');
      jest.spyOn(kafkaService, 'sendMessage').mockRejectedValueOnce(error);

      await expect(kafkaController.sendMessage()).rejects.toThrow(error);
      expect(loggerService.error).toHaveBeenCalledWith(
        'Failed to send message to Kafka:',
        error.message,
      );
    });
  });

  describe('consumeMessages', () => {
    it('should call KafkaService.consumeMessage with the correct parameters', () => {
      const topic = Topics.Example;

      kafkaController.consumeMessages();

      expect(kafkaService.consumeMessage).toHaveBeenCalledWith(
        topic,
        expect.any(Function),
      );
      expect(loggerService.log).toHaveBeenCalledWith(
        'Started consuming messages',
      );
    });
  });
});
