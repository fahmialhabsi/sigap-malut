# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SIGAP Malut — Sistem Informasi Terintegrasi Dinas Pangan Provinsi Maluku Utara. A full-stack government information system with role-based dashboards, workflow approvals, audit logging, and AI integration.

## Commands

### Backend (run from `backend/`)
```bash
npm run dev          # Start with nodemon (port 5000)
npm start            # Production start
npm test             # Run all tests (Mocha)
npm run migrate      # Run database migrations
npm run seed         # Seed initial data
npm run generate:all # Regenerate controllers, models, routes from master data
```

### Frontend (run from `frontend/`)
```bash
npm run dev          # Vite dev server (port 5173)
npm run build        # Production build
npm test             # Run Jest tests
npm run lint         # ESLint
```

### Root-level
```bash
npm run dev                  # Start backend with nodemon
npm run generate:master-files # Regenerate CSV master-data files
npm run integration:dry-run  # Dry-run integration generator
```

### Running a single backend test
```bash
cd backend && npx mocha --file tests/setup.js tests/workflow.test.js --exit
```

### Running a single frontend test
```bash
cd frontend && npx jest src/tests/api.test.js
```

## Architecture

### Stack
- **Backend**: Node.js + Express, Sequelize ORM, SQLite (dev) / PostgreSQL (prod)
- **Frontend**: React 19 + Vite, React Router 7, Zustand, Tailwind CSS
- **Real-time**: Socket.IO
- **Auth**: JWT (7-day access, 30-day refresh), bcrypt
- **AI**: OpenAI GPT-4 via `backend/services/aiService.js`
- **Monitoring**: Prometheus metrics at `/metrics`, Winston logging

### Backend Structure

```
backend/
├── server.js              # Entry: Express + Socket.IO + schedulers
├── config/
│   ├── database.js        # Sequelize config (SQLite dev / Postgres prod)
│   ├── auth.js            # JWT config, role hierarchy, login limits
│   ├── openai.js          # AI feature flags per module
│   └── roleModuleMapping.json  # Role → module access map
├── controllers/           # ~50 auto-generated + manual controllers
├── middleware/
│   ├── auth.js            # JWT verify → req.user
│   ├── rbac.js            # Role-based access control
│   ├── workflowEnforcement.js  # State-machine enforcement
│   ├── uptdPilotGuard.js  # UPTD pilot replication guards
│   └── cacheMiddleware.js # In-memory caching
├── models/                # Sequelize models (50+)
├── routes/index.js        # Aggregates 84+ route files
├── services/
│   ├── workflowEngine.js  # Core state machine
│   ├── workflowNodes.js   # Workflow node definitions
│   ├── kpiPollingService.js   # Runs every 5 minutes
│   ├── slaService.js      # SLA escalation scheduler
│   └── dailyDigestService.js  # Daily notification digest
├── database/
│   ├── database.sqlite    # Dev database
│   ├── migrations/        # Sequelize migration files (.cjs)
│   └── seeders/
└── tests/                 # Mocha test suites
```

### Module Naming Convention

Controllers, routes, and models follow a department-module pattern:
- `BDS-*` — Bidang Distribusi (Distribution Division)
- `BKT-*` — Bidang Ketersediaan (Availability Division)
- `BKS-*` — Bidang Konsumsi (Consumption Division)
- `SEK-*` — Sekretariat (Secretariat)
- `UPT-*` — UPTD (Technical Implementation Unit)

New modules are generated from CSV master-data files in `master-data/` using `npm run generate:all`.

### Frontend Structure

```
frontend/src/
├── App.jsx            # All 50+ routes with role-based guards
├── auth/AuthContext.jsx
├── stores/authStore.js    # Zustand auth state
├── layouts/               # Dashboard layout shells per division
├── pages/                 # Page components (GenericCreatePage for CRUD)
├── ui/dashboards/         # Specialized dashboards by role
├── components/
│   ├── ui/                # Reusable UI primitives
│   └── dashboard-*/       # Role-specific dashboard panels
├── services/api.js        # Axios client (base URL from env)
└── utils/roleMap.js       # Role → dashboard path mapping
```

### Role System

Roles and their hierarchy (highest to lowest): `super_admin` (10) → `admin` (8) → `kepala_dinas` (7) → `sekretaris` (6) → `kepala_bidang` (5) → `staf` (3) → `uptd` (2) → `guest` (0).

Role-to-module access is defined in `backend/config/roleModuleMapping.json`. Each route goes through `protect` (JWT verify) + `checkRole`/`rbac` middleware.

### Workflow Engine

Workflows are state machines defined in `backend/services/workflowNodes.js`. State transitions are enforced via `backend/middleware/workflowEnforcement.js`. Workflow history is tracked in `WorkflowHistory` and `WorkflowInstance` models. The `workflowRbac.js` middleware restricts which roles can trigger which transitions.

### Database Migrations

Migration files live in `backend/migrations/` as `.cjs` files. Run `npm run migrate` from `backend/`. For SQLite schema changes, consult `dokumenSistem/README-backend.md` for enum-change strategies (SQLite doesn't support `ALTER COLUMN`).

### Environment Variables

Create `backend/.env` based on `backend/.env.example`. Key vars:
- `DB_DIALECT` — `sqlite` or `postgres`
- `JWT_SECRET` — required for auth
- `OPENAI_API_KEY` — required for AI features
- `FRONTEND_URL` — for CORS (default `http://localhost:5173`)

### Code Generation

The `backend/generators/serviceCrudGenerator.js` and scripts in `backend/scripts/generate*.js` auto-generate controllers/routes/models from CSV master-data. When adding a new module, update the CSV in `master-data/`, then run `npm run generate:all` from `backend/`.

### Testing

- Backend: Mocha + `tests/setup.js` (SQLite in-memory for unit tests). Integration tests in CI use PostgreSQL 16 service.
- Frontend: Jest + jsdom + `@testing-library/jest-dom`.
- CI pipeline: `.github/workflows/ci.yml` (build + test), `pilot-rollout-gate.yml` (auth schema + UPTD pilot guard tests).

### Key Documentation

System design documents are in `dokumenSistem/` (Bahasa Indonesia):
- `09-Role-Module-Matrix.md` — role/module access matrix
- `08-Workflow-Specification.md` — business workflow specs
- `07-Data-Dictionary.md` — field definitions
- `13-System-Architecture-Document.md` — system architecture
