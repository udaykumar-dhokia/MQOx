import { randomUUID } from "crypto";
import redisClient, { connectRedis } from "../redisClient";
import { QueueOptions } from "../types/employee.type";
import { Job } from "../types/job.type";
import { EnqueueOptions } from "../types/enqueue.type";

export class Queue {
  private queueName: string;
  private deadLetterQueueName: string;
  private isPriority: boolean;

  constructor(options: QueueOptions = {}) {
    this.queueName = options.queueName ?? "defaultQueue";
    this.deadLetterQueueName =
      options.deadLetterQueueName ?? `${this.queueName}:DLQ`;
    this.isPriority = options?.priority ?? false;
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
    const { retryCount = 0, delay = 0, priorityLevel = 5 } = options;
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    const job: Job<T> = { id: randomUUID(), type, payload, options };

    if (this.isPriority) {
      const score = Date.now() + priorityLevel * 1000 + delay;
      await redisClient.zAdd(this.queueName, {
        score,
        value: JSON.stringify(job),
      });
      console.log(
        `📦 [Priority Queue] Enqueued job ${job.id} (priority ${priorityLevel})`
      );
    } else {
      await redisClient.lPush(this.queueName, JSON.stringify(job));
      console.log(`📦 [Queue] Enqueued job ${job.id}`);
    }

    return job;
  }

  // Get the length of the job queue
  async size(): Promise<Number> {
    return redisClient.lLen(this.queueName);
  }
}
