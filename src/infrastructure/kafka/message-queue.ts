export abstract class MessageQueueBase {
  abstract connect(): Promise<void>;

  abstract sendMessage(topic: string, message: any): Promise<void>;

  abstract consumeMessage(
    topic: string,
    callback: (message: any) => void,
  ): void;
}
