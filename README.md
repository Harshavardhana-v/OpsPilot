# 🚨 OpsPilot

### AI-Powered Production Incident & Reliability Platform

OpsPilot is an internal incident management and reliability platform designed to help engineering and SRE teams **detect, investigate, track, and resolve production incidents** from a centralized dashboard.

The platform provides a structured incident lifecycle, service management, authentication, incident assignment, status tracking, and real-time dashboard updates.

---

## 📌 Problem Statement

Production incidents are often handled across multiple disconnected tools such as:

- Monitoring systems
- Chat applications
- Issue trackers
- Logs
- Spreadsheets
- Documentation

This makes it difficult for engineering teams to maintain a **single source of truth** during an incident.

OpsPilot aims to provide a centralized platform where teams can:

- Create and manage incidents
- Track incident severity and status
- Assign incidents to engineers
- Associate incidents with services
- Record incident events
- Monitor incident progress
- Access incident details from a unified dashboard

---

# 🎯 Objectives

The main objectives of OpsPilot are:

1. Centralize production incident management.
2. Provide a structured incident lifecycle.
3. Enable engineers to investigate and resolve incidents efficiently.
4. Track services and their operational health.
5. Maintain incident history and event information.
6. Provide authentication and role-based access foundations.
7. Provide a real-time dashboard for incident monitoring.
8. Build a foundation for future AI-assisted incident analysis.

---

# ✨ Features

## 🔐 Authentication

OpsPilot provides authentication using:

- User registration
- User login
- Password authentication
- JWT-based authentication
- Protected API routes

Authentication ensures that only authorized users can access protected incident-management operations.

---

## 🚨 Incident Management

Users can create and manage production incidents.

Each incident can contain:

- Incident title
- Description
- Severity
- Status
- Associated service
- Creator
- Assigned engineer
- Start time
- Resolution time
- Creation timestamp
- Last updated timestamp

---

## 🔄 Incident Lifecycle

OpsPilot follows a structured incident workflow:

```text
OPEN
  ↓
INVESTIGATING
  ↓
IDENTIFIED
  ↓
MONITORING
  ↓
RESOLVED
```

### Status meanings

| Status | Description |
|---|---|
| `open` | Incident has been created and requires investigation |
| `investigating` | Engineers are actively investigating the issue |
| `identified` | The underlying cause or issue has been identified |
| `monitoring` | A fix has been applied and the system is being monitored |
| `resolved` | The incident has been resolved |

This workflow helps teams understand the current state of every incident.

---

# ⚠️ Incident Severity

Incidents support different severity levels.

Example:

```text
SEV1
SEV2
SEV3
SEV4
```

Severity can be used to communicate the potential impact and urgency of an incident.

---

# 🖥️ Incident Dashboard

The React dashboard provides a centralized view of incidents.

The dashboard displays:

- Incident count
- Incident title
- Incident description
- Service
- Incident creator
- Severity
- Current status
- Creation time
- Status transition actions

The dashboard periodically refreshes incident data so that updates appear without manually refreshing the browser.

---

# 👤 Incident Assignment

Incidents can be associated with:

- A service
- The user who created the incident
- An engineer responsible for handling the incident

This allows teams to clearly identify ownership during an incident.

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │      User / SRE     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Dashboard   │
                    │      (Vite)         │
                    └──────────┬──────────┘
                               │
                         REST API / HTTP
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Node.js Backend   │
                    │     Express.js      │
                    │      TypeScript     │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
             ┌──────────────┐      ┌──────────────┐
             │ JWT Auth     │      │ REST APIs    │
             │ Middleware   │      │ Incident API │
             └──────────────┘      └──────┬───────┘
                                           │
                                           ▼
                                  ┌─────────────────┐
                                  │   PostgreSQL    │
                                  │    Database     │
                                  └─────────────────┘
```

---

# 🛠️ Tech Stack

## Frontend

- React
- Vite
- JavaScript / JSX
- React Router
- Axios
- CSS

## Backend

- Node.js
- Express.js
- TypeScript
- REST APIs
- JWT Authentication

## Database

- PostgreSQL

## Infrastructure

- Docker
- Docker Compose

## Development Tools

- Git
- GitHub
- VS Code
- PowerShell
- Postman

---

# 📁 Project Structure

```text
opspilot/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── validation/
│   │   ├── database.ts
│   │   └── ...
│   │
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── .env
│   └── .gitignore
│
├── dashboard/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   └── ...
│   │
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── .gitignore
│
├── docs/
│
├── docker-compose.yml
│
├── .gitignore
│
└── README.md
```

---

# 🗄️ Database Design

OpsPilot uses PostgreSQL as the primary relational database.

The database is organized around the following entities:

```text
Users
  │
  ├──────────────┐
  │              │
  ▼              ▼
Services      Incidents
                 │
                 ▼
          Incident Events

Services
   │
   ├── Logs
   │
   └── Metrics

Runbooks
```

---

## 👤 Users

Stores users who interact with OpsPilot.

Example fields:

```text
id
name
email
password_hash
created_at
```

---

## 🖥️ Services

Represents applications or production services monitored by the platform.

Example fields:

```text
id
name
description
owner_id
environment
status
```

Example environments:

```text
production
staging
development
```

Example service status:

```text
healthy
degraded
down
```

---

## 🚨 Incidents

The central entity of the platform.

Example fields:

```text
id
service_id
title
description
severity
status
started_at
resolved_at
created_by
assigned_to
created_at
updated_at
```

Relationships:

```text
Service
   │
   └──────< Incident
                │
                ├── created_by → User
                │
                └── assigned_to → User
```

---

## 📝 Incident Events

Incident events can be used to maintain a timeline of actions performed during an incident.

Examples:

```text
Incident created
Engineer assigned
Investigation started
Root cause identified
Fix deployed
Monitoring started
Incident resolved
```

This provides an audit-style timeline for incident investigation.

---

## 📊 Logs

The logs entity provides a foundation for storing application or service logs associated with production systems.

---

## 📈 Metrics

Metrics provide a foundation for storing operational measurements associated with services.

Examples include:

```text
CPU usage
Memory usage
Request rate
Error rate
Latency
```

---

## 📖 Runbooks

Runbooks provide operational instructions that engineers can follow during incidents.

Example:

```text
Service experiencing high CPU
        ↓
Check CPU metrics
        ↓
Inspect recent deployments
        ↓
Check application logs
        ↓
Restart / rollback if required
        ↓
Monitor service
```

---

# 🔐 Authentication Flow

OpsPilot uses JWT-based authentication.

The authentication flow is:

```text
User
 │
 │ Register / Login
 ▼
Backend
 │
 │ Validate credentials
 ▼
JWT Token
 │
 ▼
Frontend
 │
 │ Authorization: Bearer <token>
 ▼
Protected API
 │
 ▼
JWT Middleware
 │
 ▼
Authorized Request
```

Protected requests use:

```http
Authorization: Bearer <JWT_TOKEN>
```

---

# 🔌 API

The backend exposes REST APIs for interacting with the platform.

## Health Check

```http
GET /api/health
```

Example response:

```json
{
  "status": "healthy"
}
```

---

## Database Health

```http
GET /api/health/db
```

Used to verify backend-to-database connectivity.

---

# 🔑 Authentication APIs

## Register

```http
POST /api/auth/register
```

Example request:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password"
}
```

---

## Login

```http
POST /api/auth/login
```

Example:

```json
{
  "email": "john@example.com",
  "password": "password"
}
```

The API returns an authentication token that can be used for protected endpoints.

---

# 🚨 Incident APIs

## Get Incidents

```http
GET /api/incidents
```

Returns the incidents available to the authenticated user.

---

## Create Incident

```http
POST /api/incidents
```

Example:

```json
{
  "title": "Payment API Failure",
  "description": "Payment requests are returning HTTP 500 errors.",
  "severity": "SEV2",
  "service_id": "SERVICE_ID"
}
```

---

## Update Incident Status

```http
PATCH /api/incidents/:incidentId/status
```

Example:

```json
{
  "status": "investigating"
}
```

Supported workflow:

```text
open
 ↓
investigating
 ↓
identified
 ↓
monitoring
 ↓
resolved
```

---

# ⚙️ Environment Configuration

Backend environment variables are stored in `.env`.

Example:

```env
PORT=5000

DATABASE_URL=postgresql://username:password@localhost:5433/opspilot

JWT_SECRET=your_secret_key
```

> Never commit `.env` files or secrets to GitHub.

---

# 🐳 Running PostgreSQL with Docker

OpsPilot uses Docker for local PostgreSQL development.

Start the services:

```bash
docker compose up -d
```

Check running containers:

```bash
docker ps
```

Stop the services:

```bash
docker compose down
```

---

# 🚀 Running the Backend

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

---

# 🖥️ Running the Dashboard

Open another terminal:

```bash
cd dashboard
```

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The dashboard is typically available at:

```text
http://localhost:5173
```

---

# 🔄 Development Workflow

A typical development workflow is:

```text
1. Start PostgreSQL
        ↓
2. Start Backend
        ↓
3. Start React Dashboard
        ↓
4. Login / Register
        ↓
5. Create Incident
        ↓
6. Investigate Incident
        ↓
7. Update Status
        ↓
8. Monitor
        ↓
9. Resolve Incident
```

---

# 🔍 Incident Management Workflow

Example production incident:

### 1. Incident Detection

A production service experiences a high error rate.

```text
Payment API
Status: Degraded
```

### 2. Incident Creation

An engineer creates:

```text
Title:
Payment API Failure

Severity:
SEV2

Status:
Open
```

### 3. Investigation

The incident transitions to:

```text
Investigating
```

Engineers investigate logs, metrics, deployments, and service health.

### 4. Identification

The root cause is identified.

```text
Status:
Identified
```

### 5. Monitoring

A fix is deployed.

```text
Status:
Monitoring
```

The team monitors the service to ensure the problem does not return.

### 6. Resolution

Once the service is stable:

```text
Status:
Resolved
```

---

# 🧪 Testing

Backend APIs can be tested using:

- Postman
- PowerShell `Invoke-RestMethod`
- Browser/API clients

Example:

```powershell
$response = Invoke-RestMethod `
  -Uri "http://localhost:5000/api/incidents" `
  -Headers $headers `
  -Method GET

$response.incidents
```

---

# 🔒 Security Considerations

OpsPilot follows several security practices:

- JWT-based authentication
- Password hashing
- Protected API routes
- Environment variables for secrets
- `.gitignore` for local development files
- Input validation
- Authorization headers for protected endpoints

Sensitive files such as:

```text
.env
terminal.txt
backendissues.txt
dashboardissues.txt
```

are excluded from version control.

---

# 📊 Current Implementation

The current version of OpsPilot provides the core incident-management foundation:

- [x] PostgreSQL database
- [x] Docker-based database setup
- [x] Node.js backend
- [x] Express REST APIs
- [x] TypeScript backend
- [x] User registration
- [x] JWT authentication
- [x] Protected routes
- [x] Incident creation
- [x] Incident listing
- [x] Incident status workflow
- [x] Incident assignment foundation
- [x] Service management foundation
- [x] React dashboard
- [x] Incident dashboard
- [x] Automatic dashboard refresh
- [x] Incident detail navigation
- [x] Git/GitHub version control

---

# 🔮 Future Roadmap

OpsPilot is designed to evolve into a more comprehensive reliability platform.

Potential future features include:

## 🤖 AI-Assisted Incident Analysis

Future versions can use AI to assist engineers with:

- Incident summarization
- Log analysis
- Root-cause analysis
- Suggested remediation steps
- Similar incident detection
- Incident severity recommendations
- Automated incident summaries

---

## 📊 Observability Integration

Future integrations can include:

```text
Logs
  +
Metrics
  +
Traces
  +
Incidents
```

This would allow engineers to investigate incidents from a single platform.

---

## 🔔 Alerting

Potential integrations:

- Email
- Slack
- Webhooks
- Monitoring alerts

Example:

```text
Monitoring System
       ↓
High Error Rate
       ↓
OpsPilot
       ↓
Incident Created
       ↓
Engineer Notification
```

---

## 📖 Automated Runbooks

OpsPilot can eventually recommend relevant runbooks based on:

```text
Incident
   ↓
Service
   ↓
Error / Symptoms
   ↓
Relevant Runbook
   ↓
Recommended Actions
```

---

## 📈 Reliability Metrics

Future dashboards can provide:

- Mean Time to Detect (MTTD)
- Mean Time to Acknowledge (MTTA)
- Mean Time to Resolve (MTTR)
- Incident frequency
- Incident severity distribution
- Service reliability
- Recurring incident analysis

---

# 📐 High-Level Future Architecture

```text
                         ┌────────────────────┐
                         │ Monitoring Systems  │
                         └─────────┬──────────┘
                                   │
                                   ▼
                         ┌────────────────────┐
                         │      OpsPilot      │
                         │   Incident Engine  │
                         └─────────┬──────────┘
                                   │
                ┌──────────────────┼──────────────────┐
                │                  │                  │
                ▼                  ▼                  ▼
          ┌──────────┐       ┌──────────┐       ┌──────────┐
          │  Logs    │       │ Metrics  │       │ Traces   │
          └──────────┘       └──────────┘       └──────────┘
                │                  │                  │
                └──────────────────┼──────────────────┘
                                   ▼
                         ┌────────────────────┐
                         │   AI Analysis      │
                         │                    │
                         │ Root Cause         │
                         │ Summarization      │
                         │ Recommendations    │
                         └─────────┬──────────┘
                                   │
                                   ▼
                         ┌────────────────────┐
                         │ Incident Dashboard │
                         └────────────────────┘
```

---

# 🧑‍💻 Development Principles

OpsPilot follows these development principles:

### Modular Architecture

Frontend, backend, database, and infrastructure are separated into independent components.

### API-First Design

The dashboard communicates with the backend through REST APIs.

### Secure Development

Secrets and local development artifacts are excluded from version control.

### Extensibility

The architecture is designed to support future observability and AI capabilities.

### Maintainability

The codebase uses structured routes, middleware, validation, and reusable frontend components.

---

# 🌿 Git Workflow

Recommended Git workflow:

```bash
git status
```

Review changes:

```bash
git diff
```

Stage changes:

```bash
git add .
```

Commit using Conventional Commits:

```bash
git commit -m "feat: add incident status workflow"
```

Push:

```bash
git push origin main
```

Recommended commit prefixes:

```text
feat:     New functionality
fix:      Bug fix
docs:     Documentation
refactor: Code restructuring
test:     Tests
chore:    Maintenance
```

Example:

```bash
git commit -m "feat: implement incident status transitions"
```

---

# 📄 License

This project is currently developed as a personal/academic engineering project.

License information can be added when the project is released under a specific open-source license.

---

# 👨‍💻 Author

**Harshavardhana V**

Computer Science Engineering Student

GitHub:

`https://github.com/Harshavardhana-v`

---

# ⭐ Project Vision

OpsPilot aims to evolve from a basic incident-management application into a complete **production reliability platform** that combines:

```text
Incident Management
        +
Observability
        +
Automation
        +
AI-Assisted Investigation
        +
Reliability Analytics
```

The long-term goal is to help engineering teams reduce the time required to **detect, understand, investigate, and resolve production incidents**.