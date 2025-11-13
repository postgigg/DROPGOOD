import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ArrowLeft, Save, Target, Percent } from 'lucide-react';
import { supabase } from '../lib/supabase';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import DropGoodLogo from '../components/DropGoodLogo';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
mapboxgl.accessToken = MAPBOX_TOKEN;

interface Location {
  id: string;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
}

export default function CreateSponsorshipPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [error, setError] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const circleLayer = useRef<string | null>(null);

  const [formData, setFormData] = useState({
    donationCenterId: '',
    name: '',
    description: '',
    subsidyPercentage: 50,
    initialCreditAmount: 5000,
    targetRadiusMiles: 5,
    autoRechargeEnabled: false,
    autoRechargeThreshold: 250,
    autoRechargeAmount: 1000
  });

  useEffect(() => {
    loadLocations();
  }, []);

  async function loadLocations() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: dcUser } = await supabase
        .from('donation_center_users')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!dcUser) throw new Error('Donation center user not found');

      const { data, error } = await supabase
        .from('donation_centers')
        .select('id, name, city, state, latitude, longitude')
        .eq('owner_user_id', dcUser.id)
        .eq('is_active', true);

      if (error) throw error;
      setLocations(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingLocations(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: dcUser } = await supabase
        .from('donation_center_users')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!dcUser) throw new Error('Donation center user not found');

      const selectedLocation = locations.find(l => l.id === formData.donationCenterId);
      if (!selectedLocation) throw new Error('Location not found');

      const { error: insertError } = await supabase
        .from('sponsorships')
        .insert({
          donation_center_id: formData.donationCenterId,
          owner_user_id: dcUser.id,
          name: formData.name,
          description: formData.description,
          subsidy_percentage: formData.subsidyPercentage,
          initial_credit_amount: formData.initialCreditAmount,
          current_credit_balance: formData.initialCreditAmount,
          target_latitude: selectedLocation.latitude,
          target_longitude: selectedLocation.longitude,
          target_radius_miles: formData.targetRadiusMiles,
          auto_recharge_enabled: formData.autoRechargeEnabled,
          auto_recharge_threshold: formData.autoRechargeThreshold,
          auto_recharge_amount: formData.autoRechargeEnabled ? formData.autoRechargeAmount : null,
          is_active: true
        });

      if (insertError) throw insertError;

      navigate('/donation-center/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (formData.donationCenterId && mapContainer.current && !map.current) {
      const selectedLocation = locations.find(l => l.id === formData.donationCenterId);
      if (selectedLocation) {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [selectedLocation.longitude, selectedLocation.latitude],
          zoom: 11
        });

        new mapboxgl.Marker({ color: '#3B82F6' })
          .setLngLat([selectedLocation.longitude, selectedLocation.latitude])
          .addTo(map.current);

        map.current.on('load', () => {
          updateCircle();
        });
      }
    }
  }, [formData.donationCenterId, locations]);

  useEffect(() => {
    if (map.current && map.current.isStyleLoaded()) {
      updateCircle();
    }
  }, [formData.targetRadiusMiles, formData.donationCenterId]);

  function updateCircle() {
    if (!map.current) return;

    const selectedLocation = locations.find(l => l.id === formData.donationCenterId);
    if (!selectedLocation) return;

    if (circleLayer.current && map.current.getLayer(circleLayer.current)) {
      map.current.removeLayer(circleLayer.current);
      map.current.removeSource(circleLayer.current);
    }

    const radiusInMeters = formData.targetRadiusMiles * 1609.34;
    const center = [selectedLocation.longitude, selectedLocation.latitude];

    const options = { steps: 64, units: 'meters' as const };
    const circle = createGeoJSONCircle(center, radiusInMeters, options);

    const layerId = 'sponsorship-radius';
    circleLayer.current = layerId;

    map.current.addSource(layerId, {
      type: 'geojson',
      data: circle
    });

    map.current.addLayer({
      id: layerId,
      type: 'fill',
      source: layerId,
      paint: {
        'fill-color': '#3B82F6',
        'fill-opacity': 0.2
      }
    });

    map.current.addLayer({
      id: `${layerId}-outline`,
      type: 'line',
      source: layerId,
      paint: {
        'line-color': '#3B82F6',
        'line-width': 2
      }
    });
  }

  function createGeoJSONCircle(center: number[], radiusInMeters: number, options: { steps: number; units: 'meters' }): any {
    const steps = options.steps;
    const coords = {
      latitude: center[1],
      longitude: center[0]
    };

    const points = [];
    for (let i = 0; i < steps; i++) {
      const angle = (i * 360) / steps;
      const point = destination(coords, radiusInMeters / 1000, angle);
      points.push([point.longitude, point.latitude]);
    }
    points.push(points[0]);

    return {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [points]
        },
        properties: {}
      }]
    };
  }

  function destination(origin: { latitude: number; longitude: number }, distance: number, bearing: number) {
    const radius = 6371;
    const lat1 = (origin.latitude * Math.PI) / 180;
    const lon1 = (origin.longitude * Math.PI) / 180;
    const bearingRad = (bearing * Math.PI) / 180;

    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(distance / radius) +
      Math.cos(lat1) * Math.sin(distance / radius) * Math.cos(bearingRad)
    );

    const lon2 = lon1 + Math.atan2(
      Math.sin(bearingRad) * Math.sin(distance / radius) * Math.cos(lat1),
      Math.cos(distance / radius) - Math.sin(lat1) * Math.sin(lat2)
    );

    return {
      latitude: (lat2 * 180) / Math.PI,
      longitude: (lon2 * 180) / Math.PI
    };
  }

  const estimatedPickups = Math.floor(formData.initialCreditAmount / (6 * (formData.subsidyPercentage / 100)));

  if (loadingLocations) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900">
        <nav className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <DropGoodLogo size={32} />
                <span className="text-xl font-bold text-white">DropGood</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <DollarSign className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">No locations available</h1>
          <p className="text-gray-400 mb-8">
            You need to add at least one location before creating a sponsorship campaign.
          </p>
          <button
            onClick={() => navigate('/donation-center/locations/add')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Add Your First Location
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <DropGoodLogo size={32} />
              <span className="text-xl font-bold text-white">DropGood</span>
            </div>
            <button
              onClick={() => navigate('/donation-center/dashboard')}
              className="flex items-center gap-2 text-gray-400 hover:text-gray-300"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Sponsorship</h1>
          <p className="text-gray-400">Subsidize pickups to drive more donations to your center</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Campaign Details
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Location *
              </label>
              <select
                required
                value={formData.donationCenterId}
                onChange={(e) => setFormData({ ...formData, donationCenterId: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a location...</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} - {location.city}, {location.state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Campaign Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="50% Off Downtown Pickups"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="Internal notes about this campaign..."
              />
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Percent className="h-5 w-5 text-green-500" />
              Subsidy Settings
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subsidy Percentage: {formData.subsidyPercentage}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.subsidyPercentage}
                onChange={(e) => setFormData({ ...formData, subsidyPercentage: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                You pay {formData.subsidyPercentage}% of each pickup cost, customer pays {100 - formData.subsidyPercentage}%
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target Radius: {formData.targetRadiusMiles} miles
              </label>
              <input
                type="range"
                min="1"
                max="25"
                step="0.5"
                value={formData.targetRadiusMiles}
                onChange={(e) => setFormData({ ...formData, targetRadiusMiles: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1 mi</span>
                <span>10 mi</span>
                <span>25 mi</span>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Only donors within {formData.targetRadiusMiles} miles will see discounted pricing
              </p>
            </div>

            {formData.donationCenterId && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  <Target className="inline h-4 w-4 mr-1" />
                  Target Area Preview
                </label>
                <div
                  ref={mapContainer}
                  className="w-full h-80 rounded-lg border border-gray-600 overflow-hidden"
                />
                <p className="text-gray-400 text-xs mt-2">
                  Blue circle shows the {formData.targetRadiusMiles}-mile radius around your location
                </p>
              </div>
            )}
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-yellow-500" />
              Budget & Auto-Recharge
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Initial Credit Amount *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  required
                  min="100"
                  step="100"
                  value={formData.initialCreditAmount}
                  onChange={(e) => setFormData({ ...formData, initialCreditAmount: parseFloat(e.target.value) })}
                  className="w-full pl-8 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5000"
                />
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Estimated {estimatedPickups} subsidized pickups at average $6 base cost
              </p>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.autoRechargeEnabled}
                  onChange={(e) => setFormData({ ...formData, autoRechargeEnabled: e.target.checked })}
                  className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <span className="text-white font-medium">Enable auto-recharge</span>
                  <p className="text-gray-400 text-sm">Automatically add credit when balance is low</p>
                </div>
              </label>
            </div>

            {formData.autoRechargeEnabled && (
              <div className="grid grid-cols-2 gap-4 pl-8">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Recharge Threshold
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      min="50"
                      step="50"
                      value={formData.autoRechargeThreshold}
                      onChange={(e) => setFormData({ ...formData, autoRechargeThreshold: parseFloat(e.target.value) })}
                      className="w-full pl-8 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Recharge Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      min="100"
                      step="100"
                      value={formData.autoRechargeAmount}
                      onChange={(e) => setFormData({ ...formData, autoRechargeAmount: parseFloat(e.target.value) })}
                      className="w-full pl-8 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-6">
            <h3 className="text-white font-bold mb-3">Campaign Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Subsidy:</span>
                <span className="text-white font-medium">{formData.subsidyPercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Target radius:</span>
                <span className="text-white font-medium">{formData.targetRadiusMiles} miles</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Initial budget:</span>
                <span className="text-white font-medium">${formData.initialCreditAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Est. subsidized pickups:</span>
                <span className="text-white font-medium">~{estimatedPickups}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/donation-center/dashboard')}
              className="flex-1 bg-gray-700 text-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="h-5 w-5" />
              {loading ? 'Creating...' : 'Create Sponsorship'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
