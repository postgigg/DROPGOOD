const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export interface MapboxSearchResult {
  id: string;
  name: string;
  full_address: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude: number;
  longitude: number;
  distance_miles?: number;
  maki?: string;
  categories?: string[];
}

export interface AddressSearchResult {
  full_address: string;
  name: string;
  place_formatted: string;
  mapbox_id: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export async function searchAddress(query: string): Promise<AddressSearchResult[]> {
  if (!query || query.length < 3) return [];

  try {
    const url = `https://api.mapbox.com/search/searchbox/v1/suggest?` +
      `q=${encodeURIComponent(query)}&` +
      `language=en&` +
      `country=US&` +
      `limit=5&` +
      `session_token=${Date.now()}&` +
      `access_token=${MAPBOX_TOKEN}`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error('Mapbox address search failed:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    console.log('📍 Mapbox Search Box API response:', data);

    if (!data.suggestions || data.suggestions.length === 0) {
      console.warn('No suggestions returned from Mapbox');
      return [];
    }

    return data.suggestions.map((suggestion: any) => ({
      full_address: suggestion.full_address || suggestion.place_formatted || '',
      name: suggestion.name || '',
      place_formatted: suggestion.place_formatted || '',
      mapbox_id: suggestion.mapbox_id || '',
      coordinates: {
        latitude: 0, // Will be fetched via retrieve endpoint
        longitude: 0,
      },
    }));
  } catch (error) {
    console.error('Error searching address:', error);
    return [];
  }
}

export async function retrieveAddressDetails(mapbox_id: string): Promise<AddressSearchResult | null> {
  if (!mapbox_id) return null;

  try {
    const url = `https://api.mapbox.com/search/searchbox/v1/retrieve/${mapbox_id}?` +
      `session_token=${Date.now()}&` +
      `access_token=${MAPBOX_TOKEN}`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error('Mapbox retrieve failed:', response.status);
      return null;
    }

    const data = await response.json();
    console.log('📍 Mapbox retrieve response:', data);

    const feature = data.features?.[0];
    if (!feature) return null;

    const coords = feature.geometry?.coordinates;
    const lat = coords?.[1] || 0;
    const lng = coords?.[0] || 0;

    return {
      full_address: feature.properties?.full_address || '',
      name: feature.properties?.name || '',
      place_formatted: feature.properties?.place_formatted || '',
      mapbox_id: feature.properties?.mapbox_id || mapbox_id,
      coordinates: {
        latitude: lat,
        longitude: lng,
      },
    };
  } catch (error) {
    console.error('Error retrieving address details:', error);
    return null;
  }
}

export async function searchDonationCentersNearby(
  latitude: number,
  longitude: number,
  limit: number = 10
): Promise<MapboxSearchResult[]> {
  const searchCategories = [
    'thrift_or_consignment_store',
    'charity',
    'donation_center',
    'second_hand_store'
  ];

  const allResults: MapboxSearchResult[] = [];
  const seenLocations = new Set<string>();

  console.log('Starting Mapbox Search Box API search near', latitude, longitude);

  try {
    for (const category of searchCategories) {
      const url = `https://api.mapbox.com/search/searchbox/v1/category/${category}?` +
        `proximity=${longitude},${latitude}&` +
        `language=en&` +
        `limit=25&` +
        `access_token=${MAPBOX_TOKEN}`;

      console.log('Searching category:', category);
      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`Failed to search category ${category}, status:`, response.status);
        continue;
      }

      const data = await response.json();
      console.log(`Category ${category} returned`, data.suggestions?.length || 0, 'suggestions');

      if (data.suggestions) {
        data.suggestions.forEach((suggestion: any) => {
          const coords = suggestion.geometry?.coordinates;
          if (!coords) return;

          const [lng, lat] = coords;
          const locationKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;

          if (seenLocations.has(locationKey)) return;
          seenLocations.add(locationKey);

          const distance = calculateDistance(latitude, longitude, lat, lng);
          if (distance > 25) return;

          const addressParts = suggestion.properties?.full_address?.split(',') || [];
          const address = addressParts[0]?.trim() || '';
          const city = suggestion.properties?.context?.place?.name || '';
          const state = suggestion.properties?.context?.region?.region_code || '';
          const zipCode = suggestion.properties?.context?.postcode?.name || '';

          allResults.push({
            id: suggestion.mapbox_id || `mapbox-${Date.now()}-${Math.random()}`,
            name: suggestion.name || suggestion.properties?.name || 'Donation Center',
            full_address: suggestion.properties?.full_address || '',
            address,
            city,
            state,
            zip_code: zipCode,
            latitude: lat,
            longitude: lng,
            distance_miles: distance,
            maki: suggestion.properties?.maki,
            categories: suggestion.properties?.category ? [suggestion.properties.category] : []
          });
        });
      }
    }

    console.log('Total unique results found:', allResults.length);
    const sortedResults = allResults
      .sort((a, b) => (a.distance_miles || 0) - (b.distance_miles || 0))
      .slice(0, 50);
    console.log('Returning top', sortedResults.length, 'results');
    return sortedResults;
  } catch (err) {
    console.error('Mapbox Search Box error:', err);
    console.log('Falling back to Geocoding API');
    return fallbackToGeocodingSearch(latitude, longitude);
  }
}

async function fallbackToGeocodingSearch(
  latitude: number,
  longitude: number
): Promise<MapboxSearchResult[]> {
  console.log('Using fallback Geocoding API');
  const searchTerms = ['goodwill', 'salvation army', 'thrift store', 'donation center'];
  const allResults: MapboxSearchResult[] = [];
  const seenLocations = new Set<string>();

  for (const term of searchTerms) {
    console.log('Fallback searching term:', term);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(term)}.json?` +
        `proximity=${longitude},${latitude}&` +
        `types=poi&` +
        `country=US&` +
        `limit=10&` +
        `access_token=${MAPBOX_TOKEN}`
      );

      if (!response.ok) continue;

      const data = await response.json();

      (data.features || []).forEach((feature: any) => {
        const [lng, lat] = feature.center;
        const locationKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;

        if (seenLocations.has(locationKey)) return;
        seenLocations.add(locationKey);

        const distance = calculateDistance(latitude, longitude, lat, lng);
        if (distance > 25) return;

        const cityObj = feature.context?.find((c: any) => c.id.startsWith('place'));
        const stateObj = feature.context?.find((c: any) => c.id.startsWith('region'));
        const zipObj = feature.context?.find((c: any) => c.id.startsWith('postcode'));

        allResults.push({
          id: feature.id || `mapbox-${Date.now()}-${Math.random()}`,
          name: feature.text || feature.place_name,
          full_address: feature.place_name || '',
          address: feature.properties?.address || feature.place_name.split(',')[0] || '',
          city: cityObj?.text || '',
          state: stateObj?.short_code?.replace('US-', '') || stateObj?.text || '',
          zip_code: zipObj?.text || '',
          latitude: lat,
          longitude: lng,
          distance_miles: distance
        });
      });
    } catch (err) {
      console.error(`Fallback search error for ${term}:`, err);
    }
  }

  console.log('Fallback found', allResults.length, 'total results');
  return allResults.sort((a, b) => (a.distance_miles || 0) - (b.distance_miles || 0));
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
