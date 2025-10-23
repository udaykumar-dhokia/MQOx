import { randomUUID } from "crypto";
import redisClient, { connectRedis } from "./redisClient";
import { QueueOptions } from "./types/employee.type";
import { Job } from "./types/job.type";
import { EnqueueOptions } from "./types/enqueue.type";

export class Queue {
  private queueName: string;
  private deadLetterQueueName: string;

  constructor(options: QueueOptions = {}) {
    this.queueName = options.queueName ?? "defaultQueue";
    this.deadLetterQueueName =
      options.deadLetterQueueName ?? `${this.queueName}:DLQ`;
  }

  // Connect with the Redis client
  async connect(connectionUrl?: string) {
    await connectRedis(connectionUrl);
  }

  // Add the job to the queue
  async enqueue<T>(
    type: string,
    payload: T,
    options: EnqueueOptions = {}
  ): Promise<Job<T>> {
    const { retryCount = 0, delay = 0 } = options;
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    const job: Job<T> = { id: randomUUID(), type, payload, options };
    await redisClient.lPush(this.queueName, JSON.stringify(job));
    return job;
  }

  // Get the length of the job queue
  async size(): Promise<Number> {
    return redisClient.lLen(this.queueName);
  }
}
