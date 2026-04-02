const FAV_PLACES_URL = process.env.FAV_PLACES_URL || 'http://localhost:4002';
const REVIEW_PLACES_URL = process.env.REVIEW_PLACES_URL || 'http://localhost:4001';

async function fetchUserFavorites(userId, city) {
  try {
    let url = `${FAV_PLACES_URL}/fav-places/internal/${encodeURIComponent(userId)}`;
    if (city) url += `?city=${encodeURIComponent(city)}`;
    const res = await fetch(url);

    if (!res.ok) {
      console.warn(`[service-client] fav-places returned ${res.status} for userId=${userId}`);
      return [];
    }

    const json = await res.json();
    if (!json.ok || !Array.isArray(json.data)) return [];

    return json.data;
  } catch (err) {
    console.warn(`[service-client] Failed to fetch favorites for userId=${userId}:`, err.message);
    return [];
  }
}

async function fetchReviewSummary(placeName, city) {
  try {
    const url = `${REVIEW_PLACES_URL}/reviews/summary?place=${encodeURIComponent(placeName)}&city=${encodeURIComponent(city)}`;
    const res = await fetch(url);

    if (!res.ok) {
      console.warn(`[service-client] review-places returned ${res.status} for ${placeName}`);
      return null;
    }

    const json = await res.json();
    if (!json.ok || !json.data) return null;

    return json.data;
  } catch (err) {
    console.warn(`[service-client] Failed to fetch review summary for ${placeName}:`, err.message);
    return null;
  }
}

async function fetchReviewSummariesForPlaces(places, city) {
  const results = await Promise.allSettled(
    places.map(place => fetchReviewSummary(place.name, city))
  );

  return results.reduce((acc, result, index) => {
    acc[places[index].name] = result.status === 'fulfilled' ? result.value : null;
    return acc;
  }, {});
}

module.exports = { fetchUserFavorites, fetchReviewSummary, fetchReviewSummariesForPlaces };
