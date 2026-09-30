# OpsPilot — Project Structure

## 1. Project Overview

OpsPilot is organized into separate frontend and backend applications.

```text
opspilot/
│
├── backend/
├── dashboard/
├── docs/
├── docker-compose.yml
└── terminal.txt
```

---

## 2. Backend Structure

The backend is built using Node.js, Express, and TypeScript.

```text
backend/
│
├── src/
│   ├── config/
│   │   └── env.ts
│   │
│   ├── database/
│   │   ├── database.ts
│   │   └── schema.sql
│   │
│   ├── kafka/
│   │   ├── producer.ts
│   │   └── consumer.ts
│   │
│   ├── middleware/
│   │   └── auth.middleware.ts
│   │
│   ├── modules/
│   │   ├── ai/
│   │   ├── alerts/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── deployments/
│   │   ├── incidents/
│   │   ├── logs/
│   │   ├── metrics/
│   │   ├── services/
│   │   └── users/
│   │
│   ├── utils/
│   │
│   └── server.ts
│
├── .env
├── package.json
├── package-lock.json
└── tsconfig.json
```

---

## 3. Backend Module Organization

Each major feature is organized into its own module.

For example, the metrics module contains:

```text
metrics/
├── metric.controller.ts
├── metric.routes.ts
├── metric.service.ts
└── metric.validation.ts
```

This separates:

* Request handling
* Routing
* Business logic
* Input validation

---

## 4. Kafka Structure

Kafka-related functionality is located inside:

```text
src/kafka/
```

The main files are:

```text
producer.ts
consumer.ts
```

### Producer

Responsible for publishing metric events to Kafka.

### Consumer

Responsible for consuming events from the Kafka topic and processing them.

---

## 5. Dashboard Structure

The dashboard is a React application created using Vite.

```text
dashboard/
│
├── public/
│
├── src/
│   ├── assets/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

The dashboard will provide the user interface for monitoring OpsPilot data.

---

## 6. Documentation Structure

Project documentation is maintained separately:

```text
docs/
├── 01-project-overview.md
├── 02-system-architecture.md
├── 03-system-design.md
├── 04-database-design.md
├── 05-kafka-architecture.md
├── 06-api-documentation.md
├── 07-project-structure.md
└── 08-development-status.md
```

---

## 7. Docker Infrastructure

Docker is used for infrastructure services.

Current services include:

```text
PostgreSQL
Kafka
```

The project uses:

```text
docker-compose.yml
```

to define and manage containerized infrastructure.

---

## 8. Separation of Responsibilities

The project follows this general separation:

```text
Dashboard
    │
    │ REST API
    ▼
Backend
    │
    ├── Authentication
    ├── Services
    ├── Metrics
    ├── Alerts
    ├── Incidents
    ├── Logs
    └── Deployments
    │
    ├──────────────► PostgreSQL
    │
    └──────────────► Kafka
```

This structure keeps the frontend, backend, database, event streaming, and documentation components separated.
