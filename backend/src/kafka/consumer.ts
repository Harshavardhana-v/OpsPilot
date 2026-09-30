import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "opspilot-consumer",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({
  groupId: "opspilot-metric-consumer",
});

export async function startMetricConsumer() {
  await consumer.connect();

  await consumer.subscribe({
    topic: "metric-events",
    fromBeginning: false,
  });

  console.log("Kafka consumer connected");
  console.log("Listening to metric-events...");

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) {
        return;
      }

      const event = JSON.parse(message.value.toString());

      console.log("📥 Metric event received:");
      console.log(event);
    },
  });
}