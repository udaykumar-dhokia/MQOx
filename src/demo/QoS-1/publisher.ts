import { PubSub1 } from "../../index";

async function publisher() {
  const pubsub = new PubSub1("order_stream", "unused-group", "unused-consumer");

  await pubsub.connect();

  let orderId = 1;
  setInterval(async () => {
    const order = { id: orderId++, user: "Alice", total: 99.99 };
    await pubsub.publish(order);
    console.log("Order published:", order);
  }, 3000);
}

publisher();
