function formatInterestsSection(interests) {
  if (!interests || typeof interests !== 'object') return '';

  const hobbies = Array.isArray(interests.hobbies) ? interests.hobbies.join(', ') : '';
  const activities = Array.isArray(interests.activities) ? interests.activities.join(', ') : '';
  const foods = Array.isArray(interests.foods) ? interests.foods.join(', ') : '';
  const topics = Array.isArray(interests.topics) ? interests.topics.join(', ') : '';
  const travelStyle = Array.isArray(interests.travelStyle) ? interests.travelStyle.join(', ') : '';

  const lines = [];
  if (hobbies) lines.push(`- Hobbies: ${hobbies}`);
  if (activities) lines.push(`- Activities: ${activities}`);
  if (foods) lines.push(`- Preferred foods: ${foods}`);
  if (topics) lines.push(`- Topics of interest: ${topics}`);
  if (travelStyle) lines.push(`- Travel style: ${travelStyle}`);

  if (lines.length === 0) return '';

  return `
USER INTERESTS:
${lines.join('\n')}
`;
}

function buildPlannerPrompt(
  {
    city,
    days,
    preferences,
    places,
    favorites,
    reviewSummaries,
    tripStartLabel = null,
    tripEndLabel = null,
  },
  interests = null,
) {
  const favNames = new Set(favorites.map(f => f.placeName?.toLowerCase()));

  const placesContext = places
    .slice(0, 20)
    .map((p, i) => {
      const isFav = favNames.has(p.name?.toLowerCase());
      const review = reviewSummaries?.[p.name];
      const reviewStr = review
        ? `community rating: ${review.averageRating ?? 'N/A'}/5 (${review.totalReviews} reviews)`
        : 'no community reviews yet';
      const openingHours = p.openingHours ? p.openingHours.slice(0, 2).join(', ') : 'hours unknown';

      return `${i + 1}. ${p.name} [${p.category}]
   - Address: ${p.address}
   - Google rating: ${p.rating ?? 'N/A'}/5 (${p.userRatingCount ?? 0} ratings)
   - ${reviewStr}
   - Description: ${p.description}
   - Coordinates: ${p.lat}, ${p.lng}
   - Opening hours: ${openingHours}
   - Photo available: ${p.image ? 'yes' : 'no'}
   - User's favorite: ${isFav ? 'YES - prioritize this place' : 'no'}`;
    })
    .join('\n\n');

  const prefsStr = preferences.length > 0 ? preferences.join(', ') : 'general sightseeing';

  const tripDatesLine =
    tripStartLabel && tripEndLabel
      ? `
TRIP CALENDAR: The traveler chose these exact dates (inclusive): ${tripStartLabel} through ${tripEndLabel}.
Day 1 of the itinerary = ${tripStartLabel}. Day 2 = the next calendar day, and so on for all ${days} days.
`
      : '';

  const interestsSection = formatInterestsSection(interests);
  const interestsRules = interestsSection
    ? `
- Align restaurant and meal-related stops with the user's preferred foods where possible from the place list
- Match day activities to the user's hobbies and preferred activities where they fit real places in the list
- Add extra depth and context to landmark and cultural stops based on the user's topics of interest
- Shape overall pace, budget tone, and accommodation-style suggestions (when relevant) to match the user's travel style
`
    : '';

  return `You are an expert travel planner. Create a detailed, personalized ${days}-day trip plan for ${city}.
${tripDatesLine}
USER PREFERENCES: ${prefsStr}
${interestsSection}
AVAILABLE PLACES (real Google Places data):
${placesContext}

TASK: Generate a day-by-day itinerary using ONLY places from the list above. Each day should have 3-5 activities that are geographically logical (group nearby places together to minimize travel). Include the user's favorite places (marked "YES") on appropriate days.

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
          "rating": number or null,
          "image": "string or null - photo URL from the list",
          "lat": number or null,
          "lng": number or null,
          "is_favorite": boolean,
          "review_summary": { "averageRating": number or null, "totalReviews": number } or null,
          "duration_minutes": number,
          "tips": "string - 1 practical tip for visiting"
        }
      ]
    }
  ],
  "tips": ["string - up to 3 general tips for the trip"]
}

Rules:
- Use ONLY places from the provided list (copy name, address, coordinates exactly)
- Assign realistic times starting around 09:00, with breaks for meals
- Group geographically close places on the same day
- Include all user favorites (is_favorite: true) if possible
- Match activities to user preferences where applicable
- Set duration_minutes realistically (museum: 90-120, square: 45-60, park: 60-90)
- Include a lunch break (12:30-13:30) and dinner (19:00-21:00) as appropriate
${interestsRules}`;
}

module.exports = { buildPlannerPrompt };
