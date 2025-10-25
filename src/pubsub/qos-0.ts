import { connectRedis, publisher, subscriber } from "../redisClient";

export class PubSub0<T = any> {
  constructor(private channel: string) {}

  async connect(connectionUrl?: string) {
    try {
      await connectRedis(connectionUrl);
      console.log("Redis connected");
    } catch (err) {
      console.error("Failed to connect to Redis:", err);
      throw err;
    }
  }

  async publish(message: T) {
    try {
      await publisher.publish(this.channel, JSON.stringify(message));
      console.log(`Published to ${this.channel}:`, message);
    } catch (err) {
      console.error(`Failed to publish to ${this.channel}:`, err);
    }
  }

  async subscribe(handler: (message: T) => void) {
    try {
      await subscriber.subscribe(this.channel, (message) => {
        try {
          handler(JSON.parse(message));
        } catch (err) {
          console.error("Failed to parse message:", message, err);
        }
      });
      console.log(`Subscribed to channel: ${this.channel}`);
    } catch (err) {
      console.error(`Failed to subscribe to ${this.channel}:`, err);
    }
  }
}
