import { PubSub1 } from "../../index";

async function notificationConsumer() {
  const notifications = new PubSub1(
    "order_stream",
    "notification-group",
    "notification-consumer-1"
  );

  await notifications.connect();

  await notifications.subscribe(async (order) => {
    console.log("📧 Notification Service: Sending email for order", order);
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("📨 Email sent to user:", order.user);
  });
}

notificationConsumer();
