# OpsPilot — System Design

## 1. Overview

OpsPilot uses a modular backend design where each major functionality is separated into its own module.

The backend follows this general structure:

```text
Client / Dashboard
        │
        ▼
     Routes
        │
        ▼
   Controllers
        │
        ▼
    Services
        │
        ▼
    Database


Kafka is integrated into the metric-processing flow:

Metric API
    │
    ▼
Metric Service
    │
    ├──────────────► PostgreSQL
    │
    ▼
Kafka Producer
    │
    ▼
metric-events
    │
    ▼
Kafka Consumer

2. Backend Layered Design
2.1 Routes

Routes define the HTTP endpoints exposed by the backend.

Examples:

/api/auth
/api/incidents
/api/logs
/api/metrics
/api/deployments
/api/services
/api/alerts

Routes receive incoming HTTP requests and forward them to the appropriate controller.

2.2 Controllers

Controllers handle HTTP-level operations.

Their responsibilities include:

Reading request data
Validating input
Calling service functions
Returning HTTP responses
Handling request errors

Controllers should not contain large amounts of database logic.

2.3 Services

Services contain the main application/business logic.

Examples include:

auth.service.ts
metric.service.ts
incident.service.ts
alert.service.ts
service.service.ts

The service layer communicates with PostgreSQL and other application components.

3. Authentication Design

The authentication flow is:

User
 │
 ▼
POST /api/auth/login
 │
 ▼
Auth Controller
 │
 ▼
Auth Service
 │
 ▼
Verify password
 │
 ▼
Generate JWT
 │
 ▼
Return token

For protected endpoints:

Client
 │
 │ Authorization: Bearer <JWT>
 ▼
Authentication Middleware
 │
 ├── Valid token ──► Controller
 │
 └── Invalid token ──► 401 Response
4. Metric Processing Design

Metric creation follows this flow:

POST /api/metrics
        │
        ▼
Metric Controller
        │
        ▼
Metric Validation
        │
        ▼
Metric Service
        │
        ├──────────────► Validate Service
        │
        ├──────────────► Insert Metric
        │
        └──────────────► Publish Kafka Event
                              │
                              ▼
                         metric-events

A metric contains information such as:

serviceId
metricName
metricValue
timestamp
5. Alert Evaluation Design

Metric values can be evaluated against alert rules.

Conceptually:

Metric
  │
  ▼
Alert Rule Evaluation
  │
  ├── Condition not met
  │       │
  │       ▼
  │     No Alert
  │
  └── Condition met
          │
          ▼
      Alert Triggered
          │
          ▼
       Incident

This allows the monitoring system to convert abnormal metric values into actionable operational events.

6. Incident Management Design

An incident represents a production problem that requires investigation or resolution.

The general flow is:

Alert
 │
 ▼
Incident
 │
 ├── Open
 │
 ├── Investigation
 │
 └── Resolved

An incident stores information such as:

Service
Title
Description
Severity
Status
Start time
Resolution time
Creator
Assignee
7. Kafka Producer Design

The Kafka producer is implemented using KafkaJS.

The producer connects to:

localhost:9092

The current topic is:

metric-events

Metric events are serialized as JSON before being published.

Example:

{
  "serviceId": "service-id",
  "metricName": "cpu_usage",
  "metricValue": 75,
  "timestamp": "2026-09-30T14:51:44.193Z"
}

The service ID is used as the Kafka message key.

This helps keep events for the same service associated with the same partitioning key.

8. Kafka Consumer Design

The backend also contains a Kafka consumer.

Consumer group:

opspilot-metric-consumer

The consumer subscribes to:

metric-events

The consumer receives events asynchronously.

Kafka
  │
  ▼
Consumer Group
  │
  ▼
Metric Consumer
  │
  ▼
Event Processing
9. Database Interaction

The backend uses PostgreSQL through a connection pool.

The database layer is responsible for:

Opening database connections
Executing parameterized SQL queries
Returning query results
Managing database communication

Parameterized queries are used to avoid directly inserting user input into SQL statements.

Example:

SELECT id
FROM services
WHERE id = $1;
10. Module Structure

The backend is organized by functionality.

src/
│
├── config/
│
├── database/
│
├── kafka/
│
├── middleware/
│
├── modules/
│   ├── auth/
│   ├── alerts/
│   ├── incidents/
│   ├── logs/
│   ├── metrics/
│   ├── deployments/
│   └── services/
│
└── server.ts

This structure makes individual features easier to develop, test, and maintain.

11. Error Handling

The backend returns appropriate error responses when operations fail.

Examples include:

Invalid or expired token
Invalid authorization format
Service not found
Metric not found
Invalid email or password

Database and Kafka errors are logged by the backend to help with debugging.

12. Health Monitoring

Two health endpoints are currently available.

Application Health
GET /api/health

Used to verify that the backend is running.

Database Health
GET /api/health/db

Used to verify that the backend can communicate with PostgreSQL.

13. Current Architecture Pattern

OpsPilot currently combines:

Layered Application Architecture
             +
Modular Backend Architecture
             +
Event-Driven Architecture

The REST API handles synchronous application requests, while Kafka provides asynchronous event streaming for metric events.

14. Design Goal

The system is designed so that additional functionality can be added without significantly changing existing modules.

Future components such as:

Real-time dashboard updates
Log correlation
AI-assisted analysis
Root-cause analysis
Automated recommendations

can be integrated on top of the existing architecture.

