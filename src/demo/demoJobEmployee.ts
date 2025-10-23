import { Employee } from "../index";

const employee = new Employee("taskQueue");

async function main() {
  employee.work(async (job) => {
    console.log(`Processing ${job.type}`, job.payload);
  });
}

main();
