# planner-service

AI-powered trip planner microservice. Generates personalized day-by-day itineraries by orchestrating the **AI Places service** and **Favorites service**, then using a **local Mistral 7B model via Ollama** to organize the results into a structured travel plan.

> This service contains no world knowledge of its own. It delegates place discovery to `ai-places-service` and uses Mistral purely as a local reasoning engine to organize, theme, and schedule the places it receives.

---

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18 |
| Framework | Express.js |
| Local LLM | Mistral 7B via Ollama |
| Containerization | Docker |
| Inter-service | HTTP (fetch) |

---

## Port

```
7000
```

---

## Environment variables

Create a `.env` file at the root of this service:

```env
PORT=7000
AI_PLACES_URL=http://ai-places-service:4000
FAVORITES_URL=http://favorites-service:6000
OLLAMA_URL=http://ollama:11434
```

> In local development without Docker Compose, use `http://localhost:4000`, `http://localhost:6000`, and `http://localhost:11434`.

---

## Project structure

```
planner-service/
├── src/
│   ├── server.js          # Express app + route registration
│   ├── routes/
│   │   └── planner.js     # POST /plan/generate, GET /plan/health
│   └── ollama.js          # callOllama() helper
├── .env
├── Dockerfile
├── package.json
└── README.md
```

---

## Dockerfile

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 7000
CMD ["node", "src/server.js"]
```

---

## Ollama setup

Ollama runs as a **separate Docker container** alongside this service. It exposes a REST API on port `11434`.

### Pull the model (run once)

```bash
# standard — needs ~5GB RAM
docker exec -it ollama ollama pull mistral

# quantized — needs ~3GB RAM, recommended for most machines
docker exec -it ollama ollama pull mistral:7b-instruct-q4_0
```

### docker-compose.yml (add to your root compose file)

```yaml
services:
  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama

  planner-service:
    build: ./planner-service
    ports:
      - "7000:7000"
    env_file: ./planner-service/.env
    depends_on:
      - ollama
      - ai-places-service
      - favorites-service

volumes:
  ollama_data:
```

---

## API endpoints

---

### `POST /plan/generate`

Generates a day-by-day trip plan for a city. Internally calls the AI Places service for personalized place suggestions, the Favorites service to exclude already-visited places, then uses Mistral to organize results into a themed schedule.

**Request body**

```json
{
  "userId": "abc123",
  "city": "Marrakech",
  "days": 3,
  "preferences": ["history", "food", "outdoor"]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `userId` | string | No | If provided, visited places are excluded from the plan |
| `city` | string | Yes | City to plan the trip for |
| `days` | number | No | Number of days (default: 3, max: 7) |
| `preferences` | string[] | No | User interests to guide place selection |

**Response `200`**

```json
{
  "plan": {
    "city": "Marrakech",
    "days": [
      {
        "day": 1,
        "theme": "History & Architecture",
        "places": [
          {
            "name": "Bahia Palace",
            "category": "Museum",
            "description": "A stunning 19th-century palace with intricate Moroccan craftsmanship.",
            "best_time": "Morning",
            "duration": "1–2 hours",
            "image": "https://images.unsplash.com/..."
          }
        ]
      }
    ]
  },
  "meta": {
    "city": "Marrakech",
    "days": 3,
    "preferences": ["history", "food", "outdoor"],
    "visitedExcluded": 2
  }
}
```

| Field | Description |
|---|---|
| `plan.days[].theme` | Mistral-generated theme for the day based on grouped places |
| `plan.days[].places[].best_time` | Suggested time of day to visit |
| `plan.days[].places[].duration` | Estimated visit duration |
| `meta.visitedExcluded` | How many places were skipped because user already visited them |

**Error responses**

| Status | Meaning |
|---|---|
| `400` | `city` is missing |
| `502` | Ollama model not responding |
| `500` | Internal error (upstream service down, parse failure) |

---

### `GET /health`

Returns service status. Also checks if Ollama is reachable.

**Response `200`**

```json
{
  "status": "ok",
  "service": "planner-service",
  "ollama": "reachable"
}
```

If Ollama is down:

```json
{
  "status": "degraded",
  "service": "planner-service",
  "ollama": "unreachable"
}
```

---

## Internal flow

```
POST /plan/generate
        │
        ├─── 1. GET /favorites/:userId/visited/names  →  Favorites service
        │         returns: ["Jemaa el-Fna", "Majorelle Garden"]
        │
        ├─── 2. POST /places/suggest                  →  AI Places service
        │         sends: { city, preferences, visited }
        │         returns: 8–10 ranked place objects with images
        │
        └─── 3. POST http://ollama:11434/api/generate →  Mistral 7B (local)
                  sends: place list + organize instruction
                  returns: { days: [{ day, theme, places[] }] }
                        │
                        └─── enrich each place with image from step 2
                             return final plan to frontend
```

---

## How Mistral is used

Mistral does **one task only** — it receives a flat list of places and organizes them into a logical day-by-day schedule with themes. It does not generate new places, descriptions, or ratings. All content comes from the AI Places service.

**Prompt sent to Mistral:**

```
You are a trip planning assistant.
Organize the following places in {city} into a {days}-day itinerary.
Group them by theme and geography. Give each day a short theme name.
Respond ONLY with valid JSON. No markdown, no extra text.

Schema:
{
  "days": [
    {
      "day": 1,
      "theme": "string",
      "places": [
        {
          "name": "string",
          "category": "string",
          "description": "string",
          "best_time": "Morning | Afternoon | Evening",
          "duration": "string"
        }
      ]
    }
  ]
}

Places to organize:
- Bahia Palace (Museum): A stunning 19th-century palace...
- Jemaa el-Fna (Square): The beating heart of Marrakech...
...
```

---

## Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0"
  }
}
```

No database. No ORM. No extra AI SDK — Ollama exposes a plain REST API.

---

## Running locally (without Docker)

```bash
# 1. install Ollama on your machine
# https://ollama.com/download

# 2. pull the model
ollama pull mistral:7b-instruct-q4_0

# 3. install deps
npm install

# 4. set .env to use localhost URLs
# AI_PLACES_URL=http://localhost:4000
# FAVORITES_URL=http://localhost:6000
# OLLAMA_URL=http://localhost:11434

# 5. start
node src/server.js
```

---

## Presentation talking points

- **Two AI models, two justified roles** — Gemini for world knowledge (place data), Mistral for local reasoning (organization). Each chosen for what it does best.
- **Zero external dependency for planning** — Mistral runs inside Docker, no API key, no cost, no rate limits.
- **Pure orchestrator pattern** — this service owns no data and calls three upstream sources per request. Removing it doesn't break any other service.
- **Personalization loop** — visited places from the Favorites service are excluded from every plan, so the itinerary improves as the user explores more.