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
| 📍 Location & Places | AI-powered place suggestions (Gemini + Unsplash) | ✅ Implemented |
| 🎯 Activity-Based Discovery | Places categorized by activity type | 📋 Planned  |
| ⭐ Rating System | Rate and review places | 📋 Planned |
| ⚡ Real-Time Features | WebSockets for messaging & notifications | 📋 Planned |
| 🤖 AI Support Bot | AI recommendations included in places service | 📋 Planned  |

---

## Current Implementation Status

### Backend (NestJS 10 + TypeScript)
- ✅ **Auth Module:** JWT-based authentication, Google OAuth 2.0 integration (signup/signin/logout)
- ✅ **Users Module:** User CRUD operations, account management
- ✅ **Profiles Module:** User profile creation, updates, and retrieval
- ✅ **Uploads Module:** File upload handler with Express middleware
- ✅ **AI Places Service:** Express microservice with Gemini Flash API for place generation & Unsplash API for images
- **Database:** PostgreSQL with Prisma ORM v6.19, migrations ready
- **Services:** RabbitMQ, Swagger UI (port 8080), Vault (secrets management), ELK Stack (logging)

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
- **Services:** Frontend, Backend API, PostgreSQL, RabbitMQ, Redis, Netdata, Kibana, Elasticsearch, Vault
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
| [NestJS](https://nestjs.com/) | 10 | Progressive Node.js framework |
| [TypeScript](https://www.typescriptlang.org/) | 5.1 | Type-safe server code |
| [Prisma](https://www.prisma.io/) | 6.19 | Type-safe ORM |
| [PostgreSQL](https://www.postgresql.org/) | 15+ | Reliable relational database |
| [Passport.js](http://www.passportjs.org/) | 0.7 | Authentication middleware |
| [JWT](https://jwt.io/) | via @nestjs/jwt | Secure token authentication |
| [Jest](https://jestjs.io/) | 29.5 | Testing framework |
| [Prettier](https://prettier.io/) | 3 | Code formatter |

### DevOps & Infrastructure

| Service | Purpose | Port |
|---------|---------|------|
| PostgreSQL | Primary database | 5432 |
| Redis | Caching & sessions | 6379 |
| RabbitMQ | Message queue | 5672 / 15672 (UI) |
| Elasticsearch | Log aggregation | 9200 |
| Kibana | Log visualization | 5601 |
| Swagger API Docs | API documentation | 8080 |
| Vault | Secrets management | 8200 |
| Netdata | System monitoring | 19999 |
| **AI Places Microservice** | **Express + Gemini + Unsplash** | **4000** |

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
├── backend/                     # NestJS 10 + Prisma 6.19
│   ├── src/
│   │   ├── app.module.ts        # Root module
│   │   ├── app.service.ts       # App service
│   │   ├── main.ts              # Entry point
│   │   ├── prisma.service.ts    # Prisma client wrapper
│   │   │
│   │   ├── auth/                # Authentication module
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── dto/             # Data transfer objects
│   │   │   ├── guards/          # JWT, OAuth guards
│   │   │   └── strategies/      # Passport strategies
│   │   │
│   │   ├── users/               # User management
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── dto/
│   │   │   └── *.spec.ts        # Unit tests
│   │   │
│   │   ├── profiles/            # User profiles
│   │   │   ├── profiles.module.ts
│   │   │   ├── profiles.controller.ts
│   │   │   ├── profiles.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── uploads/             # File upload handling
│   │   │   ├── uploads.module.ts
│   │   │   ├── uploads.controller.ts
│   │   │   ├── uploads.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── ai-places-service/   # AI-powered place recommendations
│   │   │   ├── src/
│   │   │   │   ├── server.js    # Microservice entry
│   │   │   │   └── ...
│   │   │   ├── package.json
│   │   │   ├── Dockerfile      # Containerized service
│   │   │   └── README.md
│   │   │
│   │   └── prisma/              # ORM module
│   │       ├── prisma.module.ts
│   │       └── prisma.service.ts
│   │
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema (User, Profile, Account, etc.)
│   │   ├── migrations/          # DB migration history
│   │   └── seed.ts              # Database seeding (optional)
│   │
│   ├── test/                    # E2E tests
│   │   ├── app.e2e-spec.ts
│   │   └── jest-e2e.json
│   │
│   ├── docker-compose.yml       # Dev database only (PostgreSQL)
│   ├── Dockerfile              # Backend production build
│   ├── nest-cli.json           # NestJS CLI config
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.build.json
│   └── devops/                 # Full-stack DevOps setup
│       ├── docker-compose.yml  # Complete stack (all services)
│       ├── .env                # Service configuration
│       ├── backend-services/   # Service containers
│       │   ├── auth/          # Auth gateway
│       │   ├── prisma/        # Prisma migrations
│       │   ├── rabbitmq/      # Message broker
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

# 3. Backend setup
cd backend
npm install
cd ..

# 4. Generate Prisma client
cd backend && npm run prisma:generate && cd ..
```

### Local Development (No Docker)

**Start the development database:**

```bash
cd backend
docker compose up -d  # Spins up PostgreSQL on localhost:5432
npm run prisma:dev:deploy  # Run migrations
cd ..
```

**Start backend (from backend/ directory):**

```bash
npm run start:dev
# Server runs on http://localhost:3000
```

**Start frontend (from frontend/ directory):**

```bash
npm run dev
# Dev server on http://localhost:5173
```

### Backend Scripts

```bash
# From backend/ directory

# Development
npm run start:dev          # Watch mode with hot reload
npm run start:debug        # Debug mode with inspector

# Production
npm run build              # Compile to dist/
npm run start:prod         # Run compiled version

# Database
npm run prisma:generate    # Generate Prisma client
npm run prisma:dev:deploy  # Run pending migrations
# npx prisma studio        # Open database GUI (optional)

# Code quality
npm run lint              # Fix ESLint issues
npm run format            # Format with Prettier

# Testing
npm run test              # Run unit tests
npm run test:watch        # Watch mode
npm run test:cov          # Coverage report
npm run test:debug        # Debug mode
npm run test:e2e          # End-to-end tests
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
VITE_API_URL=http://localhost:3000        # Backend API URL
VITE_WS_URL=ws://localhost:3000          # WebSocket URL (for real-time features)
```

### Backend (.env in backend/)

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/rihla

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRATION=7d

# OAuth (Google)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:5173

# Optional: File Upload
UPLOAD_DEST=./uploads
MAX_FILE_SIZE=5242880  # 5MB in bytes
```

### DevOps Stack (.env in backend/devops/)

```env
# Frontend
PORT_FRONT=3000
FRONTEND_DOMAIN=localhost

# Backend
PORT_BACK=3001
BACKEND_DOMAIN=localhost

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=rihla
POSTGRES_PORT=5432

# Redis
REDIS_PORT=6379

# RabbitMQ
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_PORT=5672

# Elasticsearch
ELASTICSEARCH_PORT=9200

# Kibana
KIBANA_PORT=5601

# Swagger UI
SWAGGER_PORT=8080

# Vault (Secrets Management)
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=your_vault_token

# Netdata Monitoring
NETDATA_PORT=19999

# Service URLs
AUTH_SERVICE_URL=http://localhost:3001/auth
API_PLACES_SERVICE_URL=http://localhost:3002
```

### Secrets Management

Sensitive credentials are stored in `backend/devops/secrets~/` (gitignored):

```
backend/devops/secrets~/
  ├── google_client_id
  ├── google_client_secret
  ├── callback_url
  └── frontend_url
```

Create these files and populate with your credentials before running the full stack.

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

### Option 2: Backend + Database (Local Dev)

```bash
cd backend

# Start PostgreSQL only
docker compose up -d

# Generate Prisma client and run migrations
npm run prisma:generate
npm run prisma:dev:deploy

# Start backend server (from backend/)
npm run start:dev
```

**Database:** localhost:5432  
**API:** http://localhost:3000

### Option 3: Backend Only (Container)

```bash
make backend

# Or manually:
docker compose -f docker-compose.yml build backend --no-cache
docker compose -f docker-compose.yml up backend -d
```

### Option 4: Complete Stack (All Services)

This runs the full production-like stack with all microservices, databases, and infrastructure:

```bash
# From project root (uses backend/devops/docker-compose.yml)
make all           # Build and start everything
make start         # Start stopped services
make stop          # Stop all services
make clean         # Delete all containers, images, volumes, networks
make logs          # View logs from all services
make logs service-name  # View logs for specific service
```

**Available services after `make all`:**

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| Backend API | http://localhost:3001 | 3001 |
| PostgreSQL | postgres://... | 5432 |
| Redis | redis://localhost | 6379 |
| RabbitMQ UI | http://localhost:15672 | 15672 |
| Swagger API Docs | http://localhost:8080 | 8080 |
| Kibana (Logs) | http://localhost:5601 | 5601 |
| Netdata (Monitoring) | http://localhost:19999 | 19999 |
| Vault (Secrets) | http://localhost:8200 | 8200 |

### Database Migrations

```bash
cd backend

# Create a new migration
npx prisma migrate dev --name <migration_name>

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio

# Rollback specific migration
npx prisma migrate resolve --rolling-back <migration_name>
```

### Makefile Commands Summary

```bash
make all          # Build all images and start all services
make front        # Build and start frontend only
make backend      # Build and start backend only
make start        # Start all stopped services
make stop         # Stop all services
make clean        # Remove everything (containers, images, volumes, networks)
make logs         # Stream logs from all services
make logs backend # Stream logs from specific service
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

| Module | Base Route | Methods | Description | Status |
|--------|------------|---------|-------------|--------|
| **Auth** | `/auth` | POST | signup, signin, logout with JWT & Google OAuth | ✅ |
| **Users** | `/users` | GET, POST, PATCH, DELETE | User CRUD operations | ✅ |
| **Profiles** | `/profiles` | GET, POST, PATCH, DELETE | Profile management (linked to User) | ✅ |
| **Uploads** | `/uploads` | POST | File & image uploads | ✅ |
| **AI Places** | `/ai-places` | GET | AI-generated places with images by city | ✅ |

### Planned Modules

- **Posts:** Create, read, update, delete travel posts
- **Groups:** Create traveller groups, manage membership
- **Messages:** Direct messaging with real-time updates (WebSocket)
- **Notifications:** Push & in-app notifications
- **Ratings:** Rate places and get community feedback
- **Bookmarks:** Save favorite places

### AI Places Service Details

The **AI Places Service** is an Express.js microservice that generates intelligent travel recommendations:

**How it works:**
1. **Request:** Client calls `GET /ai-places?city=Marrakesh`
2. **Cache Check:** Service checks in-memory cache (1-hour TTL)
   - **Hit** → Return cached places JSON
   - **Miss** → Continue to step 3
3. **AI Generation:** Calls Google Gemini 2.5 Flash API to generate 10 places with:
   - Name, category (Museum, Park, Restaurant, etc.)
   - Rating (1.0-5.0), detailed description
   - Address and "must visit" status
4. **Image Enrichment:** For each place, fetches cover image from Unsplash API (parallel requests)
5. **Cache & Return:** Stores result in cache and returns enriched JSON to client

**Tech Stack:**
- Express.js 5.2 (HTTP server)
- Google Gemini 2.5 Flash API (place generation)
- Unsplash API (place images)
- In-memory caching with TTL
- CORS enabled for frontend communication

**Required Environment Variables:**
- `GEMINI_API_KEY` – Get from [Google AI Studio](https://aistudio.google.com/app/apikey)
- `UNSPLASH_ACCESS_KEY` – Get from [Unsplash Developers](https://unsplash.com/developers)
- `PORT` – Service port (default: 4000)

See [backend/src/ai-places-service/README.md](backend/src/ai-places-service/README.md) for full implementation details.

---

### Documentation

- **Swagger UI:** Available at `http://localhost:8080` (when running full stack)
- **API Handoff:** See [backend/BACKEND_HANDOFF.md](backend/BACKEND_HANDOFF.md) for detailed endpoint specifications and data models
- **OAuth Setup:** See [Oauth2.md](Oauth2.md) for Google OAuth configuration

---

## Architecture

### Authentication Flow

```
┌─────────────────┐
│   Frontend      │
└────────┬────────┘
         │ 1. User submits credentials/OAuth
         ▼
┌─────────────────────────────┐
│   Auth Module (/auth)       │ ← Validates credentials
│   - signup (register)       │ ← Hashes password with Argon2
│   - signin (login)          │ ← Issues JWT token
│   - oauth/google            │ ← Google OAuth 2.0
└────────┬────────────────────┘
         │ 2. JWT Token
         ▼
┌─────────────────────────────┐
│   Frontend Stores Token     │
│   (localStorage/session)    │
└────────┬────────────────────┘
         │ 3. Include JWT in headers
         ▼
┌─────────────────────────────┐
│   JWT Guard validates token │
│   on protected routes       │
└─────────────────────────────┘
```

### Database Schema (Key Models)

```typescript
// User - Core account
model User {
  id: String @id @default(cuid())
  email: String @unique
  username: String @unique
  passwordHash: String
  profile: Profile?
  accounts: Account[]  // OAuth
  createdAt: DateTime
  updatedAt: DateTime
}

// Profile - User details
model Profile {
  id: String @id
  userId: String @unique
  avatar: String?          // URL to image
  bio: String?
  coverImage: String?      // Header image
  user: User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// Account - OAuth integration
model Account {
  id: String @id @default(cuid())
  userId: String
  provider: String        // "google"
  providerAccountId: String
  user: User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

(See `backend/prisma/schema.prisma` for complete schema)

## Testing

### Unit Tests

```bash
cd backend

# Run all tests
npm run test

# Watch mode (re-run on file change)
npm run test:watch

# Coverage report
npm run test:cov

# Debug tests
npm run test:debug
```

### E2E Tests

```bash
cd backend

# Run end-to-end tests
npm run test:e2e

# With coverage
npm run test:e2e -- --coverage
```

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
- **Kibana + Elasticsearch:** Centralized logging at http://localhost:5601
- **Redis:** Caching layer for improved performance
- **RabbitMQ:** Message queue for async operations

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

# Check DATABASE_URL in .env
echo $DATABASE_URL

# Reset database (⚠️ deletes all data)
cd backend && npx prisma migrate reset
```

### Prisma Client Missing

```bash
cd backend
npm run prisma:generate
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
# Verify backend is running
curl http://localhost:3000/health

# Check VITE_API_URL in frontend/.env
# Should match backend PORT and FRONTEND_URL in backend/.env
```

## Roadmap

### Short Term (v1.0)
- ✅ User authentication (email/Google)
- ✅ User profiles
- ✅ File uploads
- ✅ AI-powered place recommendations (Gemini + Unsplash)
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