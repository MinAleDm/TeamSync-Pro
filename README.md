# Tracker Monorepo

[![CI](https://github.com/minkinad/tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/minkinad/tracker/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/minkinad/tracker)](https://github.com/minkinad/tracker/blob/main/LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20.11.1-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9.15.4-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)

Scalable task tracking monorepo inspired by Yandex Tracker, built with `pnpm` workspaces, `Next.js`, `NestJS`, `PostgreSQL`, `Prisma`, `Redis`, and Socket.IO.

## Stack

- Monorepo: `pnpm workspaces`
- Frontend: Next.js App Router, React Query, Zustand
- Backend: NestJS, REST API, WebSocket gateway
- Database: PostgreSQL + Prisma
- Cache: Redis
- Realtime: Socket.IO
- Shared packages: database client, DTOs, UI primitives
- Infra: Docker, Docker Compose, Nginx, GitHub Actions CI

## Repository Layout

```text
.
├── apps
│   ├── api
│   │   ├── src
│   │   │   ├── common
│   │   │   │   ├── auth
│   │   │   │   ├── logging
│   │   │   │   ├── prisma
│   │   │   │   └── redis
│   │   │   ├── modules
│   │   │   │   ├── auth
│   │   │   │   ├── organizations
│   │   │   │   ├── projects
│   │   │   │   ├── realtime
│   │   │   │   ├── tasks
│   │   │   │   └── users
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── Dockerfile
│   │   └── .env.example
│   └── web
│       ├── src
│       │   ├── app
│       │   ├── features
│       │   │   ├── auth
│       │   │   ├── board-filter
│       │   │   ├── project-create
│       │   │   ├── project-selector
│       │   │   ├── task-create
│       │   │   └── task-modal
│       │   ├── lib
│       │   ├── shared
│       │   ├── store
│       │   └── widgets
│       ├── Dockerfile
│       └── .env.example
├── packages
│   ├── db
│   │   ├── prisma
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── src/index.ts
│   ├── types
│   │   └── src/index.ts
│   └── ui
│       └── src/lib
├── nginx/default.conf
├── docker-compose.yml
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## Key Files

- [apps/api/src/app.module.ts](/home/minkin/prikoli/tracker/apps/api/src/app.module.ts): Root NestJS composition, global config, middleware, and feature modules.
- [apps/api/src/modules/auth/auth.service.ts](/home/minkin/prikoli/tracker/apps/api/src/modules/auth/auth.service.ts): JWT login, refresh-token rotation, and session retrieval.
- [apps/api/src/modules/tasks/tasks.service.ts](/home/minkin/prikoli/tracker/apps/api/src/modules/tasks/tasks.service.ts): Task orchestration, Redis cache invalidation, activity logging, and realtime publishing.
- [apps/api/src/modules/realtime/realtime.gateway.ts](/home/minkin/prikoli/tracker/apps/api/src/modules/realtime/realtime.gateway.ts): Socket.IO gateway with token validation and project-room subscriptions.
- [packages/db/prisma/schema.prisma](/home/minkin/prikoli/tracker/packages/db/prisma/schema.prisma): Prisma schema for users, organizations, memberships, projects, tasks, comments, activity, and refresh tokens.
- [packages/types/src/index.ts](/home/minkin/prikoli/tracker/packages/types/src/index.ts): Shared DTOs and cross-app contracts.
- [apps/web/src/lib/api-client.ts](/home/minkin/prikoli/tracker/apps/web/src/lib/api-client.ts): Auth-aware frontend API client with refresh-token retry.
- [apps/web/src/widgets/app-shell/ui/app-shell.tsx](/home/minkin/prikoli/tracker/apps/web/src/widgets/app-shell/ui/app-shell.tsx): Main dashboard shell, query orchestration, sidebar, filters, and authenticated layout.
- [apps/web/src/widgets/kanban-board/ui/kanban-board.tsx](/home/minkin/prikoli/tracker/apps/web/src/widgets/kanban-board/ui/kanban-board.tsx): Kanban board with drag-and-drop status changes.
- [apps/web/src/features/task-modal/ui/task-modal.tsx](/home/minkin/prikoli/tracker/apps/web/src/features/task-modal/ui/task-modal.tsx): Task detail modal with editing, comments, and activity stream.
- [docker-compose.yml](/home/minkin/prikoli/tracker/docker-compose.yml): Local multi-container environment.
- [nginx/default.conf](/home/minkin/prikoli/tracker/nginx/default.conf): Reverse proxy example for the web app, API, and Socket.IO upgrades.

## Backend Design

### Clean architecture boundaries

- Controllers: request/response mapping only.
- Services: business orchestration and policy checks.
- Repositories: Prisma persistence logic.
- Common infra: Prisma, Redis, auth guards, role checks, logging middleware.

### Implemented features

- JWT authentication with refresh-token rotation.
- Users and organizations listing.
- Project listing and creation.
- Task CRUD basics with status, priority, assignee, description, and pagination.
- Filtering and search on task collections.
- Task comments.
- Task activity log.
- Realtime task change broadcasts over Socket.IO.
- Redis caching for task list queries.
- Role-based restriction for project creation.

## Frontend Design

- Next.js App Router dashboard with sidebar and kanban layout.
- React Query for server state.
- Zustand for session state, selected org/project, filters, and active modal state.
- Task creation flow and task detail modal.
- Realtime invalidation of task queries when updates arrive.
- Shared UI primitives consumed from `packages/ui`.

## Local Run

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Recommended local values:

- `apps/api/.env`: keep `DATABASE_URL=postgresql://tracker:tracker@localhost:5432/tracker?schema=public`
- `apps/web/.env.local`: set `NEXT_PUBLIC_API_URL=http://localhost:3001/api`
- `apps/web/.env.local`: set `NEXT_PUBLIC_SOCKET_URL=http://localhost:3001`

### 3. Start PostgreSQL and Redis

```bash
docker compose up -d postgres redis
```

### 4. Generate Prisma client and apply database schema

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### 5. Start the apps

```bash
pnpm dev
```

Default URLs:

- Web: `http://localhost:3000`
- API: `http://localhost:3001/api`
- Swagger: `http://localhost:3001/api/docs`

Demo login:

- Email: `owner@tracker.local`
- Password: `changeme123`

## Docker Run

```bash
docker compose up --build
```

Endpoints in container mode:

- Nginx entrypoint: `http://localhost:8080`
- Web: proxied through Nginx
- API: proxied through `/api`

## Deployment Guide

### Option 1. Single VM with Docker Compose

1. Provision a Linux host with Docker and Docker Compose.
2. Copy the repo and create a production `.env`.
3. Set strong JWT secrets and production database credentials.
4. Update `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL` for your public domain.
5. Run `docker compose up -d --build`.
6. Put TLS in front of Nginx with your preferred ingress or reverse proxy.

### Option 2. Managed services

1. Deploy PostgreSQL and Redis to managed services.
2. Build `apps/api` and `apps/web` as separate containers.
3. Run Prisma migrations during release:

```bash
pnpm db:generate
pnpm --filter @tracker/db prisma:migrate
pnpm db:seed
```

4. Route `/api` and `/socket.io` to the API service.
5. Route `/` to the Next.js web service.
6. Set `CORS_ORIGIN` to the exact public frontend origin.

### Operational notes

- Keep refresh-token secrets separate from access-token secrets.
- Run Prisma migrations before shifting traffic to a new API build.
- Use sticky sessions only if you later move realtime state beyond a single API instance; for horizontal scaling, introduce a Socket.IO Redis adapter.
- Replace the seed credentials in non-development environments.

## Commands

```bash
pnpm dev
pnpm build
pnpm typecheck
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm docker:up
pnpm docker:down
```

## Notes

- This repository is scaffolded to be production-oriented, but dependency installation and runtime verification still need to happen in the target environment.
- The existing UI from the original single-app project was reorganized into `apps/web` and reworked to use the new API contract.
