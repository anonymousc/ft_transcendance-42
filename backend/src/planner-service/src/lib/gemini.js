const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildPlannerPrompt } = require('./prompt.builder');

let genAI = null;

function getClient() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

async function generateTripPlan({
  city,
  days,
  preferences,
  places,
  favorites,
  reviewSummaries,
  interests = null,
  tripStartLabel = null,
  tripEndLabel = null,
}) {
  const client = getClient();
  const model = client.getGenerativeModel({ model: 'gemini-3.5-flash' });

  const prompt = buildPlannerPrompt(
    {
      city,
      days,
      preferences,
      places,
      favorites,
      reviewSummaries,
      tripStartLabel,
      tripEndLabel,
    },
    interests,
  );

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    const preview = String(text).slice(0, 280).replace(/\s+/g, ' ').trim();
    throw new Error(
      `Gemini returned no JSON object (expected a single {...} trip plan). Preview: ${preview}`,
    );
  }

  let plan;
  try {
    plan = JSON.parse(jsonMatch[0]);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(
      `Gemini JSON was not parseable (${msg}). Snippet: ${jsonMatch[0].slice(0, 200)}`,
    );
  }

  if (!plan.days || !Array.isArray(plan.days)) {
    throw new Error('Gemini response missing required "days" array');
  }

  return plan;
}

module.exports = { generateTripPlan };
