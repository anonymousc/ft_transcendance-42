# ai-places-service

A lightweight Express microservice that generates AI-curated place recommendations for any city using **Google Gemini** and enriches each result with a photo URL from the **Unsplash API**.

---

## How it works

```
Client
  └── GET /places?city=Marrakesh
        └── Check Redis cash
              ├── HIT  → return cached JSON immediately
              └── MISS → Gemini Flash (generate 10 places)
                           └── Unsplash (fetch image per place, parallel)
                                 └── Cache & return enriched JSON
```

---

## Tech stack

| Package | Purpose |
|---------|---------|
| [Express 5](https://expressjs.com/) | HTTP server |
| [dotenv](https://github.com/motdotla/dotenv) | Load `.env` variables |
| [cors](https://github.com/expressjs/cors) | Allow cross-origin requests from the frontend |
| Node.js built-in `fetch` | HTTP calls to Gemini & Unsplash (Node 20+) |

---

## Getting started

### Prerequisites

- Node.js ≥ 20
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)
- An [Unsplash Access Key](https://unsplash.com/developers)

### Install

```bash
cd backend/src/ai-places-service
npm install
```

### Environment variables

Create a `.env` file in `backend/src/ai-places-service/`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
PORT=4000          # optional, defaults to 4000
```

### Run (development)

```bash
npm run startDev   # nodemon — auto-restarts on file changes
```

### Run (production / Docker)

```bash
node src/server.js
```

---

## Docker

A `Dockerfile` is provided at the root of this service. Build and run:

```bash
# From the repo root
docker build -t ai-places-service ./backend/src/ai-places-service
docker run -p 4000:4000 --env-file ./backend/src/ai-places-service/.env ai-places-service
```

Or via the root `docker-compose.yml`:

```bash
docker compose up ai-places
```

The service is defined as:

```yaml
ai-places:
  build: ./backend/src/ai-places-service
  container_name: ai-places
  ports:
    - "4000:4000"
  env_file:
    - ./backend/src/ai-places-service/.env
  networks:
    - saas
  restart: on-failure
```

---

## API reference

### `GET /places`

Returns 10 AI-generated place recommendations for a given city, each enriched with an Unsplash image URL.

#### Query parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `city` | string | Yes | Name of the city to query (e.g. `Marrakesh`, `Casablanca`) |

#### Success response — `200 OK`

```json
[
  {
    "name": "Jardin Majorelle",
    "category": "Park",
    "rating": 4.7,
    "description": "An enchanting botanical garden famous for its vibrant cobalt blue villa...",
    "address": "Rue Yves St Laurent, Marrakesh 40000",
    "must_visit": true,
    "image_query": "Jardin Majorelle Marrakech garden",
    "image": "https://images.unsplash.com/photo-xxxx?..."
  }
]
```

#### Place object schema

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Name of the place |
| `category` | string | Type — e.g. `Museum`, `Park`, `Market`, `Restaurant`, `Historical Site`, `Monument`, `Beach` |
| `rating` | number | Score between 1.0 and 5.0 |
| `description` | string | Two sentences explaining why it is worth visiting |
| `address` | string | Full street address |
| `must_visit` | boolean | `true` for the top 3 highlights of the city |
| `image_query` | string | The search phrase used to fetch the Unsplash photo |
| `image` | string \| null | Unsplash image URL, or `null` if the photo fetch failed |

#### Error responses

| Status | Body | Cause |
|--------|------|-------|
| `400` | `{ "error": "city query parameter is required" }` | `city` param missing or empty |
| `500` | `{ "error": "Failed to fetch places", "details": "..." }` | Gemini or JSON parse failure |

---

### `GET /health`

Simple liveness check.

```json
{ "status": "ok" }
```

---

## Caching

Responses are cached **in memory** per city name (case-insensitive) for **1 hour**. Repeated requests for the same city within that window are served instantly without calling either API.

The cache is cleared on process restart.

---

## Rate limiting & retries

The Gemini free tier enforces:

- **15 requests per minute** per model
- **1,500 requests per day** per model

When a `429 RESOURCE_EXHAUSTED` response is received, the service reads the `retryDelay` value from the error payload (e.g. `"17s"`) and automatically retries **once** after that delay. If the retry also fails, the error is propagated to the client as a `500`.

To avoid hitting limits during development, keep the 1-hour cache active and avoid restarting the server unnecessarily.

---

## Project context

This service is part of the **Rihla** student travel platform. It feeds the `CityPage` in the React frontend, which displays the cards in a horizontal scrollable list with Unsplash imagery blended into each card via a gradient overlay.

Frontend integration:

```
VITE_AI_PLACES_URL=http://localhost:4000   # frontend/.env
```

The `CityPage` calls `GET /places?city=<input>` on form submit and renders the response as animated place cards.
