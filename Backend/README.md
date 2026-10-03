# HAAMI Backend — Occupational Health and Safety (OHS) Management System

**HAAMI** — Hazard Analysis & Awareness Management Integrated

> Backend API for a comprehensive enterprise-grade Occupational Health and Safety (OHS) management system, built to streamline hazard identification, risk assessment, compliance tracking, safety training, emergency preparedness, and incident investigation.

---

## Table of Contents

- [Project Description](#project-description)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [ERD](#erd)
- [Installation & Usage](#installation--usage)
- [Environment Configuration](#environment-configuration)
- [Database Migrations](#database-migrations)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [API Modules](#api-modules)
- [Authentication](#authentication)
- [Deployment](#deployment)
- [Contact](#contact)

---

## Project Description

HAAMI (Hazard Analysis & Awareness Management Integrated) is the backend API server for a full-stack OHS management platform designed for industrial and enterprise environments.

The system digitizes and centralizes all safety operations — from hazard reporting and risk assessment to incident investigation, compliance tracking, and employee safety induction. It supports multi-role access (Admin, Supervisor, User) with a supervisor-subordinate hierarchy, enabling structured approval workflows and real-time safety monitoring across departments.

**Core capabilities:**
- Systematic hazard identification and multi-level risk scoring
- Complete finding lifecycle — report → review → approve/reject → close
- Equipment registry with inspection scheduling and automated license expiry alerts
- Safety induction sessions with QR code-based attendance
- Emergency drill planning and documentation
- Incident investigation with root cause analysis and corrective action tracking
- Policy and document management with acknowledgment and signature tracking
- Real-time notification system with scheduled reminders
- Full audit trail on all system actions

---

## Features

| Feature | Description |
|---|---|
| **Authentication & Authorization** | JWT-based auth with role-based access control (Admin, Supervisor, User) |
| **User Management** | Employee profiles, role assignment, supervisor hierarchy, activate/deactivate |
| **Finding Management** | Safety finding reports with photo attachments, approval workflow, and deadline tracking |
| **Department Management** | Organizational structure with department codes |
| **Document Control** | Master document list with revision tracking and hierarchical tree view |
| **K3 Policy Management** | Policy documents with file upload and digital signature tracking |
| **Equipment Registry (Objek K3)** | Track safety equipment with inspection scheduling and license expiry |
| **Equipment Inspection History** | Inspection records with status monitoring and overdue alerts |
| **Emergency Drills** | Plan, schedule, execute, and document emergency response drills |
| **Safety Induction** | Manage induction sessions with QR code attendance scanning |
| **Incident Investigation** | Document incidents with root cause analysis, corrective actions, and sign-off |
| **Notifications** | Real-time in-app notifications for findings, approvals, and deadlines |
| **Automated Reminders** | Scheduled jobs for deadline reminders and license expiration alerts |
| **Audit Logging** | Complete change history with user action records |
| **File Uploads** | Multi-file upload support for findings, policies, investigations, and equipment |
| **Swagger API Docs** | Interactive API documentation at `/api/docs` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js (v18+) |
| **Framework** | NestJS |
| **Language** | TypeScript |
| **Database** | PostgreSQL (v14+) |
| **ORM** | Prisma |
| **Authentication** | JWT via `@nestjs/jwt` & Passport |
| **API Documentation** | Swagger / OpenAPI 3.0 |
| **File Storage** | Local filesystem (`public/uploads`) |
| **Job Scheduling** | `@nestjs/schedule` |
| **Validation** | `class-validator` / `class-transformer` |
| **Testing** | Jest |

---

## Screenshots

### Dashboard & Finding Management
![Dashboard](docs/screenshots/dashboard.png)

### Safety Induction & QR Attendance
![Induction](docs/screenshots/induction.png)

### Incident Investigation
![Investigation](docs/screenshots/investigation.png)

---

## ERD

Entity Relationship Diagram of the HAAMI database:

![ERD](docs/ERD.png)

Covers all core entities: User, Finding, Department, Document, K3Policy, ObjekK3, InspectionHistory, EmergencyDrill, Induction, Investigation, Notification, and AuditLog.

---

## Installation & Usage

### Prerequisites

- Node.js v18+
- PostgreSQL v14+
- npm

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd crack-be-naz-ahtamir
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory. See [Environment Configuration](#environment-configuration).

4. **Run database migrations**
   ```bash
   npx prisma migrate deploy
   ```

5. **Seed initial data**
   ```bash
   npm run seed

   npm run import:karyawan
   ```

6. **Start the development server**
   ```bash
   npm run start:dev
   ```

   Server runs at `http://localhost:3001`
   Swagger UI available at `http://localhost:3001/api/docs`

### Other Commands

```bash
npm run build
npm run start:prod

npm run start:debug

npm run test
npm run test:cov
npm run test:e2e

npm run generate:template
```

---

## Environment Configuration

Create a `.env` file in the root directory:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres123
DB_DATABASE=smk3_db

JWT_SECRET=<generate-a-secure-random-secret-min-64-chars>
JWT_EXPIRES_IN=30d

PORT=3001

DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/smk3_db"
```

| Variable | Description | Example |
|---|---|---|
| `DB_HOST` | PostgreSQL server hostname | `localhost` |
| `DB_PORT` | PostgreSQL server port | `5432` |
| `DB_USERNAME` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `postgres123` |
| `DB_DATABASE` | Database name | `smk3_db` |
| `JWT_SECRET` | Secret key for JWT signing | 64+ char random string |
| `JWT_EXPIRES_IN` | Token expiration | `30d`, `7d`, `1h` |
| `PORT` | App server port | `3001` |
| `DATABASE_URL` | Full Prisma connection string | `postgresql://user:pass@host:port/db` |

---

## Database Migrations

```bash
npx prisma migrate dev --name migration_name

npx prisma migrate deploy

npx prisma studio
```

---

## API Documentation

Swagger UI is available when the server is running:

**`http://localhost:3001/api/docs`**

All endpoints, request/response schemas, authentication, and example requests are documented there.

To test via Postman, import `SMK3_API_Postman_Collection.json` from the repository root.

---

## Project Structure

```
crack-be-naz-ahtamir/
├── src/
│   ├── auth/
│   │   ├── decorators/
│   │   ├── dto/
│   │   ├── guards/
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── jwt-auth.guard.ts
│   │   └── jwt.strategy.ts
│   ├── findings/
│   │   ├── dto/
│   │   ├── findings.controller.ts
│   │   ├── findings.module.ts
│   │   └── findings.service.ts
│   ├── notifications/
│   │   ├── dto/
│   │   ├── notifications.controller.ts
│   │   ├── notifications.module.ts
│   │   ├── notifications.service.ts
│   │   └── seed-notifications.controller.ts
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── scheduler/
│   │   ├── deadline-scheduler.controller.ts
│   │   ├── deadline-scheduler.module.ts
│   │   ├── deadline-scheduler.service.ts
│   │   ├── license-scheduler.controller.ts
│   │   ├── license-scheduler.module.ts
│   │   ├── license-scheduler.service.ts
│   │   ├── objek-k3-scheduler.controller.ts
│   │   ├── objek-k3-scheduler.module.ts
│   │   └── objek-k3-scheduler.service.ts
│   ├── modules/
│   │   ├── departments/
│   │   │   ├── dto/
│   │   │   ├── departments.controller.ts
│   │   │   ├── departments.module.ts
│   │   │   └── departments.service.ts
│   │   ├── documents/
│   │   │   ├── dto/
│   │   │   ├── documents.controller.ts
│   │   │   ├── documents.module.ts
│   │   │   └── documents.service.ts
│   │   ├── emergency-drill/
│   │   │   ├── dto/
│   │   │   ├── emergency-drill.controller.ts
│   │   │   ├── emergency-drill.module.ts
│   │   │   └── emergency-drill.service.ts
│   │   ├── induction/
│   │   │   ├── dto/
│   │   │   ├── induction.controller.ts
│   │   │   ├── induction.module.ts
│   │   │   └── induction.service.ts
│   │   ├── investigation/
│   │   │   ├── dto/
│   │   │   ├── investigation.controller.ts
│   │   │   ├── investigation.module.ts
│   │   │   └── investigation.service.ts
│   │   ├── k3-policy/
│   │   │   ├── dto/
│   │   │   ├── k3-policy.controller.ts
│   │   │   ├── k3-policy.module.ts
│   │   │   └── k3-policy.service.ts
│   │   └── objek-k3/
│   │       ├── dto/
│   │       ├── objek-k3.controller.ts
│   │       ├── objek-k3.module.ts
│   │       └── objek-k3.service.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── main.ts
│   ├── seed.ts
│   └── seed-departments.ts
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed-notifications.ts
├── scripts/
│   ├── check-db.js
│   ├── debug-notif.js
│   ├── generate-template.js
│   ├── import-karyawan.js
│   ├── import-users-from-excel.js
│   ├── karyawan-template.xlsx
│   ├── reset-passwords.js
│   ├── seed-admin.js
│   ├── seed-departments.js
│   └── seed-notifications.js
├── public/
│   └── uploads/
├── docs/
│   ├── screenshots/
│   │   ├── dashboard.png
│   │   ├── induction.png
│   │   └── investigation.png
│   ├── ERD.png
│   └── smoke_test.md
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── dist/
├── .env
├── .gitignore
├── .prettierrc
├── eslint.config.mjs
├── nest-cli.json
├── package.json
├── prisma.config.ts
├── SMK3_API_Postman_Collection.json
├── tsconfig.json
└── tsconfig.build.json
```

---

## API Modules

### Authentication — `/api/auth`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login, returns JWT token |
| GET | `/api/auth/users` | Get all users |
| GET | `/api/auth/users/:id` | Get user by UUID |
| GET | `/api/auth/users/by-id-karyawan/:id` | Get user by employee ID |
| PATCH | `/api/auth/users/:id` | Update user profile |
| PATCH | `/api/auth/users/:id/role` | Update user role |
| PATCH | `/api/auth/users/:id/supervisor` | Assign supervisor |
| PATCH | `/api/auth/users/:id/deactivate` | Deactivate user |
| PATCH | `/api/auth/users/:id/activate` | Activate user |
| POST | `/api/auth/me/change-password` | Change own password |

### Departments — `/api/departments`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/departments` | Get all departments |
| POST | `/api/departments` | Create department |
| GET | `/api/departments/:id` | Get department by ID |
| PUT | `/api/departments/:id` | Update department |
| DELETE | `/api/departments/:id` | Delete department |

### Findings — `/api/smk3-data`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/smk3-data` | Create finding |
| GET | `/api/smk3-data` | Get all findings (with filters) |
| GET | `/api/smk3-data/:id` | Get finding details |
| PUT | `/api/smk3-data/:id` | Update finding |
| PATCH | `/api/smk3-data/:id/status` | Approve or reject finding |
| DELETE | `/api/smk3-data/:id` | Soft delete finding |
| GET | `/api/smk3-data/deadline-reminders` | Get deadline reminders list |

### Notifications — `/api/notifications`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications` | Get user notifications |
| GET | `/api/notifications/unread-count` | Get unread count |
| PATCH | `/api/notifications/read-all` | Mark all as read |
| PATCH | `/api/notifications/:id/read` | Mark single as read |
| POST | `/api/notifications` | Create notification (admin) |

### Documents — `/api/documents`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/documents` | Get all documents |
| POST | `/api/documents` | Create document |
| GET | `/api/documents/tree` | Get hierarchical document tree |
| GET | `/api/documents/stats` | Get document statistics |
| GET | `/api/documents/:id` | Get document by ID |
| PUT | `/api/documents/:id` | Update document |
| DELETE | `/api/documents/:id` | Delete document |

### K3 Policy — `/api/k3-policy`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/k3-policy` | Get all policies |
| GET | `/api/k3-policy/:id` | Get policy by ID |
| POST | `/api/k3-policy/with-file` | Create policy with file upload |
| PUT | `/api/k3-policy/with-file/:id` | Update policy with file upload |
| DELETE | `/api/k3-policy/:id` | Delete policy |

### Equipment — `/api/objek-k3`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/objek-k3` | Get all equipment |
| POST | `/api/objek-k3` | Create equipment |
| GET | `/api/objek-k3/:id` | Get equipment by ID |
| PUT | `/api/objek-k3/:id` | Update equipment |
| DELETE | `/api/objek-k3/:id` | Delete equipment |
| GET | `/api/objek-k3/:id/riwayat` | Get inspection history |
| POST | `/api/objek-k3/:id/riwayat` | Add inspection record |

### Emergency Drill — `/api/emergency-drill`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/emergency-drill` | Get all drills |
| POST | `/api/emergency-drill` | Create drill |
| GET | `/api/emergency-drill/:id` | Get drill by ID |
| PUT | `/api/emergency-drill/:id` | Update drill |
| DELETE | `/api/emergency-drill/:id` | Delete drill |

### Safety Induction — `/api/induction`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/induction` | Get all sessions |
| POST | `/api/induction` | Create session |
| GET | `/api/induction/:id` | Get session by ID |
| PUT | `/api/induction/:id` | Update session |
| DELETE | `/api/induction/:id` | Delete session |
| POST | `/api/induction/:id/participants` | Add participant |
| GET | `/api/induction/:id/participants` | Get all participants |
| PATCH | `/api/induction/:id/participants/scan` | QR code attendance scan |
| POST | `/api/induction/:id/media` | Upload session media |
| GET | `/api/induction/:id/media` | Get session media |
| PATCH | `/api/induction/:id/close` | Close induction session |

### Investigation — `/api/investigations`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/investigations` | Get all investigations |
| POST | `/api/investigations` | Create investigation |
| GET | `/api/investigations/:id` | Get investigation by ID |
| PUT | `/api/investigations/:id` | Update investigation |
| PATCH | `/api/investigations/:id/status` | Update status |
| PATCH | `/api/investigations/:id/sign-approval` | Sign approval |
| GET | `/api/investigations/:id/logs` | Get investigation logs |

---

## Authentication

All endpoints except `/api/auth/login` require a JWT Bearer token:

```
Authorization: Bearer <your_jwt_token>
```

**Login flow:**
1. POST to `/api/auth/login` with employee ID and password
2. Response contains `access_token` and user data
3. Include the token in the `Authorization` header on all subsequent requests

Token validity defaults to 30 days, configurable via `JWT_EXPIRES_IN`.

---

## Deployment

| | Link |
|---|---|
| **Backend API** | https://haami-demo.onrender.com |
| **Frontend App** | https://crack-fe-naz-ahtamir.vercel.app |
| **API Docs (Swagger)** | https://haami-demo.onrender.com/api/docs |

### Production Checklist

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET` (minimum 64 random characters)
3. Run migrations: `npx prisma migrate deploy`
4. Build: `npm run build`
5. Start: `npm run start:prod`

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["node", "dist/main"]
```

---

## Contact

- **Project Maintainer:** [Naz Ahtamir](https://github.com/naz-ahtamir)
- **Repository:** [[Project Repository URL](https://github.com/naz-ahtamir/crack-be-naz-ahtamir)]

---

## License

This project is proprietary and confidential. Unauthorized distribution or reproduction is prohibited.
