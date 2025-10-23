import { Queue } from "../index";

const queue = new Queue({ queueName: "taskQueue" });

async function main() {
  await queue.connect();

  queue.enqueue(
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
  queue.enqueue(
    "notification",
    { message: "Push Notification Here" },
    { delay: 2000 }
  );

  const size = await queue.size();
}

main();
