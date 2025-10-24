import { PubSub } from "../index";

async function Subscriber() {
  const sub = new PubSub("orders");
  await sub.connect();
  await sub.subscribe((data) => {
    console.log("Received:", data);
  });
}

Subscriber();
