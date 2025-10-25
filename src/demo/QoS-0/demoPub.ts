import { PubSub0 } from "../../index";

async function Publisher() {
  const pub = new PubSub0("orders");
  await pub.connect();
  await pub.publish({
    orderId: "123",
    status: "created",
  });
}

Publisher();
