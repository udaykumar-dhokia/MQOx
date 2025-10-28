import redisClient, { connectRedis } from "../redisClient";
import { EmployeeOptions } from "../types/employee.type";
import { Job } from "../types/job.type";

export class Employee {
  private deadLetterQueueName: string;
  private isPriority: boolean;

  constructor(
    private queueName: string,
    deadLetterQueueNameOrOptions?: string | EmployeeOptions
  ) {
    if (typeof deadLetterQueueNameOrOptions === "string") {
      this.deadLetterQueueName = deadLetterQueueNameOrOptions;
      this.isPriority = false;
    } else {
      this.deadLetterQueueName =
        deadLetterQueueNameOrOptions?.priority && this.queueName
          ? `${this.queueName}:DLQ`
          : `${this.queueName}:DLQ`;
      this.isPriority = deadLetterQueueNameOrOptions?.priority ?? false;
    }
  }

  async work(
    handler: (job: Job) => Promise<void> | void,
    connectionUrl?: string
  ) {
    // Connect to the Redis client
    await connectRedis(connectionUrl);
    console.log(`Employee working on queue "${this.queueName}"`);

    while (true) {
      let job: Job | null = null;

      try {
        if (this.isPriority) {
          const result = await redisClient.zPopMin(this.queueName);
          if (result && result.value) {
            job = JSON.parse(result.value);
          }
        } else {
          const result = await redisClient.brPop(this.queueName, 0);
          if (result) {
            job = JSON.parse(result.element);
          }
        }

        if (!job) {
          await new Promise((r) => setTimeout(r, 500));
          continue;
        }

        // Process the job
        await handler(job);
      } catch (error) {
        if (job) {
          // Handle retries
          const retriesLeft = job.options?.retryCount ?? 0;
          if (retriesLeft > 0) {
            job.options.retryCount = retriesLeft - 1;

            if (this.isPriority) {
              // Requeue in priority mode (same score or slightly lower)
              await redisClient.zAdd(this.queueName, {
                score: Date.now() + (job.options.priorityLevel ?? 5) * 1000,
                value: JSON.stringify(job),
              });
            } else {
              await redisClient.lPush(this.queueName, JSON.stringify(job));
            }

            console.warn(
              `⚠️ Job ${job.id} failed. Retrying (${retriesLeft - 1} left)`
            );
          } else {
            // Move to Dead Letter Queue
            console.error(`❌ Job ${job.id} failed permanently:`, error);
            await redisClient.lPush(
              this.deadLetterQueueName,
              JSON.stringify(job)
            );
          }
        } else {
          console.error("Unexpected worker error:", error);
        }
      }
    }
  }
}
