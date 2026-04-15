import { GEMINI_API_KEY } from '../config/env';
import type { Place } from './places';

export function buildPlannerPrompt(city: string, days: number, places: Place[]) {
  const placesContext = places
    .slice(0, 30)
    .map((p, i) => {
      const typeStr = p.types.join(', ');

      return `${i + 1}. ${p.name} [${typeStr}]
   - Address: ${p.address}
   - Google rating: ${p.rating ?? 'N/A'}/5 (${p.userRatingsTotal ?? 0} ratings)
   - Photo available: ${p.photoUrl ? 'yes' : 'no'}`;
    })
    .join('\n\n');

  return `You are an expert travel planner. Create a detailed, personalized ${days}-day trip plan for ${city}.

AVAILABLE PLACES (real Google Places data):
${placesContext}

TASK: Generate a day-by-day itinerary using ONLY places from the list above. Each day should have 3-5 activities that are geographically logical (group nearby places together to minimize travel).

Return ONLY valid JSON matching this exact schema (no markdown, no explanation, just the JSON object):
{
  "title": "string - catchy trip title",
  "summary": "string - 1-2 sentence overview of the trip",
  "days": [
    {
      "day": 1,
      "theme": "string - theme for this day",
      "activities": [
        {
          "time": "HH:MM",
          "name": "string - exact place name from the list",
          "category": "string",
          "description": "string - 1-2 sentences why to visit and what to do",
          "address": "string",
          "duration_minutes": number,
          "tips": "string - 1 practical tip for visiting"
        }
      ]
    }
  ],
  "tips": ["string - up to 3 general tips for the trip"]
}

Rules:
- Use ONLY places from the provided list (copy name and address exactly)
- Assign realistic times starting around 09:00, with breaks for meals
- Group geographically close places on the same day
- Set duration_minutes realistically (museum: 90-120, square: 45-60, park: 60-90)`;
}

export async function generateTripItinerary(city: string, days: number, places: Place[]) {
  const prompt = buildPlannerPrompt(city, days, places);

  const body = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
    }
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  );

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message);
  }

  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Failed to generate itinerary');

  return JSON.parse(rawText);
}
