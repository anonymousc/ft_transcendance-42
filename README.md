This project has been created as part of the 42 curriculum by iouhssei, mel-rhay, aessadik,achahbal, aait-bou

# Rihla — Student Travel Platform for Morocco

## Description:

Rihla is a community-driven travel platform built for students exploring Morocco. It combines location-based discovery, social interaction, and AI-powered support to make travel easier, safer, and more social.

## MVP Features


| Area                     | Description                                                                                                                                  |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Authentication           | Email register/login, logout, **Google + 42 OAuth**, cookie JWT + CSRF, **change password** (local accounts), **link providers** in Settings |
| Users & profiles         | Profiles (username, avatar, bio), edit profile, change-password flow                                                                         |
| File uploads             | Avatars via profiles service                                                                                                                 |
| Location & places        | Google Places discovery, city & saved places, planner integration                                                                            |
| Activity-based discovery | Places categorized by activity type                                                                                                          |
| Ratings & reviews        | Community reviews + aggregates (`review-places`)                                                                                             |
| Real-time                | **friends-service**: REST + WebSockets (chat / notifications; polish ongoing)                                                                |
| AI                       | Trip planner (Gemini) + places suggestions (`places-service`)                                                                                |


## Technical stack

### Frontend technologies and frameworks

- **React** with **TypeScript** for a typed, component-based UI.
- **Vite** as the build tool and dev server for fast iteration and modern ESM output.
- **React Router** for client-side routing.
- **Tailwind CSS** (v4) for utility-first styling, with **Radix UI** primitives and helpers such as **class-variance-authority**, **clsx**, and **tailwind-merge** for consistent, accessible components.
- **GSAP** for motion where richer animation is needed; **Lucide React** for icons.

### Backend technologies and frameworks

- **Node.js** across services, with a **microservices** layout: separate processes for auth, profiles, friends, AI places, reviews, favorites, planner, etc.
- **NestJS** (with **Passport**, **JWT**, validation, **Prisma**) for **auth-service** and **profiles-service**, where a structured module architecture and strong typing pay off for security and user data.
- **Express** for lighter HTTP services (e.g. **friends-service**, **planner-service**, **ai-places-service**, **review-places**, **fav-places**) with **Prisma** where persistence is required.
- **Argon2** for password hashing; **cookie-based sessions** and **CSRF** patterns aligned with the SPA.
- **WebSockets** (`ws` in **friends-service**) for realtime chat and notifications, behind the HTTPS gateway.
- **Google Generative AI** (`@google/generative-ai`) in the planner path; **Gemini** used for trip planning and related AI features.
- **ioredis** and **express-rate-limit** (with Redis backing) for caching and throttling on high-churn routes (e.g. AI and places).

### Database system and why it was chosen

- **PostgreSQL** is the primary relational store (containerized in the stack, with **Prisma** migrations per service).
- It was chosen for **ACID transactions**, a **clear relational model** (users, profiles, reviews, favorites, planner data, etc.), **strong tooling**, and **straightforward scaling** patterns for a multi-service backend. **Prisma** gives schema-first modeling, migrations, and type-safe access from TypeScript/JavaScript services.

### Other significant technologies and libraries

- **Redis** for caching and rate limiting, reducing load on Postgres and external APIs.
- **HashiCorp Vault** (with Docker secrets files) for centralized secret management and bootstrap of credentials.
- **Docker** and **Docker Compose** for reproducible environments and service orchestration.
- **Nginx** with **ModSecurity** as a TLS-terminating **reverse proxy** and API gateway to the internal network.
- **Swagger UI** for API exploration; **Netdata** for monitoring; **Logbull** and a log forwarder for log aggregation (optional depending on configuration).

### Justification for major technical choices

- **Microservices** isolate failure and deployment boundaries (auth vs. profiles vs. realtime vs. AI), match the **ft_transcendence**-style scope, and let each area use the smallest stack that fits (Nest for “core domain” services, Express for focused HTTP/WS workers).
- **Prisma + PostgreSQL** keeps data access consistent and migratable across several repos/services without ad hoc SQL sprawl.
- **Vite + React** prioritizes developer experience and a responsive SPA while staying easy to serve behind a single HTTPS entrypoint.
- **Redis** is a pragmatic addition for **performance and abuse protection** on AI- and search-adjacent endpoints.
- **Vault + gateway** support **security-by-design**: secrets are not baked into images, and traffic can be inspected and routed uniformly.

## Features list

### Public and marketing

- **Landing / hero** (`/`) with discovery entry and navigation.
- **Privacy** (`/privacy`).
- **Healthcheck** (`/healthcheck`) for service URL checks and diagnostics.

### Authentication and account security

- **Registration** (`/register`) and **login** (`/login`).
- **Logout** and session teardown via auth API.
- **Google OAuth** and **42 Intra OAuth**; **OAuth success** handling (`/oauth-success`).
- **HTTP-only cookie** session model with **JWT** and **CSRF** token flow for mutating requests.
- **Change password** for local accounts (`/profile/change-password`).
- **Settings** (`/settings`): linked OAuth providers and related account configuration.

### Profile and preferences

- **Profile** view (`/profile`) and **edit profile** (`/profile/edit`): username, display name, avatar, bio, **interests** (JSON on profile).
- **Avatar upload** via profiles service / uploads path behind the gateway.
- **Interests** onboarding or editing (`/interests`).

### Places, discovery, and content

- **Home** discovery experience (`/home`): search and exploration UI.
- **City** page (`/city`): city-scoped discovery and place detail context.
- **Google Places–backed** discovery and autocomplete (via **ai-places-service** and gateway routes).
- **AI place suggestions** (Gemini + caching) for cities.
- **Saved places** (`/saved`): list and manage favorites (**fav-places**), including **category** metadata per place.
- **Reviews and ratings** for places: create/read community reviews (**review-places**), aggregates exposed to the UI where implemented.

### Trip planning (AI)

- **Planner** (`/planner`): generate and work with **AI trip plans** (Gemini via **planner-service**), persisted as **TripPlan** records (city, days, preferences, JSON plan, dates); **trip plan modal** surfaces per-day **activities** (name, time, category, ratings, favorites).

### Social and realtime

- **Friends** (`/friends`): friend requests and friendships (**friends-service** REST).
- **Web chat** (`/webchat`): **WebSocket**-based messaging (**`ws`**), conversations and messages stored in Postgres.
- **Notifications** (`/notifications`) with **realtime** notification delivery / toasts (**NotificationRealtimeProvider**, glass toast UI).
- **Nav badges** for unread or actionable items where wired.

### Experience and resilience

- **Protected routes** for authenticated sections.
- **Theme** switching (light/dark) via **ThemeProvider**.
- **Global toasts** for feedback (**GlassToastProvider** / stack).
- **404** handling (`NotFoundPage`).


## Instructions

### Prerequisites

- **Docker Engine** with the **Compose V2** plugin (`docker compose …`, as used by the `Makefile`).
- **Git**, to clone the repository.
- **Optional (local development without the full stack):** **Node.js** 18+ (npm or pnpm). Some services (for example `ai-places-service`) document **Node 20+** for running outside Docker; the full stack builds Node versions inside images.
- **OAuth / API access** as needed: Google OAuth, **42 Intra** OAuth, **Google Gemini**, **Google Places** (see secret files below).
- Sufficient disk and RAM for many containers (database, Vault, microservices, reverse proxy, monitoring).

### Configuration

#### 1. Repository root `.env`

`docker-compose.yml` loads **`./.env`** at the repo root for multiple services (including `frontend`). Create it (not committed) before starting the stack. At minimum, define ports and shared settings your deployment expects, for example:

```env
# Ports
PORT_FRONT=5173
PORT_POSTGRES=5432
PORT_VAULT=8200

# CORS / redirects
FRONTEND_URL=http://localhost:5173

# JWT (shared across backend services)
JWT_ACCESS_SECRET=change_me
JWT_ACCESS_EXPIRES_IN=15m

# Postgres — Prisma / services (use a URL that matches your setup; Docker services usually reach Postgres on the compose network)
DATABASE_URL=postgresql://postgres:password@database:5432/rihla

# External APIs (also mirrored for Vault where applicable)
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_PLACES_API_KEY=your_google_places_api_key

# Redis
REDIS_URL=redis://redis:6379
```


#### 2. Vault secret files

The `vault` service mounts Docker **`secrets:`** from **`backend/devops/secrets/`**. Create these files (typically one line each, gitignored) before the first full start:

- `google_client_id`
- `google_client_secret`
- `callback_url`
- `frontend_url`
- `gemini_api_key`
- `google_places`
- `fortytwo_client_id`
- `fortytwo_client_secret`
- `fortytwo_callback`

### Run the project

1. **Clone** the repository and `cd` into the project root.
2. Add **`./.env`** and populate **`backend/devops/secrets/`** as above.
3. Ensure **Docker** is running.
4. From the project root, build and start the full stack:
   ```bash
   make all
   ```
   This runs `docker compose -f ./docker-compose.yml build …` then `up -d` (see Makefile targets below). The first run can take several minutes.
5. Wait until healthchecks settle (especially **Vault**, **database**, then app services).
6. Open the app at **`https://localhost`** (port **443**). The gateway uses a **self-signed** certificate; your browser will warn you—continue for local development.
7. **Logs:** `make logs` or `docker compose -f ./docker-compose.yml logs -f [service]`.
8. **Stop:** `make stop`. **Tear down and remove volumes/images:** `make clean` or `make fclean` (destructive; see Makefile).

**Hostnames behind the gateway (HTTPS on port 443):** the ModSecurity/nginx config uses names such as `auth.localhost`, `netdata.localhost`, and `logbull.localhost` for some tools; the default server handles **`localhost`** for the main UI and API paths.

### Makefile targets

From the repo root, with `DOCKER=docker` and `COMPOSE=./docker-compose.yml`:

| Target | What it does |
| ------ | -------------- |
| `make all` | Full `docker compose` build (`--no-cache`, `--parallel`, `--force-rm`, `--pull`) then `up -d --remove-orphans`. |
| `make front` | Build and start only the `frontend` service. |
| `make logs` | `docker compose … logs -f` (all services), or `logs -f $1` if shell `$1` is set. |
| `make start` / `make stop` | `docker compose … start` / `stop`. |
| `make clean` | Stop stack, `down --remove-orphans --rmi all -v`, then prune listed containers, images, volumes, networks. |
| `make fclean` | `clean` plus `docker system prune -a --volumes -f`. |
| `make re` | `fclean` then `all`. |

**Note:** The `Makefile` defines **`make backend`**, but **`docker-compose.yml` has no `backend` service**, so that target will fail until the compose file and Makefile are aligned. Use **`make all`** for the full stack.


## Team Information

### Ilyass Ouhsseine (iouhssei)  
**Roles:** Product Owner, Project Manager, Frontend Developer  
**Description:**  
Defined and led the product vision of *Rihla*, a travel discovery platform built on a microservices architecture (React / Node.js). Managed the full product lifecycle — from ideation and feature prioritization to delivery — while contributing to frontend development. Focused on AI-powered trip planning, personalized recommendations, and seamless user experience.

---

### Amine Essadiki (aessadik)  
**Roles:** Tech Lead, DevOps Engineer  
**Description:**  
Led the infrastructure and DevOps strategy, ensuring scalability, reliability, and security across services. Designed and maintained CI/CD pipelines, containerized services (Docker), and managed deployment workflows. Oversaw system architecture decisions and performance optimization.

---

### Mohammed El Rhayour (mel-rhay)  
**Roles:** Tech Lead, Backend Developer  
**Description:**  
Architected and developed core backend services using a microservices approach. Designed APIs, handled business logic, and ensured system consistency and performance. Collaborated closely on authentication, data models, and service communication.

---

### Anas Chahlabani (achahbal)  
**Roles:** Mobile Developer  
**Description:**  
Developed the mobile application experience for *Rihla*, focusing on performance, usability, and consistency with the web platform. Integrated APIs and contributed to delivering a smooth cross-platform user experience.

---

### Ali Ait Bouih (aait-bou)  
**Roles:** Backend Developer  
**Description:**  
Contributed to backend service development, including API implementation, database interactions, and feature integration. Worked on ensuring reliability and maintainability of services.

## Project Management

### Team Organization & Task Distribution

The team of five was organized around complementary roles, with each member owning specific domains while collaborating across boundaries:

| Member | Role | Responsibilities |
|--------|------|-----------------|
| Ilyass Ouhsseine (iouhssei) | Product Owner, Project Manager, Frontend Dev | Product vision, feature prioritization, sprint planning, AI features, frontend development |
| Amine Essadiki (aessadik) | Tech Lead, DevOps Engineer | Infrastructure, CI/CD, Docker orchestration, Nginx gateway, Vault, security, deployment |
| Mohammed El Rhayour (mel-rhay) | Tech Lead, Backend Developer | Core backend architecture, API design, auth flows, data models, service communication |
| Anas Chahlabani (achahbal) | Mobile Developer | Mobile application, API integration, cross-platform UX consistency |
| Ali Ait Bouih (aait-bou) | Backend Developer | Backend service development, API implementation, database interactions, feature integration |

### Agile Workflow

The team followed an **Agile methodology** with iterative development cycles:

- **Sprint planning** at the start of each iteration to align on deliverables
- **Daily follow-ups** to track progress and surface blockers early
- **Sprint retrospectives** to improve processes over time
- Features were broken down into actionable tasks with clear ownership
- Continuous delivery was prioritized, with each service independently deployable

### Project Management Tools

- **GitHub Issues & Pull Requests** — task tracking, code review, and change management. Feature branches followed the convention `feature/your-feature-name`; commits followed [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, etc.)
- **GitHub Projects / Kanban board** — visual progress tracking across backlog, in-progress, and done columns

### Communication Channels

- **Discord** — primary async communication channel: dedicated channels per service domain, design decisions, and daily check-ins
- **In-person / video meetings** — sprint planning, retrospectives, architecture discussions, and decisions requiring synchronous alignment

---

## Tech Stack

### Frontend

| Tool | Version | Purpose |
|------|---------|---------|
| [React](https://react.dev/) | 19.2 | Modern UI framework with hooks |
| [Vite](https://vitejs.dev/) | 7.2 | Lightning-fast build tool and dev server |
| [TypeScript](https://www.typescriptlang.org/) | 5.9 | Type-safe JavaScript |
| [Tailwind CSS](https://tailwindcss.com/) | 4.1 | Utility-first styling framework |
| [Radix UI](https://www.radix-ui.com/) | 1.4 | Unstyled, accessible component primitives |
| [React Router](https://reactrouter.com/) | 7.13 | Client-side routing with protected routes |
| [Lucide React](https://lucide.dev/) | 0.563 | Icon library |
| [GSAP](https://gsap.com/) | 3.14 | Animation library |
| [class-variance-authority](https://cva.style/) + [clsx](https://github.com/lukeed/clsx) + [tailwind-merge](https://github.com/dcastil/tailwind-merge) | — | Consistent, conditional class composition |
| [ESLint](https://eslint.org/) | 9 | Code quality & consistency |

**Justification:** React 19 + Vite offers the best developer experience for a fast-moving SPA — near-instant HMR, ESM output, and a component model that scales well across many pages. Tailwind + Radix keeps styling consistent and accessible without a heavy component library. GSAP handles richer animations that CSS transitions can't easily express.

### Backend

| Tool | Version | Purpose |
|------|---------|---------|
| [NestJS](https://nestjs.com/) | 10 | Auth + Profiles microservices (structured modules, DI, guards) |
| [Express](https://expressjs.com/) | 4/5 | Lightweight HTTP services (places, planner, reviews, favorites, friends) |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Type safety across all services |
| [Prisma](https://www.prisma.io/) | 6.x | Schema-first ORM with migrations |
| [Passport.js](http://www.passportjs.org/) | 0.7 | OAuth 2.0 & JWT middleware |
| [Argon2](https://github.com/ranisalt/node-argon2) | — | Industry-standard password hashing |
| [ws](https://github.com/websockets/ws) | — | WebSocket server for real-time chat and notifications |
| [ioredis](https://github.com/luin/ioredis) | — | Redis client for caching and rate limiting |
| [@google/generative-ai](https://ai.google.dev/) | — | Gemini API integration for trip planning |

**Justification:** NestJS is used for the two highest-security services (auth and profiles) where its module system, guards, and dependency injection provide the strongest safety guarantees. Express is used for the remaining, more focused services where a lighter footprint fits better. Separating services this way means a crash or vulnerability in one domain (e.g. AI places) cannot directly bring down authentication.

### Database System

**PostgreSQL 15+** is the primary relational store, accessed through **Prisma** in every service that requires persistence.

**Why PostgreSQL:**
- **ACID transactions** ensure data integrity across reviews, favorites, and user records
- **Strong relational model** fits the domain well — users, profiles, friendships, reviews, and trips all have clear relationships
- **Excellent TypeScript tooling** via Prisma — schema-first modeling, auto-generated migrations, and fully type-safe queries
- **Proven scalability** patterns for when the platform grows
- Each service manages its own Prisma schema and migrations, keeping domain boundaries clean

**Redis 7+** complements PostgreSQL as a caching and rate-limiting layer, reducing load on the database and external APIs on high-churn routes.

### Other Significant Technologies

| Technology | Purpose |
|-----------|---------|
| [Docker](https://www.docker.com/) + Docker Compose | Reproducible environments and full-stack orchestration |
| [Nginx](https://nginx.org/) + [ModSecurity](https://github.com/SpiderLabs/ModSecurity) | TLS-terminating reverse proxy, WAF, and API gateway |
| [HashiCorp Vault](https://www.vaultproject.io/) | Centralized secrets management — credentials never baked into images |
| [Elasticsearch](https://www.elastic.co/) + [Kibana](https://www.elastic.co/kibana) | Centralized log aggregation and visualization |
| [Netdata](https://www.netdata.cloud/) | Real-time system and container metrics |

### Justification for Major Technical Choices

**Microservices architecture:** Each service has independent deployment boundaries and failure domains. A bug in the AI planner cannot take down authentication. It also lets each service use the smallest stack that fits its needs.

**Cookie-based JWT + CSRF:** More secure than storing tokens in `localStorage` for a web SPA. The double-submit CSRF pattern protects mutating requests, and HTTP-only cookies prevent XSS exfiltration.

**Nginx + ModSecurity as gateway:** Traffic inspection, WAF rules, and TLS termination happen in one place, so internal services can communicate over plain HTTP without worrying about encryption and filtering individually.

**Vault for secrets:** API keys and OAuth credentials are injected at runtime rather than committed to the repo or baked into images, aligning with security-by-design principles.

---

## Database Schema

Persistence is **PostgreSQL**, accessed through **Prisma** in each service. The stack uses one database instance; each service ships its own `schema.prisma` and migrations for the tables it owns. `userId` values align with `User.id` from the auth/profiles domain (string CUIDs), so reviews, favorites, chat, and trips all refer to the same identity without cross-schema foreign keys in every service.

### Visual Overview (ER Diagram)

```mermaid
erDiagram
  User ||--o{ Account : "1:N"
  User ||--o| Profile : "0..1"
  Conversation ||--o{ ConversationParticipant : "N:M bridge"
  Conversation ||--o{ Message : "1:N"

  User {
    string id PK
    string email UK
    string hashPassword
    boolean isEmailVerified
    datetime createdAt
    datetime updatedAt
  }

  Account {
    string id PK
    string userId FK
    string provider
    string providerAccountId
    string accessToken
    string refreshToken
    int expiresAt
    datetime createdAt
  }

  Profile {
    string id PK
    string userId FK_UK
    string username UK
    string displayName
    string avatar
    string bio
    string status
    json interests
    datetime createdAt
    datetime updatedAt
  }

  FriendRequest {
    string id PK
    string fromUserId
    string toUserId
    datetime createdAt
    datetime updatedAt
  }

  Friendship {
    string id PK
    string userLowId
    string userHighId
    datetime createdAt
  }

  Conversation {
    string id PK
    datetime createdAt
  }

  ConversationParticipant {
    string conversationId FK
    string userId
  }

  Message {
    string id PK
    string conversationId FK
    string senderId
    string content
    datetime createdAt
  }

  Notification {
    string id PK
    string userId
    string type
    string title
    string body
    json data
    boolean read
    datetime readAt
    boolean archived
    datetime archivedAt
    datetime createdAt
  }

  Review {
    string id PK
    string placeName
    string city
    string userId
    int rating
    string comment
    datetime createdAt
    datetime updatedAt
  }

  SavedPlace {
    string id PK
    string userId
    string placeName
    string city
    string category
    string address
    string image
    string placeId
    float rating
    string status
    datetime savedAt
  }

  TripPlan {
    string id PK
    string userId
    string city
    int days
    json plan
    date tripStartDate
    date tripEndDate
    datetime createdAt
    datetime updatedAt
  }
```

### Tables and Relationships (by Service)

**auth-service / profiles-service:** `User` is the root identity. `Account` rows are many-to-one with `User` (unique on `[provider, providerAccountId]`). `Profile` is an optional one-to-one with `User`. Deleting a user cascades to both accounts and profile.

**friends-service:** `FriendRequest` stores directed requests (unique pair). `Friendship` stores an undirected pair created after acceptance. `Conversation` has many `Message` rows and many users via `ConversationParticipant` (composite PK: `conversationId + userId`). `Notification` is per `userId`, indexed for unread and archive queries.

**review-places:** `Review` — one review per user per place name + city (`@@unique([userId, placeName, city])`).

**fav-places:** `SavedPlace` — one saved row per user per place name + city, with optional `placeId`, `rating`, `image`, and `status`.

**planner-service:** `TripPlan` — per `userId` and `city`, with `days`, `preferences` (Postgres text array), structured `plan` JSON, and optional trip date bounds.

### Key Fields and Data Types

| Category | Fields | Type |
|----------|--------|------|
| **Identifiers** | `User.id`, `Account.id`, `Profile.id`, `FriendRequest.id`, `Friendship.id`, `Notification.id` | `String` — `cuid()` |
| **Identifiers** | `Conversation.id`, `Message.id`, `Review.id`, `SavedPlace.id`, `TripPlan.id` | `String` — `uuid()` |
| **Text** | emails, usernames, provider keys, message content, review comments, place names, addresses | `String` |
| **Booleans** | `User.isEmailVerified`, `Notification.read`, `Notification.archived` | `Boolean` |
| **Numbers** | `Account.expiresAt` (epoch), `Review.rating` (1–5), `TripPlan.days`, `SavedPlace.rating` | `Int` / `Float` |
| **JSON** | `Profile.interests`, `Notification.data`, `TripPlan.plan` (serialized AI itinerary) | `Json` |
| **Arrays** | `TripPlan.preferences` (native Postgres text array) | `String[]` |
| **Timestamps** | `createdAt`, `updatedAt` across all models | `DateTime` |
| **Date-only** | `TripPlan.tripStartDate`, `TripPlan.tripEndDate` | `Date` (`@db.Date`) |



### ft_transcendence Plan (Total Score: 23/14)
----------------------------------------
iouhssei:
    [Minor] Custom-made design system: Reusable components, color palette, typography.
[Major] Recommendation system: Machine learning based on user behavior.[Minor] Use a frontend framework: React, Vue, Angular, Svelte, etc.
mel-rhay:
    [Minor] Notification system: For creation, update, and deletion actions.
[Major] Implement real-time features: WebSockets, real-time updates, efficient broadcasting.[Minor] Use a backend framework: Express, Fastify, NestJS, Django, etc.[Major] Allow users to interact with other users: Chat, Profile, Friends system.
aait-bou:
    [Minor] Use an ORM: Database Object-Relational Mapping.
[Minor] Remote authentication: OAuth 2.0 (Google, GitHub, 42, etc.).
achahbal:
    [Minor] Server-Side Rendering (SSR): Improved performance and SEO.
[Minor] Support for additional browsers: Min 2 additional browsers (Firefox, Safari, etc.).[Minor] Health check & status page.
[Major] Custom Major Module: Substantial technical complexity. Requires justification.
aessadik:
    [Major] WAF/ModSecurity + HashiCorp Vault: Strict WAF config and secure secrets management.
[Major] Backend as microservices: Loosely-coupled services.[Major] Prometheus & Grafana: Monitoring and alerting.

refactor this in markkdown and improve wrinting
3:12 PM
Identified request to restructure and enhance project documentation formatting

The user wants me to reformat and improve the writing of their ft_transcendence plan in markdown.
Done
ft_transcendence — Project Plan

Total Score: 23/14
iouhssei
Type	Module
Minor	Custom Design System — Reusable components, color palette, and typography.
Minor	Frontend Framework — React, Vue, Angular, Svelte, or equivalent.
Major	Recommendation System — Machine learning model based on user behavior.
mel-rhay
Type	Module
Minor	Notification System — Alerts for creation, update, and deletion actions.
Minor	Backend Framework — Express, Fastify, NestJS, Django, or equivalent.
Major	Real-Time Features — WebSocket integration with efficient event broadcasting.
Major	User Interactions — Chat, user profiles, and friends system.
aait-bou
Type	Module
Minor	ORM Integration — Database access via Object-Relational Mapping.
Minor	Remote Authentication — OAuth 2.0 support (Google, GitHub, 42, etc.).
achahbal
Type	Module
Minor	Server-Side Rendering (SSR) — Improved performance and SEO.
Minor	Cross-Browser Support — Compatibility with at least 2 additional browsers (Firefox, Safari, etc.).
Minor	Health Check & Status Page — Service availability monitoring endpoint.
Major	Custom Major Module — Substantial technical complexity; requires written justification.
aessadik
Type	Module
Major	WAF / ModSecurity + HashiCorp Vault — Strict WAF configuration with secure secrets management.
Major	Microservices Architecture — Backend decomposed into loosely-coupled, independently deployable services.
Major	Prometheus & Grafana — Full monitoring stack with metrics collection and alerting.

in markdown
3:12 PM
Deduced user's markdown export preference

Here's your .md file, ready to download or share with the team.
Ft transcendence plan
Document · MD 
Want to be notified when Claude responds?


Claude is AI and can make mistakes. Please double-check responses.
Ft transcendence plan · MD
# ft_transcendence — Project Plan
**Total Score: 23/14**
 
---
 
## iouhssei
| Type | Module |
|------|--------|
| Minor | **Custom Design System** — Reusable components, color palette, and typography. |
| Minor | **Frontend Framework** — React, Vue, Angular, Svelte, or equivalent. |
| Major | **Recommendation System** — Machine learning model based on user behavior. |
| Minor | **Cross-Browser Support** — Compatibility with at least 2 additional browsers (Firefox, Safari, etc.). |  
 
---
 
## mel-rhay
| Type | Module |
|------|--------|
| Minor | **Notification System** — Alerts for creation, update, and deletion actions. |
| Minor | **Backend Framework** — Express, Fastify, NestJS, Django, or equivalent. |
| Major | **Real-Time Features** — WebSocket integration with efficient event broadcasting. |
| Major | **User Interactions** — Chat, user profiles, and friends system. |
| Minor | **Health Check & Status Page** — Service availability monitoring endpoint. |
 
---
 
## aait-bou
| Type | Module |
|------|--------|
| Minor | **ORM Integration** — Database access via Object-Relational Mapping. |
| Minor | **Remote Authentication** — OAuth 2.0 support (Google, GitHub, 42, etc.). |
 
---
 
## achahbal
| Type | Module |
|------|--------|
| Minor | **Server-Side Rendering (SSR)** — Improved performance and SEO. |
| Major | **Custom Major Module** — Substantial technical complexity; requires written justification. |
 
---
 
## aessadik
| Type | Module |
|------|--------|
| Major | **WAF / ModSecurity + HashiCorp Vault** — Strict WAF configuration with secure secrets management. |
| Major | **Microservices Architecture** — Backend decomposed into loosely-coupled, independently deployable services. |
| Major | **Prometheus & Grafana** — Full monitoring stack with metrics collection and alerting. |
 

# Custom Module (Bonus)

# RIHLA-MOBILE - The AI Travel Explorer

---

## 🎖️ Major Module of Choice: AI Travel Orchestration Engine
**Grade: Major Module (2 Points)**

### ∗ Why I chose this module
Traditional travel applications often suffer from a disconnect between data discovery and logistical planning. Furthermore, modern users overwhelmingly prefer to plan and navigate their journeys using mobile devices while on the go. I chose to implement a custom AI Travel Orchestration Engine within a native mobile environment because it meets the user where they are: in the palm of their hand. This project bridges the gap, creating a frictionless transition from raw geospatial discovery to a mathematically logical multi-day itinerary, optimized specifically for the mobile-first traveler.

### ∗ What technical challenges it addresses
1. **The Hallucination Problem**: Large Language Models (LLMs) often generate non-existent locations or outdated addresses. My engine addresses this by implementing a **Custom Prompt Bridge**. Instead of allowing the AI to guess, the engine programmatically injects real-time, verified data from the Google Places API into the LLM context, forcing the AI to work strictly with physical, verifiable landmarks and coordinates.
2. **Geospatial Logic**: Calculating a logical travel sequence for a human (avoiding diagonal zig-zags across a city) requires complex heuristics. The orchestration engine solves this by using AI to group activities based on neighborhood density and logical time-of-day constraints (e.g., matching museum hours with morning slots and restaurants with evening slots).
3. **Structured Data Parsing**: Converting natural language AI thought processes into a strictly-typed JSON schema that a mobile UI can render without crashing is a significant technical hurdle. I implemented a robust parsing layer that enforces a specific schema on every generation.

### ∗ How it adds value to your project
It transforms RIHLA from a simple search directory into a dynamic personal travel assistant. By automating the planning phase, it saves users hours of research and ensures that their trips are geographically optimized. It takes the "guesswork" out of tourism, providing value that standard map applications currently lack.

### ∗ Why it deserves Major module status (2 points)
This module is substantial because it involves a complex **multi-stage pipeline**:
- **Stage 1 (Live Data Acquisition)**: Asynchronous fetching of real-world geospatial datasets.
- **Stage 2 (Contextual Injection)**: Transforming raw JSON into a natural language context for the LLM.
- **Stage 3 (AI Orchestration)**: Using `Gemini-2.5-Flash` to solve the combinatorial problem of itinerary design.
- **Stage 4 (Dynamic UI Rendering)**: Mapping a complex AI-generated payload into a vertical timeline interface with deep-linked native GPS actions.
By integrating disparate state-of-the-art technologies (React Native + Google Maps + Google Generative AI) into one seamless system, this module demonstrates high technical complexity and creativity far beyond a standard feature.

---

## ⚙️ Tech Stack
- **Framework**: React Native / Expo (TS)
- **Navigation**: Native Stack
- **APIs**: Google Places, Google Gemini 2.5 Flash
- **Target**: iOS Only

```bash
npm run ios
```

