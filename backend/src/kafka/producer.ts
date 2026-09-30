import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "opspilot-backend",
  brokers: ["localhost:9092"],
});

export const producer = kafka.producer();

export async function connectProducer() {
  await producer.connect();
  console.log("Kafka producer connected");
}

export async function publishMetricEvent(event: {
  serviceId: string;
  metricName: string;
  metricValue: number;
  timestamp?: string;
}) {
  await producer.send({
    topic: "metric-events",
    messages: [
      {
        key: event.serviceId,
        value: JSON.stringify(event),
      },
    ],
  });

  console.log("Metric event published to Kafka:", event);
}