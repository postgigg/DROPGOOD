import { useState, useEffect, useRef } from 'react';
import { Star, Clock, Loader2, Sparkles, DollarSign, Search, Building2, MapPin, X, Loader, SlidersHorizontal, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { supabase, type DonationCenter } from '../../lib/supabase';
import { calculateFinalPrice, calculateFinalPriceWithSubsidies, getRoadieEstimates, getUberDirectQuotes, mockUberQuote, calculateManualModePricing, INACTIVE_CHARITY_SERVICE_FEE, DEFAULT_SERVICE_FEE } from '../../lib/pricing';
import { searchDonationCentersNearby } from '../../lib/mapboxSearch';

interface Props {
  pickupAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    latitude: number;
    longitude: number;
  };
  itemsTypes: string[];
  itemsCount: number;
  bagsCount?: number;
  boxesCount?: number;
  onSelect: (charity: DonationCenter & { pricing: any }) => void;
  onBack: () => void;
}

interface CharityWithSponsorship extends DonationCenter {
  distance_miles: number;
  duration_minutes: number;
  pricing: any;
  sponsorship: {
    id: string;
    subsidy_percentage: number;
    name: string;
  } | null;
  company_benefit?: {
    company_id: string;
    company_name: string;
    employee_id: string;
    subsidy_percentage: number;
  } | null;
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

export default function StepCharities({ pickupAddress, itemsTypes, itemsCount, bagsCount = 0, boxesCount = 0, onSelect, onBack }: Props) {
  const [charities, setCharities] = useState<CharityWithSponsorship[]>([]);
  const [allMapboxResults, setAllMapboxResults] = useState<CharityWithSponsorship[]>([]);
  const [displayCount, setDisplayCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'distance' | 'rating'>('price');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxDistance, setMaxDistance] = useState(15);
  const [showAddCharityForm, setShowAddCharityForm] = useState(false);
  const [addingCharity, setAddingCharity] = useState(false);
  const [newCharityName, setNewCharityName] = useState('');
  const [newCharityAddress, setNewCharityAddress] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [selectedAddressResult, setSelectedAddressResult] = useState<any>(null);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const [companyBenefit, setCompanyBenefit] = useState<{
    company_id: string;
    company_name: string;
    employee_id: string;
    subsidy_percentage: number;
  } | null>(null);
  const [calculatingPrice, setCalculatingPrice] = useState(false);
  const [previewPricing, setPreviewPricing] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Check for company employee eligibility on mount
  useEffect(() => {
    checkCompanyEligibility();
  }, []);

  useEffect(() => {
    loadCharities();
  }, [companyBenefit]);

  // Check if user is eligible for company benefits
  async function checkCompanyEligibility() {
    try {
      // Try to get email from localStorage (saved from previous bookings)
      const savedEmail = localStorage.getItem('dropgood_last_email');
      if (!savedEmail) {
        console.log('No saved email found, skipping company eligibility check');
        return;
      }

      console.log('Checking company eligibility for email:', savedEmail);

      // Call the SQL function to check eligibility
      const { data, error } = await supabase.rpc('check_employee_company_eligibility', {
        p_email: savedEmail,
        p_user_id: null
      });

      if (error) {
        console.error('Error checking company eligibility:', error);
        return;
      }

      if (data && data.length > 0 && data[0].is_eligible) {
        const eligibility = data[0];
        console.log('✅ Employee is eligible for company benefits:', eligibility);
        setCompanyBenefit({
          company_id: eligibility.company_id,
          company_name: eligibility.company_name,
          employee_id: eligibility.employee_id,
          subsidy_percentage: eligibility.subsidy_percentage
        });
      } else {
        console.log('Employee not eligible for company benefits');
      }
    } catch (err) {
      console.error('Error in checkCompanyEligibility:', err);
    }
  }

  async function loadCharities() {
    try {
      setLoading(true);
      setError(null);

      console.log('🏪 StepCharities: Loading charities for address:', {
        street: pickupAddress.street,
        city: pickupAddress.city,
        coordinates: {
          latitude: pickupAddress.latitude,
          longitude: pickupAddress.longitude
        }
      });

      const { data: centers, error: centersError } = await supabase
        .from('donation_centers')
        .select('*')
        .eq('is_active', true);

      if (centersError) throw centersError;

      console.log('🏪 Found', centers?.length || 0, 'active donation centers in database');

      const { data: sponsorships, error: sponsorshipsError } = await supabase
        .from('sponsorships')
        .select('*')
        .eq('is_active', true);

      if (sponsorshipsError) throw sponsorshipsError;

      const charitiesWithPricing: CharityWithSponsorship[] = (centers || []).map((charity: any) => {
        const distanceMiles = calculateDistance(
          pickupAddress.latitude,
          pickupAddress.longitude,
          charity.latitude,
          charity.longitude
        );

        let sponsorship = null;
        if (sponsorships) {
          const applicableSponsorship = sponsorships.find((s: any) => {
            if (s.donation_center_id !== charity.id) return false;

            const sponsorshipDistance = calculateDistance(
              pickupAddress.latitude,
              pickupAddress.longitude,
              s.target_latitude,
              s.target_longitude
            );

            return sponsorshipDistance <= s.target_radius_miles && s.current_credit_balance > 0;
          });

          if (applicableSponsorship) {
            sponsorship = {
              id: applicableSponsorship.id,
              subsidy_percentage: applicableSponsorship.subsidy_percentage,
              name: applicableSponsorship.name
            };
          }
        }

        const isManualMode = import.meta.env.VITE_MANUAL_MODE === 'true';
        const uberCost = isManualMode ? calculateManualModePricing(distanceMiles) : mockUberQuote(distanceMiles);

        // Apply stacked subsidies (charity + company)
        const charitySubsidyPct = sponsorship?.subsidy_percentage || 0;
        const companySubsidyPct = companyBenefit?.subsidy_percentage || 0;

        const finalPricing = calculateFinalPriceWithSubsidies(
          uberCost,
          false, // isRushDelivery
          0, // driverTip - optional (no mandatory tip)
          charitySubsidyPct,
          companySubsidyPct,
          DEFAULT_SERVICE_FEE, // 35% service fee
          pickupAddress.state,
          bagsCount || 0, // Include bag fees
          boxesCount || 0, // Include box fees
          0 // daysInAdvance - Step 3 doesn't know scheduled date yet
        );

        return {
          ...charity,
          distance_miles: distanceMiles,
          duration_minutes: Math.ceil(distanceMiles * 2.5),
          pricing: finalPricing,
          sponsorship,
          company_benefit: companyBenefit,
          is_sponsored: !!sponsorship || !!companyBenefit
        };
      });

      console.log('🏪 Before distance filter: Found', charitiesWithPricing.length, 'centers');

      const filteredCharities = charitiesWithPricing.filter((c: CharityWithSponsorship) => c.distance_miles <= 15);

      console.log('🏪 After 15-mile filter:', filteredCharities.length, 'centers remaining');

      // Sort: subsidized charities first, then by price
      filteredCharities.sort((a, b) => {
        const aHasSubsidy = !!(a.sponsorship || a.company_benefit);
        const bHasSubsidy = !!(b.sponsorship || b.company_benefit);

        if (aHasSubsidy && !bHasSubsidy) return -1;
        if (!aHasSubsidy && bHasSubsidy) return 1;
        return a.pricing.total_price - b.pricing.total_price;
      });

      if (filteredCharities.length === 0) {
        console.log('❌ No database centers within 15 miles, loading from Mapbox...');
        const mapboxCharities = await loadMapboxDonationCenters();
        console.log('🗺️  Mapbox returned centers:', mapboxCharities.length);
        if (mapboxCharities.length > 0) {
          setCharities(mapboxCharities);
        }
      } else {
        console.log('✅ Setting', filteredCharities.length, 'database centers');
        setCharities(filteredCharities);
      }
    } catch (err) {
      console.error('Error loading charities:', err);
      setError('Failed to load donation centers. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function loadMapboxDonationCenters(): Promise<CharityWithSponsorship[]> {
    try {
      console.log('Searching Mapbox for donation centers...');
      const mapboxResults = await searchDonationCentersNearby(
        pickupAddress.latitude,
        pickupAddress.longitude,
        50
      );

      console.log('Mapbox search returned:', mapboxResults.length, 'results');

      if (mapboxResults.length === 0) {
        console.warn('No Mapbox results found');
        return [];
      }

      const locationQuotes = mapboxResults.map(r => ({
        id: r.id,
        name: r.name,
        latitude: r.latitude,
        longitude: r.longitude
      }));

      console.log('Getting pricing quotes for', locationQuotes.length, 'locations');

      // Build manifest for quote request
      const manifest = {
        items: [
          ...(bagsCount > 0 ? [{
            name: 'Donation Bags',
            quantity: bagsCount,
            size: 'medium' as const
          }] : []),
          ...(boxesCount > 0 ? [{
            name: 'Donation Boxes',
            quantity: boxesCount,
            size: 'large' as const
          }] : [])
        ],
        // Estimated value for insurance (you can adjust this)
        total_value: Math.max(1000, (bagsCount * 500) + (boxesCount * 1000)) // in cents
      };

      // Try Roadie first (if enabled), then fall back to Uber
      const ROADIE_ENABLED = import.meta.env.VITE_ROADIE_ENABLED === 'true';
      const UBER_ENABLED = import.meta.env.VITE_UBER_ENABLED === 'true';

      let quotes: Map<string, { price: number; quote_id?: string; provider?: string }>;

      if (ROADIE_ENABLED) {
        console.log('🚗 Trying Roadie quotes first...');
        const roadieQuotes = await getRoadieEstimates(
          pickupAddress.latitude,
          pickupAddress.longitude,
          locationQuotes,
          pickupAddress,
          bagsCount,
          boxesCount
        );

        if (roadieQuotes.size > 0) {
          console.log('✅ Using Roadie prices for', roadieQuotes.size, 'locations');
          quotes = roadieQuotes;
        } else if (UBER_ENABLED) {
          console.log('⚠️ Roadie quotes failed, falling back to Uber...');
          quotes = await getUberDirectQuotes(
            pickupAddress.latitude,
            pickupAddress.longitude,
            locationQuotes,
            pickupAddress,
            manifest.items.length > 0 ? manifest : undefined
          );
        } else {
          throw new Error('No delivery quotes available');
        }
      } else if (UBER_ENABLED) {
        console.log('🚗 Using Uber quotes...');
        quotes = await getUberDirectQuotes(
          pickupAddress.latitude,
          pickupAddress.longitude,
          locationQuotes,
          pickupAddress,
          manifest.items.length > 0 ? manifest : undefined
        );
      } else {
        throw new Error('No delivery service enabled');
      }

      console.log('Received quotes for', quotes.size, 'locations');

      const charitiesWithPricing: CharityWithSponsorship[] = mapboxResults.map((result) => {
        const quoteData = quotes.get(result.id);
        if (!quoteData) {
          console.warn('No quote found for', result.name, result.id);
        }
        const uberCost = quoteData?.price || 0;
        const quoteId = quoteData?.quote_id; // Extract quote_id from Uber
        const pricing = calculateFinalPrice(uberCost, false, 0, DEFAULT_SERVICE_FEE, pickupAddress.state, bagsCount || 0, boxesCount || 0);

        // Add quote_id to pricing object for later use
        pricing.uber_quote_id = quoteId;
        pricing.provider = quoteData?.provider; // Store 'roadie' or 'uber' for automatic delivery creation

        return {
          id: result.id,
          name: result.name,
          street_address: result.address || result.full_address.split(',')[0] || 'Address not available',
          city: result.city || pickupAddress.city,
          state: result.state || pickupAddress.state,
          zip_code: result.zip_code || pickupAddress.zip,
          latitude: result.latitude,
          longitude: result.longitude,
          phone: null,
          email: null,
          website: null,
          description: `Found via Mapbox Search${result.categories ? ` - ${result.categories.join(', ')}` : ''}`,
          accepted_items: ['Clothing', 'Household items', 'Books', 'Furniture', 'Electronics'],
          special_instructions: null,
          is_active: true,
          is_verified: false,
          created_by_owner: false,
          rating: null,
          total_donations_received: 0,
          owner_user_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          distance_miles: result.distance_miles || 0,
          duration_minutes: Math.ceil((result.distance_miles || 0) * 2.5),
          pricing,
          sponsorship: null,
          is_sponsored: false
        };
      });

      console.log('Created', charitiesWithPricing.length, 'charities with pricing');
      setAllMapboxResults(charitiesWithPricing);
      const displayedResults = charitiesWithPricing.slice(0, displayCount);
      console.log('Returning', displayedResults.length, 'for initial display');
      return displayedResults;
    } catch (err) {
      console.error('Mapbox Search Box error:', err);
      return [];
    }
  }

  async function loadMoreCenters() {
    if (loadingMore || displayCount >= allMapboxResults.length) return;

    setLoadingMore(true);
    try {
      const newCount = displayCount + 10;
      const additionalCenters = allMapboxResults.slice(displayCount, newCount);

      setCharities(prev => [...prev, ...additionalCenters]);
      setDisplayCount(newCount);
    } catch (err) {
      console.error('Error loading more centers:', err);
    } finally {
      setLoadingMore(false);
    }
  }

  const filteredCharities = charities
    .filter(c => c.distance_miles <= maxDistance)
    .filter(c => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(query) ||
             c.city.toLowerCase().includes(query) ||
             c.street_address.toLowerCase().includes(query);
    });

  async function handleAddressSearch(query: string) {
    setNewCharityAddress(query);

    if (query.length < 3) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      await searchAddressMapbox(query);
    }, 300);
  }

  async function searchAddressMapbox(query: string) {
    if (!query || query.length < 3) return;

    setIsSearchingAddress(true);
    try {
      const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=US&types=address,poi&limit=5`
      );

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setAddressSuggestions(data.features || []);
      setShowAddressSuggestions(true);
    } catch (error) {
      console.error('Address search error:', error);
      setAddressSuggestions([]);
    } finally {
      setIsSearchingAddress(false);
    }
  }

  async function calculatePriceForNewCharity(location: { latitude: number; longitude: number }) {
    setCalculatingPrice(true);
    setPreviewPricing(null);

    try {
      const distance = calculateDistance(
        pickupAddress.latitude,
        pickupAddress.longitude,
        location.latitude,
        location.longitude
      );

      console.log('🧮 Calculating price for new charity:', {
        distance: distance.toFixed(1),
        pickupLat: pickupAddress.latitude,
        pickupLng: pickupAddress.longitude,
        charityLat: location.latitude,
        charityLng: location.longitude
      });

      // Check if distance is too far (over 100 miles)
      if (distance > 100) {
        alert(`⚠️ This charity is ${distance.toFixed(1)} miles away from your pickup location. Please select a charity closer to your pickup address (within 100 miles).`);
        setNewCharityAddress('');
        setSelectedAddressResult(null);
        setAddressSuggestions([]);
        setCalculatingPrice(false);
        return;
      }

      const baseCost = calculateManualModePricing(distance);
      const pricing = calculateFinalPrice(baseCost, false, 0, INACTIVE_CHARITY_SERVICE_FEE, pickupAddress.state, bagsCount || 0, boxesCount || 0);

      console.log('💰 Pricing calculated:', {
        baseCost: baseCost.toFixed(2),
        serviceFee: pricing.our_markup.toFixed(2),
        total: pricing.total_price.toFixed(2)
      });

      setPreviewPricing({
        ...pricing,
        distance_miles: distance
      });
    } catch (error) {
      console.error('Price calculation error:', error);
    } finally {
      setCalculatingPrice(false);
    }
  }

  function selectAddress(suggestion: any) {
    const [lng, lat] = suggestion.center;

    const streetNum = suggestion.address || '';
    const streetName = suggestion.text || '';
    const fullStreet = streetNum ? `${streetNum} ${streetName}` : streetName;

    const cityObj = suggestion.context?.find((c: any) => c.id.startsWith('place'));
    const stateObj = suggestion.context?.find((c: any) => c.id.startsWith('region'));
    const zipObj = suggestion.context?.find((c: any) => c.id.startsWith('postcode'));

    const selectedCity = cityObj?.text || '';
    const selectedState = stateObj?.text?.split('-')[1] || stateObj?.text || '';
    const selectedZip = zipObj?.text || '';

    setNewCharityAddress(suggestion.place_name);
    setSelectedAddressResult({
      address: fullStreet,
      city: selectedCity,
      state: selectedState,
      zip: selectedZip,
      latitude: lat,
      longitude: lng
    });
    setShowAddressSuggestions(false);

    // Trigger price calculation
    calculatePriceForNewCharity({
      latitude: lat,
      longitude: lng
    });
  }

  async function handleAddCharity() {
    if (!newCharityName.trim() || !newCharityAddress.trim()) {
      alert('Please enter both charity name and address');
      return;
    }

    if (!selectedAddressResult) {
      alert('Please select an address from the suggestions');
      return;
    }

    setAddingCharity(true);
    try {
      const selectedLocation = selectedAddressResult;

      // Create the donation center in database (inactive)
      const insertPayload = {
        name: newCharityName.trim(),
        street_address: selectedLocation.address,
        city: selectedLocation.city,
        state: selectedLocation.state,
        zip_code: selectedLocation.zip,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        is_active: false, // Pending admin review
        is_partner: false,
        can_auto_issue_receipts: false,
        rating: 0,
        total_ratings: 0,
        total_donations_received: 0
      };

      console.log('🏪 FULL INSERT PAYLOAD:', insertPayload);
      console.log('🏪 is_partner value:', insertPayload.is_partner);
      console.log('🏪 can_auto_issue_receipts value:', insertPayload.can_auto_issue_receipts);
      console.log('🏪 is_active value:', insertPayload.is_active);

      const { data: newCenter, error: insertError } = await supabase
        .from('donation_centers')
        .insert(insertPayload)
        .select()
        .single();

      if (insertError) {
        console.error('❌ Insert error details:', {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint
        });
        throw insertError;
      }

      console.log('✅ Successfully inserted charity:', newCenter);

      // Send email notification to admin
      await supabase.functions.invoke('send-notification', {
        body: {
          type: 'new_charity_submission',
          recipient_email: 'exontract@gmail.com',
          recipient_name: 'DropGood Admin',
          send_email: true,
          send_sms: false,
          data: {
            charity_name: newCharityName,
            address: selectedLocation.address,
            city: selectedLocation.city,
            state: selectedLocation.state,
            submitted_by_user: true
          }
        }
      });

      // Calculate distance and mock pricing for display
      const distance = calculateDistance(
        pickupAddress.latitude,
        pickupAddress.longitude,
        selectedLocation.latitude,
        selectedLocation.longitude
      );

      // Use 50% service fee for inactive charity
      const baseCost = calculateManualModePricing(distance);
      const pricingWithHigherFee = calculateFinalPrice(baseCost, false, 0, INACTIVE_CHARITY_SERVICE_FEE, pickupAddress.state, bagsCount || 0, boxesCount || 0);

      // Add to the charities list so user can continue
      const newCharityWithPricing: CharityWithSponsorship = {
        ...newCenter,
        distance_miles: distance,
        duration_minutes: Math.round(distance * 3),
        pricing: pricingWithHigherFee,
        sponsorship: null,
        company_benefit: null
      };

      // Automatically advance to schedule step with this charity selected
      onSelect(newCharityWithPricing);
    } catch (error: any) {
      console.error('Error adding charity:', error);
      alert('Failed to add charity. Please try again.');
    } finally {
      setAddingCharity(false);
    }
  }

  const sortedCharities = [...filteredCharities].sort((a, b) => {
    if (a.sponsorship && !b.sponsorship) return -1;
    if (!a.sponsorship && b.sponsorship) return 1;

    switch (sortBy) {
      case 'price':
        return a.pricing.total_price - b.pricing.total_price;
      case 'distance':
        return a.distance_miles - b.distance_miles;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <Skeleton height={32} width={300} baseColor="#1f2937" highlightColor="#374151" />
          <Skeleton height={20} width={200} baseColor="#1f2937" highlightColor="#374151" className="mt-2" />
        </div>
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="border border-gray-700 bg-gray-800/50 rounded-2xl p-7"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <Skeleton height={28} width="60%" baseColor="#1f2937" highlightColor="#374151" />
                <Skeleton height={16} width="40%" baseColor="#1f2937" highlightColor="#374151" className="mt-2" />
              </div>
              <div className="flex flex-col sm:items-end gap-3">
                <Skeleton height={48} width={120} baseColor="#1f2937" highlightColor="#374151" />
                <Skeleton height={44} width={140} baseColor="#1f2937" highlightColor="#374151" />
              </div>
            </div>
          </motion.div>
        ))}
        <div className="flex items-center justify-center gap-2 py-4">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          <p className="text-gray-300">Finding donation centers near you...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={loadCharities}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (charities.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 sm:p-10 space-y-6">
          <div className="text-center space-y-3">
            <h3 className="text-2xl sm:text-3xl font-bold text-white">Can't find your charity?</h3>
            <p className="text-base sm:text-lg text-gray-300">
              No worries! Add it yourself and we'll get it approved within 24 hours.
            </p>
          </div>

          {!showAddCharityForm ? (
            <div className="flex flex-col gap-4 pt-4">
              <button
                onClick={() => setShowAddCharityForm(true)}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition"
              >
                Add Your Charity
              </button>
              <button
                onClick={onBack}
                className="bg-gray-700 text-gray-200 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-600 transition"
              >
                Try Different Address
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Charity Name
                </label>
                <input
                  type="text"
                  value={newCharityName}
                  onChange={(e) => setNewCharityName(e.target.value)}
                  placeholder="e.g., Goodwill, Salvation Army..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Charity Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={newCharityAddress}
                    onChange={(e) => handleAddressSearch(e.target.value)}
                    onFocus={() => addressSuggestions.length > 0 && setShowAddressSuggestions(true)}
                    placeholder="Start typing the address..."
                    autoComplete="off"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  />
                  {isSearchingAddress && (
                    <Loader className="absolute right-3 top-3.5 h-5 w-5 animate-spin text-blue-400" />
                  )}
                  {newCharityAddress && !isSearchingAddress && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewCharityAddress('');
                        setAddressSuggestions([]);
                        setShowAddressSuggestions(false);
                        setSelectedAddressResult(null);
                        setPreviewPricing(null);
                      }}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-white"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {/* Address Suggestions Dropdown */}
                {showAddressSuggestions && addressSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {addressSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        onClick={() => selectAddress(suggestion)}
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

                {selectedAddressResult && (
                  <div className="mt-2 flex items-center gap-2 text-green-400 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>Address verified: {selectedAddressResult.address}, {selectedAddressResult.city}, {selectedAddressResult.state} {selectedAddressResult.zip}</span>
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-1">
                  We'll verify this location before it goes live
                </p>

                {/* Price Preview */}
                <AnimatePresence>
                  {calculatingPrice && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 bg-gray-700 border border-gray-600 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-2">
                        <Loader className="h-4 w-4 animate-spin text-blue-400" />
                        <span className="text-sm text-gray-300">Calculating price...</span>
                      </div>
                    </motion.div>
                  )}

                  {previewPricing && !calculatingPrice && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 bg-gray-800/60 backdrop-blur-sm border-2 border-gray-700/50 rounded-lg p-4"
                    >
                      <div className="text-center">
                        <div className="text-3xl font-black text-white">
                          ${previewPricing.total_price.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Base price + optional tip
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => setShowAddCharityForm(false)}
                  disabled={addingCharity}
                  className="flex-1 bg-gray-700 text-gray-200 px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCharity}
                  disabled={addingCharity || !previewPricing}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingCharity ? 'Adding...' : previewPricing ? `Continue with $${previewPricing.total_price.toFixed(2)}` : 'Continue'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">Pick your favorite local charity</h2>
        <p className="text-sm sm:text-base text-gray-400">
          Showing {sortedCharities.length} of {charities.length} centers near {pickupAddress.city}
        </p>
      </div>

      {/* Company Benefit Banner */}
      {companyBenefit && (
        <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-2 border-green-500 rounded-xl p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-green-300 mb-1">
                🎉 Company Benefit Active!
              </h3>
              <p className="text-sm sm:text-base text-gray-300 mb-2">
                Your company <span className="font-bold text-white">{companyBenefit.company_name}</span> is
                subsidizing <span className="font-bold text-green-400">{companyBenefit.subsidy_percentage}%</span> of
                your donation pickup costs!
              </p>
              <p className="text-xs sm:text-sm text-gray-400">
                This benefit stacks with charity sponsorships for maximum savings!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filters - Uber Style */}
      <div className="space-y-4">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, location, or address..."
            className="w-full pl-12 pr-4 py-4 bg-gray-800/80 backdrop-blur-sm border-2 border-gray-700 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </motion.div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-2 border-gray-700 rounded-xl text-gray-300 hover:border-gray-600 transition-all"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="text-sm font-medium">Filters & Sort</span>
          <motion.div
            animate={{ rotate: showFilters ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            ▼
          </motion.div>
        </button>

        {/* Collapsible Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 overflow-hidden"
            >
              {/* Distance Filter Chips */}
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex items-center gap-2 text-gray-400 flex-shrink-0">
                  <Navigation className="h-5 w-5" />
                  <span className="text-sm font-medium">Distance:</span>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  {[5, 10, 15, 25].map((distance) => (
                    <motion.button
                      key={distance}
                      onClick={() => setMaxDistance(distance)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                        maxDistance === distance
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-gray-800 border-2 border-gray-700 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      {distance} mi
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Sort Controls - Icon Based */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-400 flex-shrink-0">Sort by:</span>
                <div className="flex gap-2 w-full">
                  <motion.button
                    onClick={() => setSortBy('price')}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex-1 px-4 sm:px-6 py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 ${
                      sortBy === 'price'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-gray-800 border-2 border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-750'
                    }`}
                  >
                    <DollarSign className="h-4 w-4" />
                    <span className="hidden sm:inline">Price</span>
                    <span className="sm:hidden">$</span>
                  </motion.button>

                  <motion.button
                    onClick={() => setSortBy('distance')}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex-1 px-4 sm:px-6 py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 ${
                      sortBy === 'distance'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-gray-800 border-2 border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-750'
                    }`}
                  >
                    <MapPin className="h-4 w-4" />
                    <span className="hidden sm:inline">Distance</span>
                    <span className="sm:hidden">Mi</span>
                  </motion.button>

                  <motion.button
                    onClick={() => setSortBy('rating')}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex-1 px-4 sm:px-6 py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 ${
                      sortBy === 'rating'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-gray-800 border-2 border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-750'
                    }`}
                  >
                    <Star className="h-4 w-4" />
                    <span className="hidden sm:inline">Rating</span>
                    <span className="sm:hidden">★</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters Summary */}
        {(searchQuery || maxDistance !== 15) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 text-sm text-gray-400 bg-gray-800/50 px-4 py-2 rounded-lg"
          >
            <span className="font-medium">Active:</span>
            {searchQuery && (
              <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded-md">
                Search: "{searchQuery}"
              </span>
            )}
            {maxDistance !== 15 && (
              <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded-md">
                Max: {maxDistance} miles
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setMaxDistance(15);
              }}
              className="ml-auto text-blue-400 hover:text-blue-300 font-semibold"
            >
              Clear all
            </button>
          </motion.div>
        )}
      </div>

      {sortedCharities.length === 0 && charities.length > 0 && (
        <div className="text-center py-8 bg-gray-800 border border-gray-700 rounded-lg">
          <p className="text-gray-400 mb-2">No centers match your filters</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setMaxDistance(15);
            }}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Clear filters
          </button>
        </div>
      )}

      <div className="space-y-4">
        {sortedCharities.map((charity, index) => (
          <motion.div
            key={charity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{
              scale: 1.015,
              y: -4,
              transition: { duration: 0.2, ease: 'easeOut' }
            }}
            className={`relative overflow-hidden rounded-2xl p-6 sm:p-8 transition-all duration-300 cursor-pointer group ${
              charity.sponsorship || charity.company_benefit
                ? 'bg-gradient-to-br from-blue-900/20 via-blue-900/15 to-blue-900/20 border-2 border-blue-500/50 shadow-xl shadow-blue-500/10 hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-400'
                : 'bg-gray-800/60 backdrop-blur-sm border-2 border-gray-700/50 shadow-lg hover:shadow-xl hover:border-gray-600 hover:bg-gray-800/80'
            }`}
          >
            {/* Hover Gradient Overlay for Premium Feel */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Subsidy badges */}
            <div className="mb-3 flex flex-wrap items-center gap-2 relative z-10">
              {(charity.sponsorship || charity.company_benefit) && (
                <>
                  {charity.sponsorship && (
                    <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">
                      <Sparkles className="h-3 w-3" />
                      CHARITY: {charity.sponsorship.subsidy_percentage}% OFF
                    </span>
                  )}
                  {charity.company_benefit && (
                    <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-bold bg-green-600 text-white">
                      <Building2 className="h-3 w-3" />
                      COMPANY: {charity.company_benefit.subsidy_percentage}% OFF
                    </span>
                  )}
                  {charity.sponsorship && charity.company_benefit && (
                    <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white animate-pulse">
                      ⚡ STACKED SAVINGS
                    </span>
                  )}
                </>
              )}

              {/* Receipt badge moved here */}
              {charity.can_auto_issue_receipts ? (
                <div className="inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 px-3 py-1.5 rounded-full">
                  <span className="text-xs font-semibold text-green-400">✓ Instant Tax Receipt</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full">
                  <span className="text-xs font-semibold text-amber-400">📄 Manual Receipt</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-blue-100 transition-colors duration-200">{charity.name}</h3>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {charity.rating > 0 && (
                    <>
                      <div className="flex items-center gap-1.5 text-gray-300">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{charity.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-gray-600">•</span>
                    </>
                  )}
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">{charity.distance_miles.toFixed(1)} miles away</span>
                  </div>
                  <span className="text-gray-600">•</span>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">~{charity.duration_minutes} min</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-3">
                {/* Show original price if subsidized */}
                {(charity.sponsorship || charity.company_benefit) && charity.pricing.original_price && (
                  <div className="text-base text-gray-500 line-through">
                    ${charity.pricing.original_price.toFixed(2)}
                  </div>
                )}

                {/* Final price */}
                <div className={`text-3xl sm:text-4xl font-black ${
                  (charity.sponsorship || charity.company_benefit) ? 'text-green-400' : 'text-white'
                }`}>
                  ${charity.pricing.total_price.toFixed(2)}
                </div>

                {/* Show savings badge if subsidies exist */}
                {charity.pricing.total_subsidy_amount > 0 && (
                  <div className="inline-flex items-center gap-1 bg-green-500/10 border border-green-500/30 px-2.5 py-1 rounded-full">
                    <span className="text-xs font-bold text-green-400">
                      Save ${charity.pricing.total_subsidy_amount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  <p>Base price + optional tip</p>
                </div>

                <motion.button
                  onClick={() => onSelect(charity)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl text-base font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-2xl hover:shadow-blue-500/40 w-full sm:w-auto relative overflow-hidden group/btn"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Select
                    <motion.span
                      className="inline-block"
                      initial={{ x: 0 }}
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      →
                    </motion.span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {allMapboxResults.length > displayCount && (
        <div className="text-center pt-4">
          <button
            onClick={loadMoreCenters}
            disabled={loadingMore}
            className="bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingMore ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading more...
              </span>
            ) : (
              `Load More (${allMapboxResults.length - displayCount} remaining)`
            )}
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Showing {displayCount} of {allMapboxResults.length} centers
          </p>
        </div>
      )}

      <div className="flex justify-between pt-4 sm:pt-6 border-t border-gray-700">
        <button
          onClick={onBack}
          className="bg-gray-700 text-gray-200 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-600 transition"
        >
          Back
        </button>
      </div>

      <div className="space-y-3">
        <div className="text-center text-xs sm:text-sm text-gray-400 bg-blue-900/20 border border-blue-700/50 p-3 sm:p-4 rounded-lg">
          💡 TIP: Sponsored centers offer discounted pricing. Closer charities = lower base price. Prices shown are before optional driver tip.
        </div>
      </div>
    </div>
  );
}
