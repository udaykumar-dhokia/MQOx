import { connectRedis, publisher, subscriber } from "../redisClient";

type XReadGroupStreamResponse = {
  name: string;
  messages: { id: string; message: Record<string, string> }[];
}[];

export class PubSub1 {
  constructor(
    private stream: string,
    private group: string,
    private consumer: string
  ) {}

  async connect(connectionUrl?: string) {
    await connectRedis(connectionUrl);

    try {
      await publisher.xGroupCreate(this.stream, this.group, "$", {
        MKSTREAM: true,
      });
      console.log(
        `Created consumer group "${this.group}" on stream "${this.stream}"`
      );
    } catch (err: any) {
      if (err?.message?.includes("BUSYGROUP")) {
        console.log(`Consumer group "${this.group}" already exists`);
      } else {
        throw err;
      }
    }
  }

  async publish<T>(message: T) {
    await publisher.xAdd(this.stream, "*", { data: JSON.stringify(message) });
    console.log(`QoS1 Published to stream "${this.stream}":`, message);
  }

  async subscribe(handler: (message: any) => Promise<void> | void) {
    console.log(
      `Subscribing to stream "${this.stream}" with consumer "${this.consumer}"...`
    );

    while (true) {
      const response = await subscriber.xReadGroup(
        this.group,
        this.consumer,
        [{ key: this.stream, id: ">" }],
        { COUNT: 1, BLOCK: 5000 }
      );

      if (!response) continue;

      const streams = response as XReadGroupStreamResponse;

      for (const streamData of streams) {
        for (const { id, message: fields } of streamData.messages) {
          const message = JSON.parse(fields.data);
          try {
            await handler(message);
            await subscriber.xAck(this.stream, this.group, id);
            console.log(`ACKed message ${id}`);
          } catch (err) {
            console.error(`Handler error for message ${id}, will retry:`, err);
          }
        }
      }
    }
  }
}
