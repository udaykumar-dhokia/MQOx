import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

export function createRedisClient(
  url: string = process.env.REDIS_URL || "redis://localhost:6379"
) {
  const client = createClient({ url });

  client.on("error", (err) => console.error("Redis Client Error", err));

  return client;
}

let redisClient = createRedisClient();

export const publisher = createRedisClient();
export const subscriber = createRedisClient();

export async function connectRedis(url?: string): Promise<void> {
  if (url) {
    redisClient = createRedisClient(url);
  }

  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log(`Connected to Redis at ${redisClient.options!.url}`);
  }

  if (!publisher.isOpen) {
    await publisher.connect();
  }

  if (!subscriber.isOpen) {
    await subscriber.connect();
  }
}

export default redisClient;
