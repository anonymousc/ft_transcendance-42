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
- [Environment Variables](#environment-variables)
- [Running with Docker](#running-with-docker)
- [API Overview](#api-overview)
- [Contributing](#contributing)

---

## Overview

Rihla is a community-driven travel platform built for students exploring Morocco. It combines location-based discovery, social interaction, and AI-powered support to make travel easier, safer, and more social.

---

## MVP Features

| Feature | Description | Status |
|---------|-------------|--------|
| 🔐 Authentication | Register, Login, Logout (incl. OAuth) | ✅ In progress |
| 👤 Users & Profiles | User accounts, profiles (username, avatar, bio) | ✅ In progress |
| 📍 Location & Places | Select a city, curated place suggestions | 📋 Planned |
| 🎯 Activity-Based Suggestions | Discover places by activity type | 📋 Planned |
| 💬 Social Interaction | Posts, traveller groups, messaging | 📋 Planned |
| ⭐ Rating System | Rate places, share with community | 📋 Planned |
| ⚡ Real-Time Features | WebSockets for messaging & notifications | 📋 Planned |
| 🤖 AI Support Bot | In-app AI chat assistant | 📋 Planned |

---

## Current Implementation Status

- **Backend (NestJS):** Auth module (signup/signin), Users module, Profiles module. Prisma with `User`, `Account` (OAuth), and `Profile` models. Database: PostgreSQL.
- **Frontend (React):** Landing (Hero), Login, Register, Home, Profile, Settings, OAuth success flow, 404. Theme context. Feature areas: Login, register, profile, Settings, chat (structure in place).
- **DevOps:** Dev database via `backend/docker-compose.yml`; full stack (frontend, auth, database, RabbitMQ, ELK, Swagger, Vault) via `backend/devops/docker-compose.yml` and Makefile.

---

## Tech Stack

### Frontend

| Tool | Purpose |
|------|---------|
| [React](https://react.dev/) 19 + TypeScript | UI framework |
| [Vite](https://vitejs.dev/) 7 | Build tool & dev server |
| [Tailwind CSS](https://tailwindcss.com/) 4 | Utility-first styling |
| [Radix UI](https://www.radix-ui.com/) | Headless UI primitives |
| [Lucide React](https://lucide.dev/) | Icons |
| [GSAP](https://gsap.com/) | Animations |
| [React Router](https://reactrouter.com/) 7 | Routing |
| [ESLint](https://eslint.org/) | Linting |
| Docker | Containerization (see devops) |

### Backend

| Tool | Purpose |
|------|---------|
| [NestJS](https://nestjs.com/) 10 + TypeScript | Node.js framework |
| [Prisma](https://www.prisma.io/) 7 | ORM |
| [PostgreSQL](https://www.postgresql.org/) | Database |
| [Jest](https://jestjs.io/) | Testing |
| ESLint + Prettier | Linting & formatting |
| Docker | Containerization (see devops) |

---

## Project Structure

```
ft_transcendance-42/
├── frontend/                    # React + Vite app
│   ├── src/
│   │   ├── components/          # Reusable UI (ui/, shared/)
│   │   ├── context/             # React context (e.g. Theme)
│   │   ├── features/            # Feature-based modules
│   │   │   ├── Login/
│   │   │   ├── register/
│   │   │   ├── profile/
│   │   │   ├── Settings/
│   │   │   └── chat/
│   │   ├── lib/                 # Utilities
│   │   ├── pages/               # Route-level pages (Hero, HomePage, NotFound, OAuthSuccess)
│   │   └── assets/              # Static assets
│   ├── Dockerfile
│   └── vite.config.ts
│
├── backend/                     # NestJS app
│   ├── src/
│   │   ├── auth/                # Authentication (signup, signin)
│   │   ├── users/               # User module
│   │   ├── profiles/            # Profiles (CRUD, linked to User)
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma        # User, Account (OAuth), Profile
│   ├── generated/prisma/       # Prisma client (generated)
│   ├── docker-compose.yml      # Dev database only (Postgres)
│   └── devops/                 # Full-stack Docker & services
│       ├── docker-compose.yml  # Frontend, auth, database, RabbitMQ, ELK, Swagger, Vault
│       └── backend-services/   # Auth, Prisma, security (Vault, etc.)
│
└── Makefile                     # Docker Compose targets (uses backend/devops/docker-compose.yml)
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker](https://www.docker.com/) & Docker Compose
- pnpm or npm

### Installation

```bash
# Clone the repository
git clone <your-repo-url> ft_transcendance-42
cd ft_transcendance-42

# Frontend
cd frontend && npm install  # or pnpm install

# Backend
cd ../backend && npm install  # or pnpm install
```

### Local development (no full Docker)

```bash
# Start dev database only (from repo root)
cd backend && docker compose up -d

# Backend (from backend/)
npx prisma generate
npm run start:dev

# Frontend (from frontend/)
npm run dev
```

---

## Environment Variables

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/rihla
JWT_SECRET=your_jwt_secret
PORT=3000
```

For the full devops stack, use the `.env` in `backend/devops/` (e.g. `PORT_FRONT`, `PORT_VAULT`, etc.).

---

## Running with Docker

### Option 1: Dev database only

```bash
cd backend && docker compose up -d
# Postgres on localhost:5432
```

### Option 2: Full stack (devops)

```bash
# Build and start all services (frontend, auth, database, RabbitMQ, ELK, Swagger, Vault)
make all

# Or only frontend
make front

# Logs
make logs

# Stop
make stop

# Clean containers, images, volumes, networks
make clean
```

Compose file: `backend/devops/docker-compose.yml`. Services and ports depend on `backend/devops/.env` (e.g. frontend port `PORT_FRONT`, Swagger on 8080, Kibana on 5601).

### Database migrations

```bash
cd backend && npx prisma migrate dev
npx prisma studio   # optional: DB UI
```

---

## API Overview

| Module | Base Route | Description | Status |
|--------|------------|-------------|--------|
| Auth | `/auth` | POST signup, POST signin | ✅ |
| Profiles | `/profiles` | CRUD for user profiles | ✅ |
| Users | `/users` | User resources | ✅ (module present) |

WebSocket gateway and modules for Places, Posts, Groups, Messages, Ratings, and AI Bot are planned and not yet implemented.

---

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

Follow the existing code style; ESLint and Prettier are configured for frontend and backend.

---

## License

This project is licensed under the MIT License.

---