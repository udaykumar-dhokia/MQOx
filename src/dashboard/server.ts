import express from "express";
import path from "path";
import redisClient, { connectRedis } from "../redisClient";
import http from "http";

const app = express();
const server = http.createServer(app);
app.use(express.json());

app.use(express.static(path.join(__dirname, "./public")));

// List all available queues
app.get("/queues", async (req, res) => {
  try {
    const keys = await redisClient.keys("queue:*");
    res.json(keys);
  } catch (err) {
    res.status(500).json({ error: "Failed to list queues", details: err });
  }
});

// List all DLQs
app.get("/dlqs", async (req, res) => {
  try {
    const keys = await redisClient.keys("dlq:*");
    res.json(keys);
  } catch (err) {
    res.status(500).json({ error: "Failed to list DLQs", details: err });
  }
});

// List all priority queues
app.get("/pqueues", async (req, res) => {
  try {
    const keys = await redisClient.keys("pqueue:*");
    res.json(keys);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to list priority queues", details: err });
  }
});

// Combined: queues, dlqs, pqueues
app.get("/queues/all", async (req, res) => {
  try {
    const [queues, dlqs, pqueues] = await Promise.all([
      redisClient.keys("queue:*"),
      redisClient.keys("dlq:*"),
      redisClient.keys("pqueue:*"),
    ]);
    res.json({ queues, dlqs, pqueues });
  } catch (err) {
    res.status(500).json({ error: "Failed to list queues", details: err });
  }
});

// Get all jobs in a queue
app.get("/queue/:name/jobs", async (req, res) => {
  const { name } = req.params;

  try {
    // Check if this is a priority queue
    const isPQueue = await redisClient.exists(`pqueue:${name}`);
    let jobs: string[] = [];

    if (isPQueue) {
      jobs = await redisClient.zRange(`pqueue:${name}`, 0, -1);
    } else {
      jobs = await redisClient.lRange(`queue:${name}`, 0, -1);
    }

    res.json(jobs.map((j) => JSON.parse(j)));
  } catch (err) {
    res
      .status(500)
      .json({ error: `Failed to get jobs for queue ${name}`, details: err });
  }
});

// Get failed jobs (DLQ)
app.get("/queue/:name/dlq", async (req, res) => {
  const { name } = req.params;
  const jobs = await redisClient.lRange(`dlq:${name}`, 0, -1);
  res.json(jobs.map((j: any) => JSON.parse(j)));
});

server.listen(3000, async () => {
  await connectRedis();
  console.log("MQOx Dashboard: http://localhost:3000");
});
