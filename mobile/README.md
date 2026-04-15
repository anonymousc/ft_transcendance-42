# RIHLA - The AI Travel Explorer

Welcome to the **RIHLA MVP**. This document is designed to serve as both technical documentation and a **presentation script** to help you easily explain how this application works to developers, evaluators, or investors.

---

## 🎯 The Pitch: What is RIHLA?

*"RIHLA is a modern mobile application built for iOS that revolutionizes how people discover new cities. Instead of manually Googling places and building spreadsheets for your trips, RIHLA acts as an automated compass. It connects directly to live Google Maps data to show you the best spots in a city, and then uses Google's powerful Gemini AI to mathematically build out a personalized, day-by-day travel itinerary for you."*

---

## 🗣️ HOW TO EXPLAIN THE CODE (Presentation Script)

If you are asked "How does the code work?", open the codebase and use this exact script to guide them through the files. Show them the code while you explain it:

### Step 0: The Entry Point (`index.ts` & `App.tsx`)
**Open `index.ts` then `App.tsx` and say:**
> *"The app starts at `index.ts`, which boots up the environment. The real logic begins in `App.tsx` at the root. I simplified the architecture by keeping the entire Navigation stack here. As you can see, I use a 'Native Stack Navigator' which allows the app to feel like a real iOS app with smooth transitions between the Welcome, Search, and AI Planning screens."*

### Step 1: Explain the Setup (`src/config/env.ts`)
**Open `env.ts` and say:**
> *"The app relies on two powerful live APIs: Google Places and Google Gemini. I structured the environment file to securely load these keys dynamically so the app is completely serverless. It requires no backend database to run."*

### Step 2: Explain the Data Fetcher (`src/services/places.ts`)
**Open `places.ts` (Point to `usePlaceSearch`) and say:**
> *"When a user searches for a city, this is the engine that fires. I built a custom React hook that talks to Google's Places Text-Search API. Instead of just searching 'Casablanca', my code strictly appends the phrase 'points of interest' under the hood. As you can see around line 40, my code takes Google's payload, strips out all the junk data we don't need, and cleanly formats an array of strictly-typed `Place` objects with their names, coordinates, and high-res photo URLs so the app stays lightning-fast and doesn't get slowed down by heavy JSON objects."*

### Step 3: Explain the AI Bridge (`src/services/planner.ts`)
**Open `planner.ts` (Point to `buildPlannerPrompt`) and say:**
> *"This file is my favorite part of the architecture—it's the AI bridge. Other travel apps let AI just guess and 'hallucinate' fake restaurants. I don't."*
> *"As you can see, `buildPlannerPrompt` takes the live array of 30 physical places we just fetched from Google. It mathematically loops through them, extracts their real addresses and real ratings, and maps them into a huge string context block."*  
> *"Then, `generateTripItinerary` sends that massive block directly to the `gemini-2.5-flash` model. The precise prompt forces Gemini to act strictly as a JSON generator. The AI is only allowed to use the real places provided to build out a logical, day-by-day itinerary."*

### Step 4: Explain the Views (`src/screens`)
**Open `PlannerScreen.tsx` and say:**
> *"Once the AI sends back the JSON itinerary, `PlannerScreen.tsx` catches it. Instead of showing the user raw text, I've used React Native to map over the JSON object and programmatically build a beautiful vertical timeline. It calculates the durations, groups the morning and afternoon activities, and renders exact clickable location markers."*

**Open `PlaceDetailsScreen.tsx` and say:**
> *"Finally, for individual discovery, I built highly isolated detail views. One thing I'm proud of here is the 'Get Directions' button. If you look at how I mapped `mapsUrl`, I don't just pass coordinates to the iOS device. I programmatically encode the exact place name alongside the Google `query_place_id` to ensure that Apple SDKs and Android SDKs perfectly route a deep-link straight into the native Maps applications flawlessly."*

---

## 🚀 How to Demo the App (Action Guide)

When presenting or testing the app, follow this guided flow to show off its best features:

**1. Open the App:**
* Point out the premium, high-end "dark mode" aesthetics and how the UI feels natively clean without unnecessary, cluttered buttons or dummy tabs.

**2. Demonstrate the Deep Linking (Maps):**
* Search a city like *"Casablanca"*.
* Click on a card (e.g., Hassan II Mosque) to jump to the details.
* Tap the floating **"Get Directions"** button.
* *Explain:* "Notice how it directly opens your Maps app precisely pinned to the location without any weird redirects."

**3. Demonstrate the AI Trip Planner:**
* Go back to the Welcome screen and tap **"✨ AI Trip Planner"**.
* Type in a city and "5 Days". Hit Generate.
* *Explain:* "Right now, the app is firing our custom hook, pulling 30 live Google locations, drafting the prompt bridge, and bounding it off Gemini..."
* Once the UI loads the timeline, point out how the AI correctly groups activities into Morning/Afternoon blocks, estimates time duration correctly, and provides localized tips.

---

## ⚙️ Setup & Tech Stack Summary

- **Framework**: React Native with Expo (Typescript)
- **Navigation**: React Navigation Native Stack
- **Styling**: Vanilla Stylesheets + Expo Linear Gradient + Lucide React Native Icons
- **APIs Integrated**: Google Places Platform (TextSearch/Photos), Google Generative Language API (Gemini-2.5-Flash)
- **Deployment Targets**: iOS (Exclusively curated via `app.json`)

To run the project locally:
```bash
npm run ios
```
