This project has been created as part of the 42 curriculum by iouhssei, mel-rhay, ,

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


## Database schema

Persistence is **PostgreSQL**, accessed through **Prisma** in each service. Deployments typically use **one database instance**; each service ships its own `schema.prisma` and migrations for the tables it owns. **`userId` values** line up with **`User.id`** from the auth/profiles domain (string CUIDs) so reviews, favorites, chat, and trips all refer to the same identity without cross-schema foreign keys in every service.

### Visual overview

The diagram below shows **relational structure inside Postgres** (logical ER view). Models that only store `userId` as a string are linked conceptually to **User**, not enforced by a database foreign key in that service’s Prisma file.

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

### Tables and relationships (by service)

- **auth-service / profiles-service** (same model definitions in both Prisma schemas): **`User`** is the root identity. **`Account`** rows are **many-to-one** to **`User`** (OAuth or local provider rows; unique on `[provider, providerAccountId]`). **`Profile`** is **optional one-to-one** with **`User`** (`userId` unique). Deleting a user cascades to accounts and profile.
- **friends-service**: **`FriendRequest`** stores directed requests (`fromUserId`, `toUserId`, unique pair). **`Friendship`** stores an undirected pair (`userLowId`, `userHighId`, unique pair) after acceptance. **`Conversation`** has many **`Message`** rows and many users via **`ConversationParticipant`** (composite primary key `conversationId` + `userId`). **`Notification`** is per **`userId`**, with indexes for unread and archive queries.
- **review-places**: **`Review`** — one review per user per place name + city (`@@unique([userId, placeName, city])`).
- **fav-places**: **`SavedPlace`** — one saved row per user per place name + city (`@@unique([userId, placeName, city])`), with optional Google-style **`placeId`**, **`rating`**, **`image`**, and a **`status`** string (e.g. favorited).
- **planner-service**: **`TripPlan`** — per **`userId`** and **`city`**, with **`days`**, **`preferences`** (Postgres text array in Prisma), structured **`plan`** JSON, and optional **`tripStartDate` / `tripEndDate`**.

### Key fields and types (summary)

- **Identifiers:** `User.id`, `Account.id`, `Profile.id`, `FriendRequest.id`, `Friendship.id`, `Notification.id` use **string** IDs with **`cuid()`** defaults where specified; **UUID** defaults for `Conversation.id`, `Message.id`, `Review.id`, `SavedPlace.id`, `TripPlan.id`.
- **Strings:** emails, usernames, provider keys, message **content**, review **comment**, notification **type/title/body**, place **names/cities/addresses**, etc.
- **Booleans:** `User.isEmailVerified`, `Notification.read`, `Notification.archived`.
- **Numbers:** `Account.expiresAt` (int epoch or provider-specific), **`Review.rating`** (int), **`TripPlan.days`** (int), **`SavedPlace.rating`** (float, optional).
- **JSON:** `Profile.interests`, `Notification.data`, **`TripPlan.plan`** (serialized itinerary / AI output).
- **Arrays:** `TripPlan.preferences` is **`String[]`** (native Postgres array in Prisma).
- **Dates/times:** `DateTime` fields for created/updated timestamps; **`TripPlan`** uses **`Date`** (`@db.Date`) for trip bounds.

---

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

### Run the project (step by step)

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

### Ilyass Ouhsseine (<iouhssei>)  
**Roles:** Product Owner, Project Manager, Frontend Developer  
**Description:**  
Defined and led the product vision of *Rihla*, a travel discovery platform built on a microservices architecture (React / Node.js). Managed the full product lifecycle — from ideation and feature prioritization to delivery — while contributing to frontend development. Focused on AI-powered trip planning, personalized recommendations, and seamless user experience.

---

### Amine El (<intra_un>)  
**Roles:** Tech Lead, DevOps Engineer  
**Description:**  
Led the infrastructure and DevOps strategy, ensuring scalability, reliability, and security across services. Designed and maintained CI/CD pipelines, containerized services (Docker), and managed deployment workflows. Oversaw system architecture decisions and performance optimization.

---

### Mohammed El Rhayour (mel-rhay)  
**Roles:** Tech Lead, Backend Developer  
**Description:**  
Architected and developed core backend services using a microservices approach. Designed APIs, handled business logic, and ensured system consistency and performance. Collaborated closely on authentication, data models, and service communication.

---

### Anass El (<intra_us>)  
**Roles:** Mobile Developer  
**Description:**  
Developed the mobile application experience for *Rihla*, focusing on performance, usability, and consistency with the web platform. Integrated APIs and contributed to delivering a smooth cross-platform user experience.

---

### Ali El (<intra_us>)  
**Roles:** Backend Developer  
**Description:**  
Contributed to backend service development, including API implementation, database interactions, and feature integration. Worked on ensuring reliability and maintainability of services.

---

## Product Management

### Product Strategy & Vision
- Defined *Rihla* as a personalized travel discovery platform leveraging AI to enhance trip planning.
- Identified key user problems and aligned features with user needs and business goals.

### Roadmap & Planning
- Created and maintained the product roadmap.
- Prioritized features based on impact, feasibility, and deadlines (final-year project constraints).
- Broke down features into actionable tasks and coordinated execution across teams.

### Agile Execution
- Followed Agile methodologies with iterative development cycles.
- Organized and led sprint planning, daily follow-ups, and retrospectives.
- Ensured continuous delivery and alignment between frontend, backend, and DevOps.

### Cross-Team Collaboration
- Acted as the bridge between technical and product perspectives.
- Coordinated between backend, frontend, mobile, and DevOps teams.
- Ensured clear communication of requirements and technical constraints.

### Quality & Delivery
- Validated features against project requirements and user expectations.
- Ensured timely delivery and overall product coherence.
- Monitored performance, usability, and reliability across the platform.

### Innovation & AI Integration
- Integrated AI-driven features such as trip planning and personalized recommendations.
- Explored ways to enhance user engagement through smart automation and data-driven insights.



