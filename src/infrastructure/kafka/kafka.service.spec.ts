import { KafkaService } from './kafka.service';
import { Kafka, Producer, Consumer } from 'kafkajs';
import { LoggerService } from '@moveotech/logger';
import { Topics } from 'src/shared/enums/topics.enum';

jest.mock('kafkajs');

describe('KafkaService', () => {
  let kafkaService: KafkaService;
  let mockProducer: Producer;
  let mockConsumer: Consumer;
  let mockLogger: LoggerService;

  beforeEach(() => {
    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as any;

    mockProducer = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      send: jest.fn(),
    } as any;

    mockConsumer = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      subscribe: jest.fn().mockResolvedValue(undefined),
      run: jest.fn().mockImplementation(async ({ eachMessage }) => {
        const mockMessage = {
          key: null,
          value: Buffer.from(JSON.stringify({ key: 'value' })),
          timestamp: '0',
          attributes: 0,
          offset: '0',
          headers: {},
        };
        await eachMessage({
          topic: Topics.Test,
          partition: 0,
          message: mockMessage,
        });
      }),
    } as any;

    jest.spyOn(Kafka.prototype, 'producer').mockReturnValue(mockProducer);
    jest.spyOn(Kafka.prototype, 'consumer').mockReturnValue(mockConsumer);

    kafkaService = new KafkaService(
      ['mock-broker:1234'],
      'mock-group',
      mockLogger,
    );
  });

  it('should connect to Kafka', async () => {
    await kafkaService.connect();
    expect(mockProducer.connect).toHaveBeenCalled();
    expect(mockConsumer.connect).toHaveBeenCalled();
    expect(mockLogger.log).toHaveBeenCalledWith(
      'Connected to Kafka successfully',
    );
  });

  it('should send a message', async () => {
    await kafkaService.sendMessage(Topics.Test, { key: 'value' });
    expect(mockProducer.send).toHaveBeenCalledWith({
      topic: Topics.Test,
      messages: [{ value: JSON.stringify({ key: 'value' }) }],
    });
    expect(mockLogger.log).toHaveBeenCalledWith(
      `Message sent to topic: ${Topics.Test}`,
    );
  });

  it('should handle error when sending a message fails', async () => {
    (mockProducer.send as jest.Mock).mockRejectedValueOnce(
      new Error('Send failed'),
    );

    await expect(
      kafkaService.sendMessage(Topics.Test, { key: 'value' }),
    ).rejects.toThrow('Send failed');

    expect(mockLogger.error).toHaveBeenCalledWith(
      `Failed to send message to topic ${Topics.Test}:`,
      'Send failed',
    );
  });

  it('should subscribe to a topic and process messages', async () => {
    const callback = jest.fn();

    kafkaService.consumeMessage(Topics.Test, callback);

    expect(mockConsumer.subscribe).toHaveBeenCalledWith({
      topic: Topics.Test,
      fromBeginning: false,
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(callback).toHaveBeenCalledWith({ key: 'value' });
  });

  it('should handle error during message processing', async () => {
    const errorCallback = jest.fn();

    jest
      .spyOn(mockConsumer, 'run')
      .mockImplementationOnce(async ({ eachMessage }) => {
        const mockMessage = {
          key: null,
          value: Buffer.from('invalid JSON'),
          timestamp: '0',
          attributes: 0,
          offset: '0',
          headers: {},
        };

        const payload = {
          topic: Topics.Test,
          partition: 0,
          message: mockMessage,
          heartbeat: jest.fn(),
          pause: jest.fn(),
        };

        try {
          await eachMessage(payload);
        } catch (error) {
          errorCallback(error);
        }
      });

    kafkaService.consumeMessage(Topics.Test, jest.fn());

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(errorCallback).toHaveBeenCalled();
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Error processing message',
      expect.any(String),
    );
  });
});
