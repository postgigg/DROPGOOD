import { useState, useRef, useEffect } from 'react';
import { MapPin, Loader, X } from 'lucide-react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
}

interface Props {
  onNext: (address: Address) => void;
  initialData: Address | null;
}

interface MapboxSuggestion {
  id: string;
  place_name: string;
  text: string;
  center: [number, number];
  context?: Array<{ id: string; text: string }>;
  address?: string;
}

export default function StepAddress({ onNext, initialData }: Props) {
  const [searchQuery, setSearchQuery] = useState(
    initialData ? `${initialData.street}, ${initialData.city}, ${initialData.state} ${initialData.zip}` : ''
  );
  const [street, setStreet] = useState(initialData?.street || '');
  const [city, setCity] = useState(initialData?.city || '');
  const [state, setState] = useState(initialData?.state || 'TX');
  const [zip, setZip] = useState(initialData?.zip || '');
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(
    initialData ? { latitude: initialData.latitude, longitude: initialData.longitude } : null
  );

  const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [useManualEntry, setUseManualEntry] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (searchQuery.length < 3 || useManualEntry) {
      setSuggestions([]);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      await searchAddress(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, useManualEntry]);

  async function searchAddress(query: string) {
    if (!query || query.length < 3) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=US&types=address&limit=5`
      );

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setSuggestions(data.features || []);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Address search error:', err);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }

  function selectSuggestion(suggestion: MapboxSuggestion) {
    const [lng, lat] = suggestion.center;

    const streetNum = suggestion.address || '';
    const streetName = suggestion.text || '';
    const fullStreet = streetNum ? `${streetNum} ${streetName}` : streetName;

    const cityObj = suggestion.context?.find(c => c.id.startsWith('place'));
    const stateObj = suggestion.context?.find(c => c.id.startsWith('region'));
    const zipObj = suggestion.context?.find(c => c.id.startsWith('postcode'));

    const selectedCity = cityObj?.text || '';
    const selectedState = stateObj?.text?.split('-')[1] || stateObj?.text || 'TX';
    const selectedZip = zipObj?.text || '';

    setSearchQuery(suggestion.place_name);
    setStreet(fullStreet);
    setCity(selectedCity);
    setState(selectedState);
    setZip(selectedZip);
    setCoordinates({ latitude: lat, longitude: lng });
    setSuggestions([]);
    setShowSuggestions(false);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!coordinates) {
      alert('Please select an address from the suggestions or enter a valid address');
      return;
    }

    onNext({
      street,
      city,
      state,
      zip,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Where should we pick up your donations?</h2>
        <p className="text-gray-400">Start typing your address to search</p>
      </div>

      {!useManualEntry ? (
        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Search Address
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              placeholder="Start typing your address..."
              autoComplete="off"
            />
            {isSearching && (
              <Loader className="absolute right-3 top-3.5 h-5 w-5 animate-spin text-blue-400" />
            )}
            {searchQuery && !isSearching && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSuggestions([]);
                  setShowSuggestions(false);
                }}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => selectSuggestion(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-700 text-white border-b border-gray-700 last:border-b-0 flex items-start gap-2"
                >
                  <MapPin className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">{suggestion.text}</div>
                    <div className="text-sm text-gray-400">{suggestion.place_name}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {coordinates && (
            <div className="mt-2 flex items-center gap-2 text-green-400 text-sm">
              <MapPin className="h-4 w-4" />
              <span>Address verified: {street}, {city}, {state} {zip}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setUseManualEntry(true)}
            className="mt-2 text-sm text-blue-400 hover:text-blue-300"
          >
            Or enter address manually
          </button>
        </div>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Street Address
            </label>
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="123 Oak Street"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Austin"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                State
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="TX">TX</option>
                <option value="CA">CA</option>
                <option value="NY">NY</option>
              </select>
            </div>
          </div>

          <div className="w-32">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ZIP Code
            </label>
            <input
              type="text"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="78701"
              maxLength={5}
              required
            />
          </div>

          <button
            type="button"
            onClick={() => setUseManualEntry(false)}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            ← Back to address search
          </button>
        </>
      )}

      <button
        type="submit"
        disabled={!coordinates && !useManualEntry}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </form>
  );
}
