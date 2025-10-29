import { Employee } from "../../index";

async function main() {
  const worker = new Employee("emailQueue", {
    priority: true,
  });

  await worker.work(async (job) => {
    console.log(
      `📩 Sending email to ${job.payload.to} — Subject: "${job.payload.subject}"`
    );

    await new Promise((r) => setTimeout(r, 1000));

    console.log(`✅ Email sent successfully to ${job.payload.to}`);
  });
}

main();
