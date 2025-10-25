import { PubSub1 } from "../../index";

async function billingConsumer() {
  const billing = new PubSub1(
    "order_stream",
    "billing-group",
    "billing-consumer-1"
  );

  await billing.connect();

  await billing.subscribe(async (order) => {
    console.log("💳 Billing Service: Processing order", order);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("✅ Billing complete for order:", order.id);
  });
}

billingConsumer();
