import { PubSub0 } from "../index";

async function Subscriber() {
  const sub = new PubSub0("orders");
  await sub.connect();
  await sub.subscribe((data) => {
    console.log("Received:", data);
  });
}

Subscriber();
