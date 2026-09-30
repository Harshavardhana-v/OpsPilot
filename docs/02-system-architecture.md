# OpsPilot — System Architecture

## 1. Architecture Overview

OpsPilot follows a modular backend architecture with event-driven metric processing.

The major components are:

1. Web Dashboard
2. Express Backend
3. PostgreSQL Database
4. Apache Kafka
5. Kafka Producer
6. Kafka Consumer
7. Alert and Incident Management Modules

---

## 2. High-Level Architecture

```text
                         ┌─────────────────────┐
                         │      Dashboard      │
                         │    React / Vite     │
                         └──────────┬──────────┘
                                    │
                              REST API / HTTP
                                    │
                                    ▼
                    ┌───────────────────────────┐
                    │      OpsPilot Backend     │
                    │   Node.js + Express + TS  │
                    │                           │
                    │ ┌───────────────────────┐ │
                    │ │ Authentication         │ │
                    │ │ Services               │ │
                    │ │ Metrics                │ │
                    │ │ Alerts                 │ │
                    │ │ Incidents              │ │
                    │ │ Logs                   │ │
                    │ │ Deployments             │ │
                    │ └───────────────────────┘ │
                    └───────────┬───────────────┘
                                │
                 ┌──────────────┴──────────────┐
                 │                             │
                 ▼                             ▼
       ┌──────────────────┐          ┌──────────────────┐
       │   PostgreSQL     │          │  Kafka Producer  │
       │                  │          │                  │
       │ Services         │          │ Metric Events    │
       │ Metrics          │          └────────┬─────────┘
       │ Alerts           │                   │
       │ Incidents        │                   ▼
       │ Logs             │          ┌──────────────────┐
       │ Deployments      │          │ Apache Kafka     │
       └──────────────────┘          │                  │
                                     │ metric-events    │
                                     └────────┬─────────┘
                                              │
                                              ▼
                                     ┌──────────────────┐
                                     │ Kafka Consumer    │
                                     │                  │
                                     │ Event Processing │
                                     └──────────────────┘

3. Component Description
3.1 Dashboard

The dashboard provides the user interface for viewing operational information.

Responsibilities include:

Displaying service information
Displaying metrics
Displaying alerts
Displaying incidents
Providing monitoring visualizations
Communicating with the backend through REST APIs

Technology:

React
Vite
3.2 Backend

The backend is the main application layer of OpsPilot.

Technology:

Node.js
Express
TypeScript

The backend provides REST APIs and coordinates communication between the dashboard, database, alert system, and Kafka.

3.3 Authentication Module

The authentication module manages user registration and login.

Authentication uses:

Password hashing
JWT tokens
Authorization middleware

Protected API requests require a valid JWT token.

3.4 PostgreSQL Database

PostgreSQL provides persistent storage for operational data.

The database stores information related to:

Users
Services
Metrics
Alerts
Incidents
Logs
Deployments
Runbooks
Incident events
3.5 Kafka Producer

The Kafka producer publishes metric events to Apache Kafka.

When a metric is created through the API, the backend can publish an event containing:

{
  "serviceId": "service-id",
  "metricName": "cpu_usage",
  "metricValue": 75,
  "timestamp": "2026-09-30T14:51:44.193Z"
}

The event is published to:

metric-events
3.6 Apache Kafka

Kafka acts as the event-streaming layer.

Current topic:

metric-events

The topic currently uses:

Partitions: 3
Replication factor: 1

Kafka allows metric events to be processed asynchronously instead of requiring all processing to happen directly inside the HTTP request.

3.7 Kafka Consumer

The Kafka consumer subscribes to:

metric-events

Consumer group:

opspilot-metric-consumer

Its responsibility is to receive metric events and process them inside the OpsPilot backend.

3.8 Alert System

The alert system evaluates metric information against configured alert rules.

Example:

CPU Usage > 90%
        │
        ▼
   Alert Triggered
        │
        ▼
   Incident Created

Alerts can have states such as:

Open
Resolved
3.9 Incident Management

Incidents represent operational problems requiring investigation or resolution.

An incident can contain:

Title
Description
Severity
Status
Service
Start time
Resolution time
Assigned user

Example severity:

SEV1
SEV2
SEV3
SEV4
4. Metric Processing Flow

The current metric processing flow is:

1. Client sends metric
        │
        ▼
2. POST /api/metrics
        │
        ▼
3. Backend validates request
        │
        ▼
4. Metric stored in PostgreSQL
        │
        ▼
5. Metric event published
        │
        ▼
6. Kafka receives event
        │
        ▼
7. Kafka consumer receives event
        │
        ▼
8. Event is processed
5. Failure Isolation

Kafka provides a separation between metric creation and event processing.

For example:

REST API
   │
   ▼
PostgreSQL
   │
   ▼
Kafka Producer
   │
   ▼
Kafka
   │
   ▼
Consumer

This allows event processing to operate independently from the HTTP request-processing layer.

6. Container Architecture

The current infrastructure uses Docker.

Main containers include:

┌─────────────────────────┐
│ opspilot-postgres       │
│ PostgreSQL 18           │
│ Host: 5433              │
└─────────────────────────┘

┌─────────────────────────┐
│ opspilot-kafka          │
│ Apache Kafka 4.1.1      │
│ Host: 9092              │
└─────────────────────────┘

The Node.js backend runs separately using the development server.

7. Architecture Summary

OpsPilot combines traditional REST-based application architecture with event-driven processing.

REST API
   +
PostgreSQL
   +
Apache Kafka
   +
Kafka Consumer
   +
React Dashboard

This architecture provides the foundation for building a centralized production reliability and incident management platform.


