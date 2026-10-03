# HAAMI — Hazard Analysis & Awareness Management Integrated

HAAMI is a web-based Occupational Health and Safety (OHS) management platform designed to help organizations manage SMK3 compliance, hazard identification, findings reporting, and safety performance monitoring in an integrated manner. Built with modern web technologies, HAAMI provides an end-to-end solution to meet **SMK3 (Occupational Health and Safety Management System)** requirements based on PP No. 50 of 2012.

---

## Links

| | URL |
|---|---|
| **Frontend (Production)** | https://crack-fe-naz-ahtamir.vercel.app |
| **Backend API** | https://haami-demo.onrender.com |
| **API Docs (Swagger)** | https://haami-demo.onrender.com/api/docs |
| **Backend Repository** | https://github.com/naz-ahtamir/crack-be-naz-ahtamir |

---

## Key Features

### SMK3 Management
- **12 SMK3 Elements**: Complete implementation of 12 SMK3 elements according to PP 50/2012, covering commitment, OHS planning, document control, work safety, training, monitoring, and reporting.
- **Findings CRUD**: Recording, management, and tracking of non-conformity findings with approval workflow (INPG → CLSD).
- **SMK3 Dashboard**: Summary of safety KPI metrics and recent findings on a single page.

### Safety Compliance
- **OHS Policy**: Upload and management of OHS policy documents with file attachment.
- **Legal Compliance**: Monitoring of OHS regulations and legislative compliance.
- **OHS Planning & Organization**: Management of OHS plans and organizational structure.
- **Worker Consultation**: Documentation of worker consultations.
- **Procurement & Contractor Control**: Control of procurement and contractors.
- **Documentation Records**: Management of OHS records and documentation.

### Safety Competency
- **Safety Induction**: Management of safety induction sessions with QR code attendance scanning and induction card generation.
- **Training Management**: Planning and implementation of OHS training.
- **Training Needs Analysis**: Training needs analysis based on risk assessment.
- **License & Certification**: Monitoring of employee OHS certifications and licenses with expiry alerts.
- **Safety Briefing & Culture**: Safety culture programs and safety briefings.
- **Competency Management**: OHS competency management per position.

### Accident Prevention
- **Hazard Identification**: Hazard identification with risk level categorization (Low / Medium / High / Critical).
- **Risk Control**: Risk control based on hierarchy of controls.
- **Incident & Near Miss Reporting**: Full incident investigation lifecycle with root cause analysis, corrective actions, and multi-party digital signatures.
- **Safety Inspection**: Schedule and implementation of safety inspections.
- **Work Permit System**: Digital work permit system for high-risk work.
- **PPE Management**: Personal Protective Equipment management.
- **LOTO (Lockout/Tagout)**: LOTO procedures for hazardous energy work.
- **Chemical Safety**: Management of hazardous chemicals (B3).
- **Equipment Safety (Objek K3)**: Equipment registry with inspection scheduling, riksa uji tracking, and license expiry monitoring.
- **Emergency Preparedness**: Emergency drill planning, scheduling, and documentation.
- **Workplace Monitoring**: Workplace environment monitoring.
- **Safety Observation**: Safety observation programs.

### System Features
- **Authentication & RBAC**: Login, forgot/reset/change password, and role-based access control (Admin, Supervisor, User).
- **Notification System**: Real-time in-app notifications with automatic polling for approvals, findings updates, deadline reminders, and license expiry alerts.
- **Data Export**: Export findings to **Excel (.xlsx)**, **PDF** (with digital signature), and **HTML** formats.
- **Admin Panel**: User management — create, edit, activate/deactivate users, assign supervisor hierarchy.
- **Advanced Filters**: Multi-criteria filtering on findings and equipment (status, category, company, search keyword).
- **Digital Signature**: Digital signature capture on finding forms and job desk acceptance documents.

---

## Tech Stack

### Frontend
| Technology | Version | Usage |
|-----------|---------|-------|
| Next.js | 16.2.6 | React framework with App Router & SSR |
| React | 19.2.4 | UI library |
| TypeScript | ^5 | Type-safe development |
| Tailwind CSS | ^4 | Utility-first CSS framework |
| NextAuth.js | ^4.24.14 | Session management (delegated to NestJS JWT) |
| React Hook Form | ^7.82.0 | Form state management & validation |
| Zod | ^4.4.3 | Schema validation |
| react-hot-toast | ^2.6.0 | Toast notifications |
| jsPDF + autoTable | ^4.2.1 | Generate PDF reports |
| xlsx | ^0.18.5 | Export data to Excel (.xlsx) |
| html2canvas | ^1.4.1 | Render HTML to canvas for PDF export |
| react-signature-canvas | ^1.1.0-alpha.2 | Digital signature input |
| Bun | latest | JavaScript runtime & package manager |

### Backend (Separate Repository)
| Technology | Usage |
|-----------|-------|
| NestJS 11 | Backend framework with modular architecture |
| PostgreSQL (Supabase) | Primary relational database — hosted on Supabase (AWS ap-northeast-1) |
| Prisma ORM | Database access layer with type-safe queries |
| JWT (`@nestjs/jwt`) | Stateless token-based authentication |
| Passport.js | Authentication middleware |
| Multer + memoryStorage | File upload handling (buffers to cloud) |
| Supabase Storage | Cloud file storage for all uploaded files (photos, PDFs, documents) |
| `@nestjs/schedule` | Scheduled jobs for deadline & license expiry reminders |
| Swagger / OpenAPI | Interactive API documentation at `/api/docs` |

> **Architecture**: The frontend is a **Next.js** app deployed on Vercel. All API calls go to a separate **NestJS** backend deployed on Render. The frontend's `src/app/api/` routes act only as a thin proxy to the NestJS backend — all data and authentication are managed by the NestJS server.

### DevOps & Tools
| Technology | Usage |
|-----------|-------|
| Vercel | Frontend deployment |
| Render | Backend deployment |
| Supabase | PostgreSQL database + file storage |
| Docker Compose | Container orchestration for local development |

---

## Project Structure

```
crack-fe-naz-ahtamir/
├── public/
│   ├── uploads/          # Legacy local uploads (now served from Supabase Storage)
│   ├── videos/           # Video assets
│   └── fonts/            # Custom fonts
├── scripts/              # Utility scripts
│   ├── createAdmin.ts    # Seed first admin user
│   └── importKaryawan.ts # Import employee data from Excel
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── page.tsx                    # Public landing page
│   │   ├── login/                      # Login page
│   │   ├── forgot-password/            # Forgot password flow
│   │   ├── reset-password/             # Redirect alias to change-password
│   │   ├── change-password/            # Change & reset password (dual mode)
│   │   ├── contact/                    # Contact / safety complaint page
│   │   ├── admin/                      # Admin panel (user management)
│   │   ├── (authenticated)/            # Route group — requires login
│   │   │   ├── dashboard/              # Safety KPI dashboard
│   │   │   ├── findings/               # Finding detail & approval
│   │   │   ├── notifications/          # Notification center
│   │   │   └── profile/                # User profile
│   │   ├── smk3/                       # 12 SMK3 Elements
│   │   ├── safety-compliance/          # OHS compliance module
│   │   ├── safety-competency/          # OHS competency module
│   │   │   ├── safety-induction/       # Induction session management
│   │   │   └── license-certification/  # License & certification tracking
│   │   ├── accident-prevention/        # Accident prevention module
│   │   │   ├── equipment-safety/       # Objek K3 registry
│   │   │   ├── incident-near-miss/     # Incident investigation
│   │   │   └── emergency-preparedness/ # Emergency drill management
│   │   └── api/                        # Next.js API Routes (proxy to NestJS)
│   │       ├── auth/                   # Auth proxy (login, change/reset password)
│   │       ├── users/                  # User management proxy
│   │       └── notifications/          # Notification proxy
│   ├── components/                     # Reusable React components
│   │   ├── ui/                         # Button, Card, Spinner, Modal, etc.
│   │   ├── layout/                     # TopHeader, Sidebar, PublicLayout
│   │   ├── dashboard/                  # RecentFindings, UserProfileCard
│   │   ├── findings/                   # FindingForm
│   │   ├── CrudPage.tsx                # Generic CRUD table with export modal
│   │   └── RecordFormModal.tsx         # Generic form modal
│   ├── contexts/                       # React Context providers
│   │   ├── AuthContext.tsx             # Global auth state (JWT from NestJS)
│   │   └── NotificationContext.tsx     # Global notification polling
│   ├── lib/                            # Utilities & API clients
│   │   ├── api.ts                      # Main API client (all NestJS endpoints)
│   │   ├── objekK3Api.ts               # Equipment (Objek K3) API client
│   │   ├── inductionApi.ts             # Safety induction API client
│   │   ├── exportFindingToPDF.ts       # Single finding PDF export
│   │   ├── exportFindingsToExcel.ts    # Batch findings Excel export
│   │   └── proxy.ts                    # URL proxy utilities
│   ├── data/                           # Static config (form configs, job descriptions)
│   ├── types/                          # TypeScript type definitions
│   └── models/                         # Legacy Mongoose models (unused, to be removed)
├── .env.local                          # Environment variables (not committed)
├── next.config.ts                      # Next.js configuration & API rewrites
├── package.json
└── tsconfig.json
```

---

## Installation & Usage

### Prerequisites

- **Node.js** 18.17 or newer
- **Bun** (recommended) or npm/yarn
- A running **HAAMI backend** instance (see backend repository)

### Installation Steps

**1. Clone repository**
```bash
git clone <repo-url>
cd crack-fe-naz-ahtamir
```

**2. Install dependencies**
```bash
bun install
# or
npm install
```

**3. Configure environment**

Create a `.env.local` file in the project root:

```env
# Backend API URL (NestJS)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

# NextAuth (session management)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>

# Backend base URL (used by Next.js API proxy routes)
BACKEND_API_URL=http://localhost:3001/api
```

**4. Run development server**
```bash
bun run dev
```

The application will run at **http://localhost:3000**

> Make sure the NestJS backend is also running on `http://localhost:3001` before starting the frontend.

---

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Development | `bun run dev` | Run dev server with hot reload |
| Build | `bun run build` | Build for production |
| Start | `bun run start` | Run production server |
| Lint | `bun run lint` | Run ESLint |
| Create Admin | `bun run create-admin` | Seed first admin account via NestJS |
| Import Employees | `bun run import-karyawan` | Import employee data from Excel |

---

### Default Login

Login uses **ID Karyawan** (employee ID), not email.

| Role | Credential | Access |
|------|-----------|--------|
| Admin | ID: `82400944` / Password: `82400944K3` | Full — user management, all modules |
| Supervisor | Assigned by admin | Finding approvals, view all data |
| User | Assigned by admin | Create & view own findings |

> Default password format: `{idKaryawan}K3` — users should change it after first login via **Change Password** page.

---

## ERD (Entity Relationship Diagram)

The database is **PostgreSQL**, managed via **Prisma ORM**, and hosted on **Supabase**.

### Core Entities & Relationships

| Relation | Description |
|---------|-------------|
| `User` → `Finding` (creates) | One user can create many findings |
| `User` → `Finding` (approves) | One supervisor/admin can approve many findings |
| `Finding` → `FindingFile` | One finding can have multiple attached files |
| `User` → `Notification` | One user receives many notifications |
| `Finding` → `Notification` | One finding triggers multiple notifications |
| `User` → `AuditLog` | Every user action recorded in audit logs |
| `Department` → `Document` | Documents belong to departments |
| `Department` → `ObjekK3` | Equipment registered per department |
| `ObjekK3` → `RiwayatPemeriksaan` | Equipment has an inspection history |
| `InductionSession` → `InductionParticipant` | Sessions have multiple participants |
| `InductionSession` → `InductionMedia` | Sessions have multiple media attachments |
| `User` → `User` (supervisor hierarchy) | Self-referencing supervisor-subordinate relation |

### Finding Status Flow

```
INPG (In Progress) ──→ CLSD (Closed)
   ↑
Created by user,
pending supervisor approval
```

---

## Screenshots

### Landing Page
![Landing Page](public/screenshots/landing-page.png)
> HAAMI public page with product information, features, and login CTA.

### Safety KPI Dashboard
![Dashboard](public/screenshots/dashboard.png)
> Dashboard showing finding statistics (INPG/CLSD), 5-year safety performance trends, and recent findings.

### Findings Management
![Findings List](public/screenshots/findings-list.png)
> List of all findings with status filters, categories, and export to Excel/PDF features.

### Admin Panel
![Admin Panel](public/screenshots/admin-panel.png)
> User management — create users, activate/deactivate, assign roles and supervisor hierarchy.

### Notifications
![Notifications](public/screenshots/notifications.png)
> Notification center for finding approvals, deadline reminders, and license expiry alerts.

---

## Security Features

- **JWT Authentication** via NestJS — token stored in `localStorage`, forwarded as `Authorization: Bearer` header
- **Role-Based Access Control (RBAC)** — Admin, Supervisor, User with enforced backend guards
- **Password Hashing** — bcrypt with 10 salt rounds
- **Forgot/Reset Password** — Token-based reset flow (1-hour expiry)
- **Change Password** — Requires current password verification
- **Soft Delete** — Findings not permanently deleted (`deletedAt` field)
- **Audit Logging** — Every data change recorded with user ID and timestamp
- **Input Validation** — Zod schema validation on all forms + `class-validator` on all API endpoints

---

## Deployment

### Frontend — Vercel

1. Push code to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://haami-demo.onrender.com/api
   NEXT_PUBLIC_FRONTEND_URL=https://crack-fe-naz-ahtamir.vercel.app
   NEXTAUTH_URL=https://crack-fe-naz-ahtamir.vercel.app
   NEXTAUTH_SECRET=<your-secret>
   BACKEND_API_URL=https://haami-demo.onrender.com/api
   ```
4. Deploy automatically on every push to `main`

### Backend — See backend repository

The backend (NestJS + PostgreSQL + Supabase Storage) is documented separately in the [HAAMI Backend Repository](https://github.com/naz-ahtamir/crack-be-naz-ahtamir).

---

## Contribution

1. Fork this repository
2. Create new branch: `git checkout -b feature/feature-name`
3. Commit changes: `git commit -m 'feat: add feature X'`
4. Push branch: `git push origin feature/feature-name`
5. Create Pull Request

### Commit Conventions
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation changes
- `style:` — Formatting (no logic changes)
- `refactor:` — Code refactoring
- `chore:` — Maintenance (update deps, config, etc.)

---

## License

This project is proprietary and confidential. Unauthorized distribution or reproduction is prohibited.
