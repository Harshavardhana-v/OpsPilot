3. Main Tables
3.1 Users

The users table stores authenticated platform users.

Important information includes:

User ID
Name
Email
Password hash
Role

Passwords are stored as hashes rather than plain-text passwords.

3.2 Services

The services table represents applications or services monitored by OpsPilot.

Important fields include:

Field	Description
id	Unique service identifier
name	Service name
description	Service description
owner_id	User responsible for the service
environment	Environment such as production
status	Current service health status

Example environment:

production

Example status:

healthy
3.3 Metrics

The metrics table stores measurements collected for services.

Important fields include:

Field	Description
id	Unique metric identifier
service_id	Associated service
metric_name	Name of the metric
metric_value	Measured value
timestamp	Time the metric was recorded

Example:

metric_name  = cpu_usage
metric_value = 75

Metrics are also used as the source for Kafka metric events.

3.4 Alerts

The alerts table stores alerts generated when metric conditions are triggered.

Important information includes:

Alert ID
Metric value
Alert status
Associated incident
Triggered time
Resolution time

Example alert status:

open
resolved

An alert may be associated with an incident.

3.5 Incidents

The incidents table represents operational incidents.

Important fields include:

Field	Description
id	Unique incident identifier
service_id	Affected service
title	Incident title
description	Incident details
severity	Incident severity
status	Current incident status
started_at	Incident start time
resolved_at	Resolution time
created_by	User who created the incident
assigned_to	User assigned to the incident
created_at	Creation timestamp
updated_at	Last update timestamp

Example:

title    = High CPU Usage
severity = SEV2
status   = resolved
3.6 Logs

The logs table stores application or operational log information associated with services.

Logs can be used together with metrics and incidents during investigation.

3.7 Deployments

The deployments table stores deployment-related information.

This allows deployment activity to be associated with operational events and can later help investigate whether a deployment contributed to an incident.

3.8 Runbooks

The runbooks table stores operational procedures that can be used when responding to incidents.

Runbooks provide a foundation for future automated incident-response recommendations.

3.9 Incident Events

The incident_events table stores events associated with an incident.

Examples include:

Incident created
Incident assigned
Severity changed
Status changed
Incident resolved

This provides the foundation for an incident timeline.

4. Entity Relationships

The main relationships can be represented as:

                 ┌──────────────┐
                 │    Users     │
                 └──────┬───────┘
                        │
                 ┌──────┴───────┐
                 │              │
                 ▼              ▼
          ┌─────────────┐  ┌─────────────┐
          │  Services   │  │  Incidents  │
          └──────┬──────┘  └──────┬──────┘
                 │                │
       ┌─────────┼─────────┐      │
       │         │         │      │
       ▼         ▼         ▼      ▼
   Metrics     Logs    Deployments  │
       │                           │
       ▼                           ▼
    Alerts                  Incident Events
       │
       ▼
   Incidents
5. Service → Metrics Relationship

A service can have multiple metrics.

Service
   │
   ├── CPU Usage
   ├── Memory Usage
   ├── Request Rate
   └── Error Rate

Conceptually:

One Service
     │
     └──────► Many Metrics

The metrics.service_id field identifies the associated service.

6. Service → Incidents Relationship

An incident can be associated with a service.

Service
   │
   ├── Incident 1
   ├── Incident 2
   └── Incident 3

This allows engineers to identify which service is affected by an incident.

7. Alert → Incident Relationship

An alert can be associated with an incident.

Metric Threshold Exceeded
          │
          ▼
        Alert
          │
          ▼
      Incident

For example:

CPU = 95%
     │
     ▼
High CPU Alert
     │
     ▼
High CPU Usage Incident
8. Incident Timeline

Incident events provide a historical timeline.

Incident Created
       │
       ▼
Alert Triggered
       │
       ▼
Incident Assigned
       │
       ▼
Investigation
       │
       ▼
Incident Resolved

These events can later be displayed in the dashboard.

9. Metric and Kafka Relationship

Metrics have two related paths:

                    Metric
                      │
            ┌─────────┴─────────┐
            │                   │
            ▼                   ▼
       PostgreSQL           Kafka Producer
            │                   │
            │                   ▼
            │              metric-events
            │                   │
            │                   ▼
            │              Kafka Consumer
            │
            ▼
       Historical Data

PostgreSQL provides persistent storage, while Kafka provides event streaming.

10. Data Integrity

The database uses relational constraints to maintain relationships between entities.

Examples include:

Primary keys
Foreign keys
Non-null constraints
Default values
Unique constraints where required

Foreign keys help ensure that references to services, users, and incidents point to valid records.

11. Database Health Check

OpsPilot provides a database health endpoint:

GET /api/health/db

The backend executes:

SELECT NOW() AS current_time;

A successful response confirms that the backend can communicate with PostgreSQL.

12. Example Incident Data

A typical incident record can contain:

Title:       High CPU Usage
Severity:    SEV2
Status:      resolved
Started At:  2026-09-30 14:08:00
Resolved At: 2026-09-30 14:09:48

This information allows the dashboard to display the lifecycle of an incident.

13. Database Design Goals

The database is designed to:

Store operational data persistently.
Maintain relationships between services and operational events.
Support metric and alert processing.
Track the lifecycle of incidents.
Maintain incident history.
Support dashboard queries.
Provide a foundation for future reliability analytics.

Save it.

### Step 12 — Verify

```powershell
Get-Content .\docs\04-database-design.md


2. Kafka Infrastructure

Kafka is currently running inside Docker.

Container:

opspilot-kafka

Kafka image:

apache/kafka:4.1.1

Kafka is exposed on:

localhost:9092

PostgreSQL runs separately in:

opspilot-postgres
3. Kafka Topic

The current topic is:

metric-events

Topic configuration:

Partitions:          3
Replication Factor:  1

The topic was created using:

kafka-topics.sh \
  --create \
  --topic metric-events \
  --bootstrap-server localhost:9092 \
  --partitions 3 \
  --replication-factor 1

The topic can be verified using:

kafka-topics.sh \
  --list \
  --bootstrap-server localhost:9092
4. Kafka Producer

The OpsPilot backend uses KafkaJS as the Kafka client.

The producer connects to:

localhost:9092

Producer client ID:

opspilot-backend

The producer is responsible for publishing metric events.

5. Metric Event

When a metric is created, the backend publishes an event to Kafka.

Example event:

{
  "serviceId": "a1d9c887-ec05-4e0f-af9b-ba3bcb6e0400",
  "metricName": "cpu_usage",
  "metricValue": 75,
  "timestamp": "2026-09-30T14:51:44.193Z"
}

The event contains:

Field	Purpose
serviceId	Identifies the monitored service
metricName	Name of the metric
metricValue	Current metric value
timestamp	Time associated with the metric
6. Kafka Message Key

The service ID is used as the Kafka message key.

Conceptually:

Key:
serviceId

Value:
Metric event JSON

Using the service ID as the key allows Kafka to consistently partition events based on the service.

7. Producer Flow

The producer flow is:

POST /api/metrics
       │
       ▼
Metric Controller
       │
       ▼
Metric Service
       │
       ├──────────────► PostgreSQL
       │
       ▼
publishMetricEvent()
       │
       ▼
Kafka Producer
       │
       ▼
metric-events

The metric is first persisted in PostgreSQL and then published as an event.

8. Kafka Consumer

The backend contains a Kafka consumer that subscribes to:

metric-events

The consumer group is:

opspilot-metric-consumer

The consumer receives metric events from Kafka and processes them asynchronously.

9. Consumer Flow
                  Apache Kafka
                       │
                       ▼
                metric-events
                       │
                       ▼
             Consumer Group
                       │
                       ▼
             Metric Consumer
                       │
                       ▼
              Event Processing

The consumer operates independently from the HTTP request that created the metric.

10. Consumer Group

The current consumer group is:

opspilot-metric-consumer

The topic has three partitions:

metric-events
 ├── Partition 0
 ├── Partition 1
 └── Partition 2

Kafka assigns partitions to consumers within the consumer group.

This allows the architecture to support multiple consumers if the system is scaled later.

11. Verified Kafka Flow

The Kafka pipeline has been tested successfully.

A metric was submitted through:

POST /api/metrics

with:

{
  "serviceId": "a1d9c887-ec05-4e0f-af9b-ba3bcb6e0400",
  "metricName": "cpu_usage",
  "metricValue": 75
}

The metric was successfully created by the backend.

The event was then visible in Kafka:

{
  "serviceId": "a1d9c887-ec05-4e0f-af9b-ba3bcb6e0400",
  "metricName": "cpu_usage",
  "metricValue": 75,
  "timestamp": "2026-09-30T14:51:44.193Z"
}

This confirms that:

Backend
   ↓
Kafka Producer
   ↓
metric-events
   ↓
Kafka Consumer

is functioning.

12. Kafka Console Testing

Kafka events can also be inspected using the Kafka console consumer.

Example:

kafka-console-consumer.sh \
  --topic metric-events \
  --bootstrap-server localhost:9092 \
  --from-beginning

Example output:

{
  "serviceId": "a1d9c887-ec05-4e0f-af9b-ba3bcb6e0400",
  "metricName": "cpu_usage",
  "metricValue": 95
}
{
  "serviceId": "a1d9c887-ec05-4e0f-af9b-ba3bcb6e0400",
  "metricName": "cpu_usage",
  "metricValue": 75,
  "timestamp": "2026-09-30T14:51:44.193Z"
}
13. Kafka and PostgreSQL Responsibilities

Kafka and PostgreSQL serve different purposes.

PostgreSQL

Used for persistent storage.

Metric
   ↓
PostgreSQL
   ↓
Historical record
Kafka

Used for event streaming.

Metric
   ↓
Kafka
   ↓
Event consumers

Therefore:

PostgreSQL = Persistent Data

Kafka = Event Streaming
14. Why Kafka Is Used

Kafka provides an event-driven communication layer between components.

Benefits include:

Asynchronous event processing
Decoupling between producers and consumers
Partition-based processing
Consumer groups
Ability to add additional consumers later
Foundation for real-time monitoring
15. Future Kafka Extensions

Kafka can later be extended to support additional event types such as:

metric-events
alert-events
incident-events
deployment-events
log-events

This would allow different parts of OpsPilot to react to operational events independently.

16. Kafka Architecture Summary

The current architecture is:

                   OpsPilot Backend
                         │
                         │
                  Metric Created
                         │
                         ▼
                  Kafka Producer
                         │
                         ▼
              ┌───────────────────┐
              │      Kafka        │
              │                   │
              │  metric-events    │
              │                   │
              │ P0 │ P1 │ P2      │
              └────────┬──────────┘
                       │
                       ▼
                Consumer Group
                       │
                       ▼
               Metric Consumer
                       │
                       ▼
                Event Processing

Kafka therefore forms the event-driven backbone of the metric-processing pipeline.


