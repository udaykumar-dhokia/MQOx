<div align="center">

  <img src="https://drive.google.com/uc?export=view&id=10DPEd8SMJxXtIKmmExo_WJn4wHffUEGg" width="80px" alt="MQOx Logo"/>

  <h1 style="margin-top: 10px;">MQOx</h1>
  <p><strong>Message Queuing & Background Job Processing System</strong></p>

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/Redis-Supported-red?logo=redis&logoColor=white" alt="Redis Supported Badge"/>
    <img src="https://img.shields.io/badge/Status-Active-success" alt="Project Status Badge"/>
    <img src="https://img.shields.io/badge/Contributions-Welcome-brightgreen" alt="Contributions Welcome Badge"/>
  </p>

[![NPM Stats](https://nodei.co/npm/@udthedeveloper/mqox.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/@udthedeveloper/mqox/)

</div>

MQOx is a lightweight, flexible message queuing system powered by Redis. It supports delayed jobs, retries, **priority-based job scheduling**, worker processing, and features a Dead Letter Queue (DLQ) for robust fault tolerance.

---

> #### ✅ **Update: **Priority Queue** (High → Low execution order) & Web Dashboard is now available to monitor queues, priority queues, DLQs**

---

## Supported Models

| Model            | QoS Level | Persistence | Delivery Guarantee          | Ideal For                                |
| ---------------- | --------- | ----------- | --------------------------- | ---------------------------------------- |
| Queue            | QoS 1     | ✅ Yes      | Guaranteed (with DLQ)       | Background jobs, task runners            |
| Queue (Priority) | QoS 1     | ✅ Yes      | Guaranteed (priority order) | Task scheduling, notifications, SLA jobs |
| Pub/Sub          | QoS 0     | ❌ No       | Best effort (fire & forget) | Real-time notifications                  |
| Pub/Sub          | QoS 1     | ✅ Yes      | At-Least-Once Delivery      | Financial transactions, critical events  |

## **Overview**

A **message queue** is a system that lets applications handle tasks **asynchronously** - meaning jobs are added to a queue and processed later by background workers instead of immediately. This keeps your app fast, scalable, and fault-tolerant.

**MQOx** uses Redis to manage these queues efficiently.
It lets you:

- Enqueue jobs
- Process them using workers
- Automatically move failed jobs to a **Dead Letter Queue (DLQ)**

MQOx helps you build reliable background job systems for tasks like sending emails, generating reports, or handling any heavy processing all without blocking your main application.

  <img src="https://drive.google.com/uc?export=view&id=1c38p1BlGOKFoW8QyQE97p-UUsA_UQ2cy" alt="MQOx Dashboard"/>

---

  <img src="https://drive.google.com/uc?export=view&id=1z--DOdK-UT9qXikcFo5P0xuKkFXHz7Qq" alt="MQOx Logo"/>

---

## Features

| Feature               | Description                                       |
| --------------------- | ------------------------------------------------- |
| Job Enqueuing         | Push jobs with optional delays and retry settings |
| Worker Consumption    | Workers continuously listen and process jobs      |
| Retry Mechanism       | Automatically retries failed jobs                 |
| Dead Letter Queue     | Moves permanently failed jobs to a DLQ            |
| Scalable Architecture | Multiple workers can consume from the same queue  |

---

## Usage

## Dashboard

```ts
~/Desktop/MQOx$ mqox-dashboard

MQOx Dashboard is starting...
Connected to Redis at redis://localhost:6379
MQOx Dashboard: http://localhost:3000
```

### Queue Example

```js
const { Queue, Employee } = require("@udthedeveloper/mqox");

const queue = new Queue("emailQueue");
const worker = new Employee("emailQueue");

worker.work(async (job) => {
  console.log("Processing job:", job);
});
```

### Priority Queue

#### Producer

```js
const { Queue } = require("@udthedeveloper/mqox");

async function main() {
  const queue = new Queue({ queueName: "emailQueue", priority: true });
  await queue.connect();

  await queue.enqueue(
    "sendEmail",
    { to: "vip@domain.com" },
    { priorityLevel: 1 }
  );
  await queue.enqueue(
    "sendEmail",
    { to: "user@domain.com" },
    { priorityLevel: 3 }
  );
  await queue.enqueue(
    "sendEmail",
    { to: "subscriber@domain.com" },
    { priorityLevel: 5 }
  );

  console.log("✅ Emails enqueued by priority");
}

main();
```

#### Employee

```js
const { Employee } = require("@udthedeveloper/mqox");

async function main() {
  const worker = new Employee("emailQueue", { priority: true });
  await worker.work(async (job) => {
    console.log(`📩 Sending email to ${job.payload.to}`);
    await new Promise((r) => setTimeout(r, 1000));
    console.log(`✅ Email sent to ${job.payload.to}`);
  });
}

main();
```

### Pub/Sub QoS 0

```js
const { PubSub0 } = require("@udthedeveloper/mqox");

const pubsub = new PubSub0("notifications");

pubsub.subscribe((msg) => console.log("Received:", msg));
pubsub.publish({ text: "Hello world!" });
```

### Pub/Sub QoS 1

```js
const { PubSub1 } = require("@udthedeveloper/mqox");

const pubsub = new PubSub1("order-stream", "order-group", "worker-1");

async function main() {
  await pubsub.connect();

  await pubsub.publish({ orderId: 101, status: "CREATED" });

  pubsub.subscribe(async (message) => {
    console.log("Received QoS1 message:", message);
  });
}

main();
```

---

## 📁 **Project Structure**

```
MQOx
│
├── src
│ ├── demo
│ │ ├── demoJobEmployee.ts # Worker demo
│ │ └── demoJobProducer.ts # Queue demo producer
│ │
│ ├── pubsub
│ │ ├── qos-0.ts # Pub/Sub QoS 0
│ │ └── qos-1.ts # Pub/Sub QoS 1
│ │
│ ├── types
│ │ ├── employee.type.ts
│ │ ├── enqueue.type.ts
│ │ └── job.type.ts
│ │
│ ├── employee.ts
│ ├── queue.ts
│ ├── redisClient.ts
│ └── index.ts
│
├── public/assets
│ ├── example.jpeg
│ ├── Flow.jpg
│ └── logo.jpeg
│
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

---

## Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/udaykumar-dhokia/MQOx.git
cd MQOx
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Setup Environment Variables

Create a `.env` file in the project root:

```env
REDIS_URL=redis://localhost:6379
```

> Make sure Redis is running locally or update the URL accordingly.

### 4️⃣ Build the Project

```bash
npm run build
```

---

## Running the Demo

### **Step 1: Start the Worker**

This will start listening for jobs and processing them.

```bash
npm run demo:employee
```

### **Step 2: Run the Producer to Add Jobs**

In a new terminal:

```bash
npm run demo:producer
```

### Expected Output

- Jobs will be added to the queue.
- Worker consumes them.
- If a job fails and retry attempts are exhausted, it's moved to the **Dead Letter Queue**.

---

## How MQOx Works (Flow)

```
┌────────────────┐
│  Producer      │
│ (enqueue job)  │
└───────┬────────┘
        ▼
┌───────────────────────┐
│ Redis Queue (FIFO)    │
└───────┬───────────────┘
        ▼
┌───────────────────────┐
│ Employee (Worker)     │
│ Processes the Job     │
└───────┬───────┬───────┘
        │Success│Failure
        │       ▼
        │   RetryCount > 0?
        │         │
        │         ├─ YES → Requeue
        │         └─ NO → Dead Letter Queue
        ▼
┌───────────────────────┐
│Dead Letter Queue (DLQ)│
└───────────────────────┘
```

---

## Commands Overview

| Command                 | Description          |
| ----------------------- | -------------------- |
| `npm install`           | Install dependencies |
| `npm run build`         | Compile TypeScript   |
| `npm run demo:employee` | Run worker demo      |
| `npm run demo:producer` | Run producer demo    |

You can define these scripts in your `package.json` like:

```json
"scripts": {
  "build": "tsc",
  "start": "node dist/index.js",
  "demo:employee": "ts-node src/demo/demoJobEmployee.ts",
  "demo:producer": "ts-node src/demo/demoJobProducer.ts"
}
```

---

## 🙌 Contribution

Pull requests and feature suggestions are welcome!

> ⭐ If this project is useful to you, please give it a star to show your support!

---
