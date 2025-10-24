import { Queue } from "../index";

const queue = new Queue({ queueName: "taskQueue" });

async function main() {
  await queue.connect();

  const job1 = await queue.enqueue(
    "email",
    {
      to: "john@example.com",
      from: "udaykumardhokia@gmail.com",
      subject: "Hello World",
    },
    {
      retryCount: 5,
    }
  );
  const job2 = await queue.enqueue(
    "notification",
    { message: "Push Notification Here" },
    { delay: 2000 }
  );
  console.log(`Job created: ${job1.id}`);
  console.log(`Job created: ${job2.id}`);

  const size = await queue.size();
}

main();
