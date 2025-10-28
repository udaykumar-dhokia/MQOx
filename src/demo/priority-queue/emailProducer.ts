import { Queue } from "../../index";

async function main() {
  const queue = new Queue({ queueName: "emailQueue", priority: true });
  await queue.connect();

  console.log("🚀 Enqueuing emails...");

  // Low-priority job
  await queue.enqueue(
    "sendEmail",
    { to: "subscriber@domain.com", subject: "Weekly Newsletter" },
    { priorityLevel: 5 }
  );

  // Medium-priority job
  await queue.enqueue(
    "sendEmail",
    { to: "customer@domain.com", subject: "Order Update" },
    { priorityLevel: 3 }
  );

  // High-priority jobs
  await queue.enqueue(
    "sendEmail",
    { to: "vip@domain.com", subject: "VIP Offer" },
    { priorityLevel: 1 }
  );
  await queue.enqueue(
    "sendEmail",
    { to: "ceo@company.com", subject: "System Alert" },
    { priorityLevel: 1 }
  );

  console.log("✅ All emails enqueued.");
  process.exit(0);
}

main();
