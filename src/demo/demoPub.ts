import { PubSub } from "../index";

async function Publisher() {
  const pub = new PubSub("orders");
  await pub.connect();
  await pub.publish({
    orderId: "123",
    status: "created",
  });
}

Publisher();
