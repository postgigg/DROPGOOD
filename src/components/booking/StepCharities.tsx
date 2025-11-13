import { useState, useEffect } from 'react';
import { Star, Clock, Loader2, Sparkles, DollarSign, Search, Building2 } from 'lucide-react';
import { supabase, type DonationCenter } from '../../lib/supabase';
import { calculateFinalPrice, calculateFinalPriceWithSubsidies, getUberDirectQuotes, mockUberQuote, calculateManualModePricing, INACTIVE_CHARITY_SERVICE_FEE } from '../../lib/pricing';
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

export default function StepCharities({ pickupAddress, itemsTypes, itemsCount, onSelect, onBack }: Props) {
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
  const [companyBenefit, setCompanyBenefit] = useState<{
    company_id: string;
    company_name: string;
    employee_id: string;
    subsidy_percentage: number;
  } | null>(null);

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

      const { data: centers, error: centersError } = await supabase
        .from('donation_centers')
        .select('*')
        .eq('is_active', true);

      if (centersError) throw centersError;

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
          0, // driverTip (added later in payment step)
          charitySubsidyPct,
          companySubsidyPct
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
      }).filter((c: CharityWithSponsorship) => c.distance_miles <= 15);

      // Sort: subsidized charities first, then by price
      charitiesWithPricing.sort((a, b) => {
        const aHasSubsidy = !!(a.sponsorship || a.company_benefit);
        const bHasSubsidy = !!(b.sponsorship || b.company_benefit);

        if (aHasSubsidy && !bHasSubsidy) return -1;
        if (!aHasSubsidy && bHasSubsidy) return 1;
        return a.pricing.total_price - b.pricing.total_price;
      });

      if (charitiesWithPricing.length === 0) {
        console.log('No database centers found, loading from Mapbox...');
        const mapboxCharities = await loadMapboxDonationCenters();
        console.log('Mapbox returned centers:', mapboxCharities.length);
        if (mapboxCharities.length > 0) {
          setCharities(mapboxCharities);
        }
      } else {
        console.log('Found database centers:', charitiesWithPricing.length);
        setCharities(charitiesWithPricing);
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
      const quotes = await getUberDirectQuotes(
        pickupAddress.latitude,
        pickupAddress.longitude,
        locationQuotes
      );
      console.log('Received quotes for', quotes.size, 'locations');

      const charitiesWithPricing: CharityWithSponsorship[] = mapboxResults.map((result) => {
        const uberCost = quotes.get(result.id);
        if (!uberCost) {
          console.warn('No quote found for', result.name, result.id);
        }
        const pricing = calculateFinalPrice(uberCost || 0, false, 0);

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

  async function handleAddCharity() {
    if (!newCharityName.trim() || !newCharityAddress.trim()) {
      alert('Please enter both charity name and address');
      return;
    }

    setAddingCharity(true);
    try {
      // Search for the address using Mapbox
      const addressResults = await import('../../lib/mapboxSearch').then(m =>
        m.searchAddress(newCharityAddress)
      );

      if (addressResults.length === 0) {
        alert('Could not find that address. Please try again.');
        setAddingCharity(false);
        return;
      }

      const selectedLocation = addressResults[0];

      // Create the donation center in database (inactive)
      const { data: newCenter, error: insertError } = await supabase
        .from('donation_centers')
        .insert({
          name: newCharityName.trim(),
          address: selectedLocation.address,
          city: selectedLocation.city,
          state: selectedLocation.state,
          zip: selectedLocation.zip,
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          is_active: false, // Pending admin review
          rating: 0,
          total_donations: 0
        })
        .select()
        .single();

      if (insertError) throw insertError;

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

      // Use 35% service fee for inactive charity
      const baseCost = calculateManualModePricing(distance);
      const pricingWithHigherFee = calculateFinalPrice(baseCost, false, 0, INACTIVE_CHARITY_SERVICE_FEE);

      // Add to the charities list so user can continue
      const newCharityWithPricing: CharityWithSponsorship = {
        ...newCenter,
        distance_miles: distance,
        duration_minutes: Math.round(distance * 3),
        pricing: pricingWithHigherFee,
        sponsorship: null,
        company_benefit: null
      };

      setCharities([newCharityWithPricing]);
      setShowAddCharityForm(false);
      alert('Charity added! You can continue with your booking.');
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
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-300">Finding donation centers near you...</p>
        <p className="text-sm text-gray-500">Checking for special offers</p>
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

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Charity Address
                </label>
                <input
                  type="text"
                  value={newCharityAddress}
                  onChange={(e) => setNewCharityAddress(e.target.value)}
                  placeholder="Enter full address..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">
                  We'll verify this location before it goes live
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleAddCharity}
                  disabled={addingCharity}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingCharity ? 'Adding...' : 'Continue'}
                </button>
                <button
                  onClick={() => setShowAddCharityForm(false)}
                  disabled={addingCharity}
                  className="flex-1 bg-gray-700 text-gray-200 px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition disabled:opacity-50"
                >
                  Cancel
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

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, location, or address..."
            className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">Max Distance</label>
            <select
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>Within 5 miles</option>
              <option value={10}>Within 10 miles</option>
              <option value={15}>Within 15 miles</option>
              <option value={25}>Within 25 miles</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">Sort By</label>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('price')}
                className={`flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap ${
                  sortBy === 'price' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                Price
              </button>
              <button
                onClick={() => setSortBy('distance')}
                className={`flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap ${
                  sortBy === 'distance' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                Distance
              </button>
              <button
                onClick={() => setSortBy('rating')}
                className={`flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap ${
                  sortBy === 'rating' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                Rating
              </button>
            </div>
          </div>
        </div>
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

      <div className="space-y-3 sm:space-y-4">
        {sortedCharities.map((charity) => (
          <div
            key={charity.id}
            className={`relative border rounded-2xl p-5 sm:p-7 hover:shadow-2xl hover:scale-[1.01] transition-all duration-200 ${
              charity.sponsorship || charity.company_benefit
                ? 'border-2 border-blue-500 bg-gradient-to-br from-blue-900/10 to-purple-900/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
          >
            {/* Subsidy badges */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
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
                    <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-bold bg-purple-600 text-white animate-pulse">
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

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{charity.name}</h3>
                {charity.rating > 0 ? (
                  <div className="flex items-center gap-1.5 text-sm text-gray-300">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{charity.rating.toFixed(1)}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400">Based on community donations</span>
                  </div>
                ) : null}
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

                <button
                  onClick={() => onSelect(charity)}
                  className="bg-blue-600 text-white px-8 py-3.5 rounded-xl text-base font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-lg hover:shadow-xl w-full sm:w-auto"
                >
                  Select
                </button>
              </div>
            </div>
          </div>
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
