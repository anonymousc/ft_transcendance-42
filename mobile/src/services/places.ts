import { useEffect, useState } from 'react';
import { GOOGLE_PLACES_API_KEY } from '../config/env';

export interface Place {
  placeId?: string;
  name: string;
  types: string[];
  rating: number | null;
  userRatingsTotal: number | null;
  address: string;
  photoUrl: string | null;
  photos?: string[];
  mapsUrl: string;
}

export function usePlaceSearch(query: string) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setPlaces([]);
      return;
    }

    setLoading(true);
    setError(null);

    if (!GOOGLE_PLACES_API_KEY) {
      setError('Google Places API key is missing.');
      setLoading(false);
      return;
    }


    let cancelled = false;
    fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(trimmedQuery + ' points of interest')}&key=${encodeURIComponent(GOOGLE_PLACES_API_KEY)}`,
    )
      .then((response) => response.json())
      .then((payload: any) => {
        if (payload.status !== 'OK' && payload.status !== 'ZERO_RESULTS') {
          throw new Error(payload.error_message || payload.status || 'Failed to load Google Places');
        }
        if (!cancelled) {
          const mapped = (payload.results ?? []).map((item: any) => ({
            placeId: item.place_id,
            name: item.name,
            types: item.types?.slice(0, 3) || [],
            rating: item.rating || null,
            userRatingsTotal: item.user_ratings_total || null,
            address: item.formatted_address || item.vicinity,
            photoUrl: item.photos?.[0] ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${item.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}` : null,
            mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name)}&query_place_id=${item.place_id}`,
          }));
          setPlaces(mapped);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  return { places, loading, error };
}
