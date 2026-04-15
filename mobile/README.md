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
