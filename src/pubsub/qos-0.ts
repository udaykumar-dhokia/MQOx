import { connectRedis, publisher, subscriber } from "../redisClient";

export class PubSub {
  constructor(private channel: string) {}

  async connect(connectionUrl?: string) {
    await connectRedis(connectionUrl);
  }

  async publish<T>(message: T) {
    await publisher.publish(this.channel, JSON.stringify(message));
    console.log(`Published to ${this.channel}:`, message);
  }

  async subscribe(handler: (message: any) => void) {
    await subscriber.subscribe(this.channel, (message) => {
      handler(JSON.parse(message));
    });
    console.log(`Subscribed to channel: ${this.channel}`);
  }
}
