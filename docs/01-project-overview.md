# OpsPilot — Project Overview

## 1. Introduction

OpsPilot is an AI-ready production incident and reliability platform designed to help engineering and SRE teams monitor services, collect metrics, detect abnormal conditions, generate alerts, and manage production incidents from a centralized platform.

The system combines a REST-based backend, PostgreSQL database, Apache Kafka event streaming, and a web dashboard.

---

## 2. Problem Statement

Production systems generate large amounts of operational data such as metrics, logs, deployments, and alerts.

Without a centralized platform, engineers may need to inspect multiple systems to identify problems and understand their impact.

OpsPilot aims to provide a centralized workflow for:

- Service monitoring
- Metric collection
- Alert generation
- Incident management
- Operational event streaming
- Real-time monitoring through a dashboard

---

## 3. Objectives

The main objectives of OpsPilot are:

1. Collect and store service metrics.
2. Stream metric events using Apache Kafka.
3. Evaluate metrics against alert rules.
4. Generate and manage alerts.
5. Create and track production incidents.
6. Store operational information in PostgreSQL.
7. Provide REST APIs for platform operations.
8. Provide a centralized monitoring dashboard.
9. Create a foundation for future AI-assisted incident analysis.

---

## 4. Core Features

### Service Management

The platform maintains information about monitored services, including their names, environments, owners, and health status.

### Metric Management

Metrics such as CPU usage can be submitted through the backend API and stored in PostgreSQL.

### Alert Management

Metric values can be evaluated against configured alert rules. When a threshold is reached, an alert can be generated.

### Incident Management

Alerts can be associated with incidents. Incidents contain information such as:

- Title
- Severity
- Status
- Start time
- Resolution time
- Assignment information

### Kafka Event Streaming

Metric events are published to the Kafka topic:

`metric-events`

The backend contains both a Kafka producer and consumer for processing metric events.

### Monitoring Dashboard

A web dashboard will provide a centralized interface for monitoring operational information and system activity.

---

## 5. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React / Vite |
| Backend | Node.js / Express / TypeScript |
| Database | PostgreSQL |
| Event Streaming | Apache Kafka |
| Kafka Client | KafkaJS |
| Authentication | JWT |
| Validation | Zod |
| Containerization | Docker |
| API Testing | PowerShell / REST API |
| Version Control | Git / GitHub |

---

## 6. High-Level Data Flow

The current metric flow is:

Client
→ Backend REST API
→ PostgreSQL
→ Kafka Producer
→ Kafka `metric-events` topic
→ Kafka Consumer
→ Metric/Event Processing

The dashboard will consume backend data through REST APIs to display operational information.

---

## 7. Current Project Status

The following components have been implemented:

- PostgreSQL database
- Express backend
- Authentication
- JWT-based authorization
- Service management
- Incident management
- Log management
- Metric management
- Alert management
- Deployment module
- Kafka broker
- Kafka `metric-events` topic
- Kafka producer
- Kafka consumer
- Metric event publishing
- Metric event consumption
- Docker-based infrastructure

The monitoring dashboard is currently being developed.

---

## 8. Future Extensions

Possible future extensions include:

- Real-time dashboard updates
- Incident timeline visualization
- Advanced alert correlation
- Log and metric correlation
- AI-assisted root-cause analysis
- Automated incident recommendations
- Runbook recommendations
- Reliability and service health analytics
- Deployment-impact analysis