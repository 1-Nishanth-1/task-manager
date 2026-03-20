# Task Manager

Full‑stack task management app with Google login, real‑time task updates, and email‑based assignment.

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
git clone <your-repo-url>

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

At a high level:

- **Frontend (Next.js)**
  - Next.js App Router app under `frontend/app`.
  - Authentication via `next-auth` + Google provider.
  - React Query for data fetching and caching.
  - Axios client in `lib/axios.ts` talks to the backend REST API.
  - Socket.IO client in `lib/socket.ts` subscribes to real‑time task events.

- **Backend (Express + Prisma)**
  - Express server in [backend/src/app.ts](backend/src/app.ts) with CORS, Helmet, and XSS protection.
  - REST routes under `backend/src/routes` for tasks and auth sync.
  - Socket.IO server in [backend/src/sockets/index.ts](backend/src/sockets/index.ts) broadcasting task updates (create/update/assign).
  - Prisma ORM with PostgreSQL; schema is in [backend/prisma/schema.prisma](backend/prisma/schema.prisma).

- **Data model**
  - `User`: `id`, `name`, `email`, optional `image`; links to created and assigned tasks.
  - `Task`: `title`, `description`, `status` (TODO/IN_PROGRESS/DONE), creator, optional assignee, timestamps.

- **Authentication & authorization**
  - Frontend uses Google OAuth via NextAuth.
  - A backend‑specific JWT is minted in `frontend/app/api/backend-token/route.ts` and signed with `BACKEND_JWT_SECRET`.
  - Express `authMiddleware` verifies that JWT and attaches `req.user`.
  - Task service enforces that only creators (or, in some cases, assignees) can update/delete tasks.

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

If you deploy the stack, you can document it here:

- **Frontend (Vercel):** https://task-manger-topaz.vercel.app
- **Backend API:** https://56.228.19.209.nip.io

Suggested ways to demonstrate the app:

- Short screen recording walking through:
  - Google sign‑in.
  - Creating a task.
  - Assigning a task to another user.
  - Seeing the update appear in another browser window in real time.
- Or include a few screenshots in the repo under `public/` and reference them here.

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

- **Example disagreement with AI**
  - An early AI suggestion was to introduce a dedicated Prisma seed script with hard‑coded demo users and tasks.
  - Instead, we chose to keep seeding manual for now (signing in with real Google accounts to create users), keeping the codebase smaller and avoiding extra operational complexity.
  - A seed script remains on the roadmap, but only once the domain model has fully stabilized.
