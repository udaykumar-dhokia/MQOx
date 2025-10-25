import redisClient, { connectRedis } from "../redisClient";
import { Job } from "../types/job.type";

export class Employee {
  private deadLetterQueueName: string;

  constructor(private queueName: string, deadLetterQueueName?: string) {
    this.deadLetterQueueName = deadLetterQueueName ?? `${this.queueName}:DLQ`;
  }

  async work(
    handler: (job: Job) => Promise<void> | void,
    connectionUrl?: string
  ) {
    // Connect to the Redis client
    await connectRedis(connectionUrl);
    console.log(`Employee working on queue "${this.queueName}"`);

    while (true) {
      const result = await redisClient.brPop(this.queueName, 0);
      if (!result) continue;

      const raw = result.element;
      const job: Job = JSON.parse(raw);

      try {
        await handler(job);
      } catch (error) {
        if (job.options.retryCount! > 0) {
          job.options.retryCount!--;
          await redisClient.lPush(this.queueName, JSON.stringify(job));
        } else {
          console.error(`Error processing job ${job.id}:`, error);
          await redisClient.lPush(
            this.deadLetterQueueName,
            JSON.stringify(job)
          );
        }
      }
    }
  }
}
