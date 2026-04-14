# Rihla — Student Travel Platform for Morocco

> **Rihla** (رحلة) means *journey* in Arabic. It's a travel platform designed to help students discover places and connect with fellow student travellers across Morocco.

**Repository:** `ft_transcendance-42`

---

## Table of Contents

- [Overview](#overview)
- [MVP Features](#mvp-features)
- [Current Implementation Status](#current-implementation-status)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Backend Scripts](#backend-scripts)
- [Frontend Scripts](#frontend-scripts)
- [Environment Variables](#environment-variables)
- [Running with Docker](#running-with-docker)
- [API Overview](#api-overview)
- [Architecture](#architecture)
- [Testing](#testing)
- [Security](#security)
- [Performance & Monitoring](#performance--monitoring)
- [Common Issues & Solutions](#common-issues--solutions)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Rihla is a community-driven travel platform built for students exploring Morocco. It combines location-based discovery, social interaction, and AI-powered support to make travel easier, safer, and more social.

---

## MVP Features

| Feature | Description | Status |
|---------|-------------|--------|
| 🔐 Authentication | Register, Login, Logout (incl. OAuth Google) | ✅ Implemented |
| 👤 Users & Profiles | User accounts, profiles (username, avatar, bio) | ✅ Implemented |
| 📁 File Uploads | Image and file upload functionality | ✅ Implemented |
| 📍 Location & Places | Place discovery (Google Places) + personalized suggestions | ✅ Implemented |
| 🎯 Activity-Based Discovery | Places categorized by activity type | 📋 Planned  |
| ⭐ Rating System | Rate and review places | 📋 Planned |
| ⚡ Real-Time Features | WebSockets for messaging & notifications | 📋 Planned |
| 🤖 AI Support Bot | AI recommendations included in places service | 📋 Planned  |

---

## Current Implementation Status

### Backend (microservices)
- ✅ **auth-service (NestJS + Prisma):** cookie-based JWT auth + CSRF double-submit, Google OAuth 2.0, token validation/introspection
- ✅ **profiles-service (NestJS + Prisma):** authenticated profile read/update, avatar upload, static serving under `/uploads/*`
- ✅ **ai-places-service (Express):** Google Places-backed discovery (`/autocomplete`, `/places`, `/places/search`, `/places/suggest`) with Redis caching + rate limits
- ✅ **planner-service (Express + Prisma):** AI trip planning (`/plan/*`) using Gemini + Google Places; enriches with user favorites and community review summaries via internal service calls
- ✅ **fav-places (Express + Prisma):** save/visit places per user (`/fav-places/*`)
- ✅ **review-places (Express + Prisma):** community reviews + rating aggregation (`/reviews/*`)
- 🧪 **websock-service:** contract documented for realtime chat; implementation pending (see `backend/src/websock-service/handOff.md`)

### Frontend (React 19 + Vite 7)
- ✅ **Pages:** Landing (Hero), Home, Login, Register, Profile, Settings, OAuth callback, 404 error page
- ✅ **Routing:** React Router v7 with protected routes
- ✅ **UI Components:** Built with Radix UI primitives + Tailwind CSS v4
- ✅ **Styling:** Reusable component system (glass card, navigation, sections)
- ✅ **Context API:** Theme management and authentication state
- 📋 **Chat Feature:** Structure in place, implementation pending
- **Animations:** GSAP 3 for smooth transitions
- **Icons:** Lucide React icon library

### DevOps & Infrastructure
- **Docker Compose:** Multi-service orchestration with environment configuration
- **Services:** Frontend, Backend API, PostgreSQL, Restapi, Redis, Netdata, Kibana, Elasticsearch, Vault
- **Makefile Targets:** Build, start, stop, clean, and manage services easily
- **Health Monitoring:** Netdata for real-time system metrics

---

## Tech Stack

### Frontend

| Tool | Version | Purpose |
|------|---------|---------|
| [React](https://react.dev/) | 19.2 | Modern UI framework with hooks |
| [Vite](https://vitejs.dev/) | 7.2 | Lightning-fast build tool |
| [TypeScript](https://www.typescriptlang.org/) | 5.9 | Type-safe JavaScript |
| [Tailwind CSS](https://tailwindcss.com/) | 4.1 | Utility-first styling framework |
| [Radix UI](https://www.radix-ui.com/) | 1.4 | Unstyled, accessible components |
| [React Router](https://reactrouter.com/) | 7.13 | Client-side routing |
| [Lucide React](https://lucide.dev/) | 0.563 | Modern icon library |
| [GSAP](https://gsap.com/) | 3.14 | Professional animation library |
| [ESLint](https://eslint.org/) | 9 | Code quality & consistency |

### Backend

| Tool | Version | Purpose |
|--------|---------|---------|
| [NestJS](https://nestjs.com/) | 10 | Auth + Profiles microservices |
| [Express](https://expressjs.com/) | 4/5 | AI Places / Planner / Favorites / Reviews microservices |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | NestJS services |
| [Prisma](https://www.prisma.io/) | 6.x | ORM for Postgres-backed services |
| [PostgreSQL](https://www.postgresql.org/) | 15+ | Primary database |
| [Redis](https://redis.io/) | 7+ | Caching + rate limit store |
| [Passport.js](http://www.passportjs.org/) | 0.7 | OAuth/JWT middleware (NestJS) |
| [JWT](https://jwt.io/) | jsonwebtoken / @nestjs/jwt | Auth tokens for all services |

### DevOps & Infrastructure

| Service | Purpose | Port |
|---------|---------|------|
| PostgreSQL | Primary database | 5432 |
| Redis | Caching & sessions | 6379 |
| Elasticsearch | Log aggregation | 9200 |
| Kibana | Log visualization | 5601 |
| Swagger API Docs | API documentation | 8080 |
| Vault | Secrets management | 8200 |
| Netdata | System monitoring | 19999 |
| **AI Places Microservice** | **Express + Google Places + Redis** | **4000** |

---

## Project Structure

```
ft_transcendance-42/
├── frontend/                    # React 19 + Vite 7 + Tailwind
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── layouts/         # Page layouts (Header, Footer, Navigation)
│   │   │   ├── DashBoard.tsx   # Dashboard component
│   │   │   ├── HeroSection.tsx # Landing hero
│   │   │   ├── featureSection/ # Feature showcase
│   │   │   ├── glassCard.tsx   # Glass morphism cards
│   │   │   └── ...
│   │   ├── context/             # React Context (Theme, Auth, etc.)
│   │   ├── features/            # Feature-based modules
│   │   │   ├── Login/
│   │   │   ├── Register/
│   │   │   ├── Profile/
│   │   │   ├── Settings/
│   │   │   └── Chat/            # Chat infrastructure (WIP)
│   │   ├── pages/               # Route-level page components
│   │   │   ├── HomePage.tsx
│   │   │   ├── OAuthSuccess.tsx
│   │   │   ├── NotFound.tsx
│   │   │   └── ...
│   │   ├── lib/                 # Utilities & helpers
│   │   ├── assets/              # Static assets & icons
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── Dockerfile              # Multi-stage build
│   ├── vite.config.js
│   ├── tsconfig.json
│   ├── package.json
│   └── index.html
│
├── backend/                     # Backend microservices (NestJS + Express)
│   ├── src/
│   │   ├── auth-service/         # NestJS auth microservice (JWT + Google OAuth)
│   │   ├── profiles-service/     # NestJS profiles + uploads microservice
│   │   ├── ai-places-service/    # Express microservice (Google Places + Redis cache)
│   │   ├── planner-service/      # Express microservice (Gemini trip planner + Prisma)
│   │   ├── fav-places/           # Express microservice (saved/visited places + Prisma)
│   │   ├── review-places/        # Express microservice (reviews + aggregates + Prisma)
│   │   ├── websock-service/      # WebSocket service docs/contract (implementation pending)
│   │   └── friends/              # Work-in-progress module (not currently wired)
│   │
│   └── devops/                   # Docker infra (Vault, DB, Redis, Swagger, etc.)
│       ├── docker-compose.yml  # Complete stack (all services)
│       ├── .env                # Service configuration
│       ├── backend-services/   # Service containers
│       │   ├── auth/          # Auth gateway
│       │   ├── prisma/        # Prisma migrations
│       │   ├── logbull/       # Log aggregation
│       │   ├── netdata/       # Monitoring
│       │   └── security/      # Vault secrets
│       │
│       ├── frontend-services/  # Frontend infra
│       │   ├── maptoposter/   # Map integration
│       │   └── redis/         # Caching layer
│       │
│       ├── data/              # Pre-configured data
│       │   └── swagger.json   # API schema
│       │
│       ├── tools/
│       │   └── entrypoint.sh  # Docker entrypoint
│       │
│       └── secrets~/          # Environment secrets (gitignored)
│           ├── google_client_id
│           ├── google_client_secret
│           ├── callback_url
│           └── frontend_url
│
├── Makefile                     # Build & deployment targets
├── docker-compose.yml          # Root compose (references backend/devops)
├── CNAME                        # DNS configuration
├── Oauth2.md                    # OAuth setup guide
├── SECURITY.md                 # Security policies
└── README.md                    # This file
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ with npm or pnpm
- [Docker](https://www.docker.com/) & Docker Compose v2+
- [Git](https://git-scm.com/)
- Google OAuth 2.0 credentials (for authentication feature)

### Quick Installation

```bash
# 1. Clone the repository
git clone <your-repo-url> ft_transcendance-42 && cd ft_transcendance-42

# 2. Frontend setup
cd frontend
npm install
cd ..

# 3. Backend setup (per service)
# Each backend service has its own package.json under backend/src/<service>
cd backend/src/auth-service && npm install && cd ../../..
cd backend/src/profiles-service && npm install && cd ../../..
cd backend/src/ai-places-service && npm install && cd ../../..
cd backend/src/review-places && npm install && cd ../../..
cd backend/src/fav-places && npm install && cd ../../..
cd backend/src/planner-service && npm install && cd ../../..
```

### Local Development (No Docker)

Local development is supported, but the simplest way to run the backend is Docker (see below).  
If you still want to run services locally, you’ll need **PostgreSQL** + **Redis** running and a `.env` for each service.

**Start auth-service (NestJS)**

```bash
cd backend/src/auth-service
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
# http://localhost:3001
```

```bash
cd backend/src/profiles-service
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
# http://localhost:3002
```

**Start Express services**

```bash
cd backend/src/ai-places-service && npm run startDev
cd backend/src/review-places && npm run dev
cd backend/src/fav-places && npm run dev
cd backend/src/planner-service && npm run dev
```

### Backend Scripts

```bash
# Each backend service has its own scripts.
# Examples:

# NestJS services (auth-service / profiles-service)
cd backend/src/auth-service && npm run start:dev
cd backend/src/profiles-service && npm run start:dev

# Express services
cd backend/src/ai-places-service && npm run startDev
cd backend/src/review-places && npm run dev
cd backend/src/fav-places && npm run dev
cd backend/src/planner-service && npm run dev

# Prisma (per-service)
cd backend/src/auth-service && npm run prisma:generate && npm run prisma:migrate
cd backend/src/profiles-service && npm run prisma:generate && npm run prisma:migrate
cd backend/src/planner-service && npm run prisma:generate && npm run prisma:migrate
cd backend/src/review-places && npm run prisma:generate && npm run prisma:migrate
cd backend/src/fav-places && npm run prisma:generate && npm run prisma:migrate
```

### Frontend Scripts

```bash
# From frontend/ directory

npm run dev               # Start dev server (Vite)
npm run build            # Production build to dist/
npm run preview          # Preview production build
npm run lint             # ESLint checks
```

---

## Environment Variables

### Frontend (.env in frontend/)

```env
# API Configuration
VITE_API_URL=http://localhost:3001        # Auth service base URL (cookies + CSRF)
VITE_PROFILES_URL=http://localhost:3002   # Profiles service base URL
VITE_AI_PLACES_URL=http://localhost:4000  # AI Places service base URL
VITE_PLANNER_URL=http://localhost:7000    # Planner service base URL
VITE_WS_URL=ws://localhost:8000           # WebSocket URL (for real-time features; optional)
```

### Backend (Docker compose `.env` at repo root)

The root `docker-compose.yml` loads environment from a **repo-root** `.env`.  
Create `.env` (not committed) with at least:

```env
# Ports
PORT_FRONT=5173
PORT_POSTGRES=5432
PORT_VAULT=8200

# CORS / redirects
FRONTEND_URL=http://localhost:5173

# JWT (shared by all backend services)
JWT_ACCESS_SECRET=change_me
JWT_ACCESS_EXPIRES_IN=15m

# Postgres (Prisma uses DATABASE_URL)
DATABASE_URL=postgresql://postgres:password@localhost:5432/rihla

# External APIs
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_PLACES_API_KEY=your_google_places_api_key

# Redis
REDIS_URL=redis://redis:6379
```

### Secrets Management

When using the full Docker stack, Vault consumes secret files under `backend/devops/secrets/` (see `docker-compose.yml` `secrets:` block).

Create the following files (gitignored) before `make all`:

```
backend/devops/secrets/
  ├── google_client_id
  ├── google_client_secret
  ├── callback_url
  ├── frontend_url
  ├── gemini_api_key
  └── google_places
```

---

## Running with Docker

### Option 1: Frontend Only

```bash
# From project root
make front

# Or manually:
docker compose -f docker-compose.yml build frontend
docker compose -f docker-compose.yml up frontend -d

# Logs
docker compose -f docker-compose.yml logs -f frontend
```

**URL:** http://localhost:5173

### Option 2: Full Stack (recommended)

```bash
make all
```

**Services:**
- Frontend: `http://localhost:${PORT_FRONT}` (default `http://localhost:5173`)
- Auth: `http://localhost:3001` (`/auth/*`, `/health`)
- Profiles: `http://localhost:3002` (`/profiles/*`, `/uploads/*`, `/health`)
- AI Places: `http://localhost:4000` (`/places*`, `/autocomplete*`, `/health`)
- Review Places: `http://localhost:4001` (`/reviews*`, `/health`)
- Fav Places: `http://localhost:4002` (`/fav-places*`, `/health`)
- Planner: `http://localhost:7000` (`/plan*`, `/plans`, `/health`)
- Swagger UI: `http://localhost:8080`
- Vault: `http://localhost:${PORT_VAULT}` (default `http://localhost:8200`)

### Makefile Commands Summary

```bash
make all                # Build and start everything in docker-compose.yml
make front              # Build and start frontend only
make start              # Start stopped services
make stop               # Stop all services
make clean              # Remove containers/images/volumes/networks
make logs               # Stream logs from all services
make logs auth          # Stream logs for a single service (example)
```

### Troubleshooting Docker

```bash
# View running containers
docker ps

# View all images
docker images

# Remove dangling images
docker image prune

# Check logs
docker logs <container_id>

# Execute command in container
docker exec -it <container_id> bash

# Clean everything
make clean

# Rebuild specific service
docker compose -f docker-compose.yml build <service_name> --no-cache
```

---

## API Overview

### Implemented Endpoints

| Service | Base URL | Key routes | Description | Status |
|--------|----------|------------|-------------|--------|
| **auth-service** | `http://localhost:3001` | `GET /health`, `GET /auth/csrf`, `POST /auth/signup`, `POST /auth/signin`, `POST /auth/logout`, `GET /auth/me`, `GET /auth/validate`, `GET /auth/google/*` | Cookie-based JWT auth + CSRF + Google OAuth | ✅ |
| **profiles-service** | `http://localhost:3002` | `GET /health`, `GET /profiles/me`, `PUT /profiles/me`, `POST /uploads/avatar`, `GET /uploads/*` | Profiles + uploads (auth required) | ✅ |
| **ai-places-service** | `http://localhost:4000` | `GET /health`, `GET /autocomplete`, `POST /autocomplete/recent`, `GET /places`, `GET /places/search`, `POST /places/suggest`, `GET /places/photos` | Discovery (Google Places) + Redis caching + rate limits | ✅ |
| **review-places** | `http://localhost:4001` | `GET /health`, `GET /reviews`, `GET /reviews/summary`, `POST /reviews/batch`, `POST/PATCH/DELETE /reviews/*` | Reviews + rating aggregates | ✅ |
| **fav-places** | `http://localhost:4002` | `GET /health`, `GET/POST /fav-places`, `GET /fav-places/check`, `GET /fav-places/public/:userId`, `GET /fav-places/internal/:userId` | Favorites + visited places | ✅ |
| **planner-service** | `http://localhost:7000` | `GET /health`, `POST /plan/generate`, `GET /plan/:id`, `GET /plans`, `DELETE /plan/:id` | AI trip planning (Gemini) + persistence | ✅ |

### Planned Modules

- **Realtime chat (websock-service):** see `backend/src/websock-service/handOff.md`
- **Social graph:** friends module exists as a WIP draft under `backend/src/friends/` (not currently wired)

### AI Places Service Details

See `backend/src/ai-places-service/README.md`. Note that the current implementation is **Google Places + Redis** (not Unsplash), with a public photo proxy at `GET /places/photos`.

---

### Documentation

- **Swagger UI:** Available at `http://localhost:8080` (when running full stack)
- **OAuth Setup:** See [Oauth2.md](Oauth2.md) for Google OAuth configuration

---

## Architecture

### Authentication Flow

```
┌─────────────────┐
│   Frontend      │
└────────┬────────┘
         │ 1. User signs in / OAuth
         ▼
┌─────────────────────────────┐
│ auth-service (NestJS)       │
│ - POST /auth/signup         │ ← Argon2 hash, create user/profile
│ - POST /auth/signin         │ ← Issues JWT
│ - GET /auth/google/*        │ ← Google OAuth 2.0
└────────┬────────────────────┘
         │ 2. Sets cookies
         ▼
┌─────────────────────────────┐
│ Browser cookies             │
│ - access_token (httpOnly)   │
│ - csrf_token (readable)     │
└────────┬────────────────────┘
         │ 3. For mutating requests:
         │    send X-CSRF-Token header matching csrf_token cookie
         ▼
┌─────────────────────────────┐
│ Other services validate JWT │
│ via shared JWT_ACCESS_SECRET│
└─────────────────────────────┘
```

### Database Schema (Key Models)

```typescript
// Core user account (auth-service / profiles-service)
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  hashPassword    String?
  isEmailVerified Boolean   @default(false)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  accounts        Account[]
  profile         Profile?
}

// OAuth accounts (e.g. google)
model Account {
  id                String   @id @default(cuid())
  userId            String
  provider          String
  providerAccountId String
  accessToken       String?
  refreshToken      String?
  expiresAt         Int?
  createdAt         DateTime @default(now())

  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

// Profile info (displayName, username, avatar, etc.)
model Profile {
  id          String   @id @default(cuid())
  userId      String   @unique
  username    String   @unique
  displayName String?
  avatar      String?
  bio         String?
  status      String   @default("offline")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

(See `backend/src/auth-service/prisma/schema.prisma` and `backend/src/profiles-service/prisma/schema.prisma` for the source of truth.)

## Testing

Backend services currently ship with **lint/format** scripts, but do not have a unified test runner at the repo root.

### Frontend

Currently no test setup. Planned features like Chat will include Jest + React Testing Library.

## Security

- **Password Hashing:** Argon2 (industry standard)
- **JWT Tokens:** Signed with `JWT_SECRET` from environment
- **OAuth 2.0:** Secure Google authentication
- **CORS:** Configured for frontend domain only
- **Environment Variables:** Sensitive data never committed (use `.env` and `.gitignore`)
- **Vault Integration:** DevOps stack includes HashiCorp Vault for secrets management

See [SECURITY.md](SECURITY.md) for detailed security guidelines.

## Performance & Monitoring

When running the full stack (`make all`):

- **Netdata:** System metrics dashboard at http://localhost:19999
- **Logbull:** Log monitoring UI at https://logbull.localhost:8080
- **Logbull Forwarder:** Ships Docker logs from all services to Logbull intake API
- **Redis:** Caching layer for improved performance

### Logbull Forwarder Setup

To ingest all service logs into Logbull, configure these variables in repo-root `.env`:

```bash
LOGBULL_PROJECT_ID=<your-logbull-project-uuid>
# Optional (required only if the project enforces API key auth)
LOGBULL_API_KEY=<your-logbull-api-key>
# Optional (for projects using domain filters)
LOGBULL_ORIGIN=https://localhost
# Optional (host docker containers logs path)
DOCKER_CONTAINERS_PATH=/goinfre/aessadik/docker/containers
```

The `logbull-forwarder` service reads Docker logs through `/var/run/docker.sock` and posts batches to:
`/api/v1/logs/receiving/{projectId}`.
If Docker socket access is restricted, it automatically falls back to tailing Docker JSON logs from `DOCKER_CONTAINERS_PATH`.

## Common Issues & Solutions

### Port Already in Use

```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=3001 npm run start:dev
```

### Database Connection Error

```bash
# Verify PostgreSQL is running
docker ps | grep postgres

# Check DATABASE_URL in your repo-root .env (Docker) or per-service .env (local)
echo $DATABASE_URL

# Reset database (⚠️ deletes all data)
# Prisma schemas live per service under backend/src/<service>/prisma/schema.prisma
# Example (planner-service):
cd backend/src/planner-service && npx prisma migrate reset
```

### Prisma Client Missing

```bash
# Run per service that uses Prisma
cd backend/src/auth-service && npm run prisma:generate
cd backend/src/profiles-service && npm run prisma:generate
cd backend/src/planner-service && npm run prisma:generate
cd backend/src/review-places && npm run prisma:generate
cd backend/src/fav-places && npm run prisma:generate
```

### Docker Permission Denied

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Or use sudo
sudo docker compose up
```

### Frontend Can't Connect to Backend

```bash
# Verify services are running
curl http://localhost:3001/health  # auth-service
curl http://localhost:3002/health  # profiles-service
curl http://localhost:4000/health  # ai-places-service
curl http://localhost:7000/health  # planner-service

# Check VITE_API_URL in frontend/.env
# Should match the service URLs and FRONTEND_URL
```

## Roadmap

### Short Term (v1.0)
- ✅ User authentication (email/Google)
- ✅ User profiles
- ✅ File uploads
- ✅ Place discovery (Google Places + Redis cache)
- ✅ Favorites & visited places
- ✅ Reviews & ratings
- ✅ AI trip planner (Gemini)
- 📋 Real-time messaging infrastructure

### Medium Term (v1.5)
- 📋 Places & locations module
- 📋 Post creation (travel stories)
- 📋 Traveller groups
- 📋 Rating & review system
- 📋 Notifications

### Long Term (v2.0)
- 📋 Real-time chat (WebSocket)
- 📋 Advanced AI recommendations
- 📋 Mobile app
- 📋 Payment integration
- 📋 Advanced analytics

---

## Contributing

We welcome contributions! Please follow these guidelines:

### Setup for Contributors

```bash
# 1. Fork the repository
# 2. Clone your fork
git clone https://github.com/<your-username>/ft_transcendance-42.git
cd ft_transcendance-42

# 3. Create a feature branch
git checkout -b feature/your-feature-name

# 4. Make your changes and test
npm run lint && npm run test

# 5. Commit with clear messages
git commit -m "feat: add your feature description"

# 6. Push and create a Pull Request
git push origin feature/your-feature-name
```

### Code Standards

- **Linting:** ESLint + Prettier (run `npm run lint && npm run format`)
- **Naming:** Use camelCase for variables/functions, PascalCase for classes/components
- **Imports:** Organize imports (external → local)
- **Tests:** Include unit tests for new features (`*.spec.ts`)
- **Comments:** Document complex logic; use TypeScript types instead of JSDoc
- **Commits:** Use conventional commits (feat:, fix:, docs:, etc.)

### Pull Request Process

1. Update `README.md` if adding new features or changing workflows
2. Ensure all tests pass: `npm run test`, `npm run test:e2e`
3. Get code review from at least one maintainer
4. Merge to `main` after approval

### Reporting Issues

- Use GitHub Issues with clear title and description
- Include reproduction steps for bugs
- Attach screenshots or logs if relevant

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

---

## Team & Acknowledgments

Built as part of the 42 School Transcendence project.

For questions or support:
- 📧 Email: [contact info]
- 💬 Discord: [Discord server link]
- 🐛 Issues: [GitHub Issues](../../issues)

---

**Last Updated:** March 2026