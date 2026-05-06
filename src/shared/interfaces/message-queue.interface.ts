export interface IMessageQueue {
  connect(): Promise<void>;
  sendMessage(topic: string, message: any): Promise<void>;
  consumeMessage(topic: string, callback: (message: any) => void): void;
}
