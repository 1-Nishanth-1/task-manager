# Task Manager

Full‑stack task management app with Google login, real‑time task updates, and email‑based assignment.

Deployed in vercel for the frontend and AWS EC2 for the backend.
You can access the site **HERE** https://task-manger-topaz.vercel.app

This repo contains:

- `backend/` – Express + Prisma + PostgreSQL API and Socket.IO server
- `frontend/` – Next.js 16 app (App Router) with NextAuth, React Query, and a Tailwind‑based UI

---

## 1. Setup

### Prerequisites

- Node.js 20+
- Docker + Docker Compose
- A Google OAuth client (for local sign‑in)

### 1. Clone and install

```bash
# Clone
git clone https://github.com/1-Nishanth-1/task-manager.git

# Backend deps
cd backend
npm install

# Frontend deps
cd ../frontend
npm install
```

### 2. Configure environment variables

**Backend** ([backend/.env](backend/.env))

```dotenv
DATABASE_URL="postgresql://user:password@localhost:5432/task_manager?schema=public"
JWT_SECRET="<strong-random-secret>"
PORT=4000
```

**Frontend** ([frontend/.env.local](frontend/.env.local))

```dotenv
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<another-strong-random-secret>

# Backend HTTP + WebSocket endpoints
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000

# Must match backend JWT_SECRET
BACKEND_JWT_SECRET=<same-as-backend-JWT_SECRET>
```

### 3. Run the stack

From the repo root:

```bash
# 1) Start Postgres + backend (production‑like)
cd backend
docker compose up -d

# Optional: run database migrations directly on your local machine
npm run prisma:migrate

# 2) Start the frontend dev server
cd ../frontend
npm run dev
```

Then open http://localhost:3000 and sign in with Google.

> **Tip:** On first login, the frontend syncs your Google profile to the backend, so a corresponding `User` row exists before you create or assign tasks.

---

## 2. Architecture overview

### 2.1 High‑level system

- **Client** – Next.js app (App Router) in `frontend/`.
- **API + Realtime** – Node/Express server with Prisma and Socket.IO in `backend/`.
- **Database** – PostgreSQL, managed via Prisma migrations.
- **Auth** – Google OAuth via NextAuth on the frontend, with a separate JWT for backend access.

Conceptually:

`Browser (Next.js) → REST/Socket.IO → Express API → PostgreSQL`

### 2.2 Frontend (Next.js)

- Next.js App Router app under `frontend/app`.
- Authentication via `next-auth` + Google provider.
- React Query manages data fetching, caching, and background refetching.
- Axios client in `frontend/lib/axios.ts` talks to the backend REST API.
- Socket.IO client in `frontend/lib/socket.ts` subscribes to task events (created/updated/assigned) for real‑time updates.

### 2.3 Backend (Express + Prisma + Socket.IO)

- Express app in [backend/src/app.ts](backend/src/app.ts) with:
  - CORS configured for the local dev origin and the deployed Vercel domain.
  - Security middleware: Helmet and XSS‑clean.
  - REST routes under `backend/src/routes` for tasks and auth sync.
- Socket.IO server in [backend/src/sockets/index.ts](backend/src/sockets/index.ts):
  - Authenticates connections using the backend JWT.
  - Places each user in a dedicated room.
  - Emits events when tasks are created, updated, or assigned.
- Prisma ORM with schema in [backend/prisma/schema.prisma](backend/prisma/schema.prisma) and migrations under `backend/prisma/migrations/`.

### 2.4 Domain model

- **User**
  - Fields: `id`, `name`, `email`, optional `image`, `createdAt`.
  - Relations: `createdTasks`, `assignedTasks`.
- **Task**
  - Fields: `id`, `title`, `description`, `status` (TODO | IN_PROGRESS | DONE), `priority` (LOW | MEDIUM | HIGH), `createdAt`, `updatedAt`.
  - Foreign keys: `createdById` (required), `assignedToId` (optional).
  - Indexes on creator, assignee, status, and priority for efficient querying.

### 2.5 Auth & request flow

1. User signs in with Google via NextAuth on the frontend.
2. Frontend calls `/api/backend-token`, which:
   - Reads the NextAuth session.
   - Issues a backend JWT signed with `BACKEND_JWT_SECRET`.
   - Calls `backend/api/auth/sync` to upsert the user in the database.
3. Subsequent REST and Socket.IO calls include this backend JWT; `authMiddleware` verifies it and populates `req.user`.
4. Task operations use that user identity for authorization and for targeting real‑time notifications.

---

## 3. Assumptions & trade‑offs

- **Single auth provider (Google only).** Simpler to build and sufficient for a small team; trade‑off is no email/password or other providers.
- **Email as primary identity.** Users are looked up and assigned to tasks by email. This makes it easy to invite teammates by email but assumes emails are unique and stable.
- **Backend JWT `sub` field.** The backend token uses the user email as its subject for simplicity; in a production system we might prefer a stable internal user ID.
- **Optimistic UX over strict validation.** Some errors (like failing to sync a user) are logged but do not always block the frontend, to keep flows smooth during development.
- **Monorepo layout.** Backend and frontend live in the same repo but are deployed independently (e.g., Vercel for the frontend, Docker/VM for the backend).

---

## 4. Sample data / seeding

There is no automated seed script yet; instead, you can generate realistic data quickly:

1. Start the stack as described above.
2. Sign in with Google from two different Google accounts.
   - Each successful login triggers `/api/auth/sync` and upserts a `User` row via Prisma.
3. From the dashboard, create a few tasks:
   - Tasks with yourself as assignee (default behaviour).
   - Tasks assigned to the other user by entering their email.
4. Observe real‑time updates:
   - Open the app in two browser windows signed in as different users.
   - Creating or assigning tasks in one window should update the other via Socket.IO.

A future improvement would be adding a `prisma/seed.ts` script and wiring it to `npx prisma db seed`.

---

## 5. Testing

At the moment there are **no automated tests** wired up.

The first place to add tests would be the task domain logic in:

- [backend/src/services/taskService.ts](backend/src/services/taskService.ts)

For example, using Jest or Vitest you could test:

- Creating tasks with and without an explicit assignee.
- Authorization rules for updates and deletes (creator vs assignee).
- Filtering and pagination in `getTasksForUser`.

Adding a minimal test suite here is an obvious next step.

---

## 6. Working demo

Backend is served behind NGINX on AWS EC2; the frontend is deployed on Vercel (optimized for Next.js).

- **Frontend (Vercel):** https://task-manger-topaz.vercel.app
- **Backend API:** https://56.228.19.209.nip.io

---

## 7. AI tools usage

This project used **GitHub Copilot (GPT-5.1)** to accelerate development.

- **What AI was used for**
  - Drafting Express middleware, error handling, and CORS configuration.
  - Sketching Prisma model definitions and basic CRUD logic for tasks.
  - Helping debug environment variable issues (NextAuth secret, CORS, backend token sync).
  - Generating this README structure and wording.

- **What was reviewed and changed manually**
  - All environment variable names and values were adjusted to match the actual deployment setup.
  - CORS and Socket.IO origins were manually constrained to known frontends.
  - Prisma schema and relations were checked to ensure foreign keys aligned with the intended user/task model.
  - Lot of changes were made to the UI to optimize it further to provide a clean and mosern llok.

- **Example disagreement with AI**
  - AI suggested adding a full role-based access control system (admins, members, viewers) and a separate admin dashboard. I decided this was overkill for the current scope and kept the simpler creator/assignee permission model focused on small teams.
  - AI proposed generating and committing a large Prisma seed file with hard-coded demo users and tasks. I preferred using real Google accounts for seeding in development to better mirror production auth and avoid maintaining fake credentials.
  - AI initially recommended using a wildcard CORS policy (`*`) to "make local testing easier". I rejected this in favour of explicitly whitelisting localhost and the Vercel domain to keep the deployment more secure.

p.s. As did backend and frontend in 2 seperate git repositories I lost track of the commit history. 
