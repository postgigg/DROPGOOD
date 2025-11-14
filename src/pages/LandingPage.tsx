import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, FileText, Clock, MessageCircle, X, MapPin, Star, CheckCircle, TrendingUp } from 'lucide-react';
import SEO from '../components/SEO/SEO';
import DropGoodLogo from '../components/DropGoodLogo';
import { LocalBusinessSchema, ServiceSchema, FAQSchema, HowToSchema, OrganizationSchema } from '../components/SEO/StructuredData';
import { seoPages } from '../components/SEO/seoConfig';
import { searchAddress, retrieveAddressDetails, type AddressSearchResult } from '../lib/mapboxSearch';

interface SavedBooking {
  id: string;
  timestamp: number;
}

interface Stat {
  value: string;
  label: string;
  icon: React.ReactNode;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [recentBookings, setRecentBookings] = useState<SavedBooking[]>([]);
  const [showSupportPrompt, setShowSupportPrompt] = useState(false);
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stats: Stat[] = [
    {
      value: '<10 min',
      label: 'Pickup time',
      icon: <Clock className="h-5 w-5" />,
    },
    {
      value: '500+',
      label: 'Cities nationwide',
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      value: '24/7',
      label: 'Available anytime',
      icon: <Clock className="h-5 w-5" />,
    },
  ];

  useEffect(() => {
    // Load recent bookings from localStorage
    const savedBookings = localStorage.getItem('dropgood_booking_history');
    if (savedBookings) {
      try {
        const bookings = JSON.parse(savedBookings);
        setRecentBookings(bookings.slice(0, 3)); // Show last 3 bookings
      } catch (e) {
        console.error('Error loading booking history:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (address.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchAddress(address);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error searching address:', error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [address]);

  const handleSuggestionClick = async (suggestion: AddressSearchResult) => {
    setSelectedAddress(suggestion);
    setAddress(suggestion.full_address);
    setShowSuggestions(false);

    // Fetch full details using Mapbox retrieve endpoint
    try {
      console.log('📍 Selected suggestion:', suggestion);
      console.log('📍 Retrieving full details for mapbox_id:', suggestion.mapbox_id);

      const fullDetails = await retrieveAddressDetails(suggestion.mapbox_id);

      console.log('📍 Retrieved full details result:', fullDetails);

      if (!fullDetails || fullDetails.coordinates.latitude === 0) {
        console.warn('⚠️ Retrieve failed or returned 0,0 coordinates, trying fallback');
        throw new Error('Could not retrieve coordinates');
      }

      console.log('📍 Using coordinates from retrieve:', fullDetails.coordinates);

      // Now use reverse geocoding to get structured address components
      const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
      const { latitude, longitude } = fullDetails.coordinates;

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}`
      );

      if (!response.ok) throw new Error('Failed to fetch address details');

      const data = await response.json();
      const feature = data.features?.[0];

      if (!feature) throw new Error('No address details found');

      // Extract address components from context
      const cityObj = feature.context?.find((c: any) => c.id.startsWith('place'));
      const stateObj = feature.context?.find((c: any) => c.id.startsWith('region'));
      const zipObj = feature.context?.find((c: any) => c.id.startsWith('postcode'));

      // Get street address from the feature
      const streetNumber = feature.address || '';
      const streetName = feature.text || '';
      const street = streetNumber ? `${streetNumber} ${streetName}` : streetName;

      const addressData = {
        street: street || fullDetails.full_address.split(',')[0],
        city: cityObj?.text || '',
        state: stateObj?.short_code?.replace('US-', '') || stateObj?.text || '',
        zip: zipObj?.text || '',
        latitude: latitude,
        longitude: longitude,
      };

      console.log('📍 Landing page selected address:', addressData);

      // Auto-navigate to booking with address data
      navigate('/book', { state: { address: addressData } });
    } catch (error) {
      console.error('Error fetching address details:', error);
      alert('Could not get location details. Please try selecting the address again.');
    }
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAddress) {
      // User hit enter after selecting - trigger the same logic
      handleSuggestionClick(selectedAddress);
    } else if (address.trim()) {
      // No address selected, just go to booking
      navigate('/book');
    }
  };

  return (
    <>
      {/* SEO Meta Tags */}
      <SEO {...seoPages.home} />

      {/* Structured Data for Search Engines */}
      <LocalBusinessSchema />
      <ServiceSchema />
      <FAQSchema />
      <HowToSchema />
      <OrganizationSchema />

      <div className="min-h-screen bg-black">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 sm:h-20">
              <button onClick={() => navigate('/')} className="flex items-center gap-2 sm:gap-3 group">
                <DropGoodLogo className="group-hover:opacity-90 transition" size={32} />
                <span className="text-xl sm:text-2xl font-black text-white">DropGood</span>
              </button>
              <div className="flex items-center gap-3 sm:gap-6">
                <button
                  onClick={() => navigate('/donation-centers')}
                  className="text-sm sm:text-base text-gray-300 hover:text-white transition font-medium hidden sm:block"
                >
                  For Charities
                </button>
                <button
                  onClick={() => navigate('/for-companies')}
                  className="text-sm sm:text-base text-gray-300 hover:text-white transition font-medium hidden sm:block"
                >
                  For Companies
                </button>
                <button
                  onClick={() => navigate('/book')}
                  className="bg-white text-black px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-semibold hover:bg-gray-100 transition text-sm sm:text-base"
                >
                  Book now
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="pt-16 sm:pt-20">
          <div className="bg-gray-900 py-20 sm:py-32 md:py-40 relative overflow-hidden">
            {/* Simple dark background with photo */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              {/* Family with donation boxes and driver - pickup scene */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `url('/dropgood_header.jpg')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'blur(2px)',
                }}
              />

              {/* Simple dark black overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'rgba(0, 0, 0, 0.6)',
                }}
              />
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="max-w-3xl">
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 sm:mb-8 leading-[1.1] tracking-tight">
                  Donate without the drive
                </h1>

                <p className="text-xl sm:text-2xl md:text-3xl text-white/90 mb-8 sm:mb-12 font-medium leading-relaxed">
                  We pick up. We deliver. You support local charities.
                </p>

                {/* Address Input Form */}
                <form onSubmit={handleAddressSubmit} className="mb-6 sm:mb-8">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-2xl">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        placeholder="Enter your address"
                        className="w-full pl-12 pr-4 py-4 sm:py-5 text-base sm:text-lg bg-white rounded-xl sm:rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30 font-medium shadow-xl"
                        autoComplete="off"
                      />

                      {/* Autocomplete Dropdown */}
                      {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-80 overflow-y-auto">
                          {suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="w-full text-left px-4 py-4 hover:bg-gray-100 transition flex items-start gap-3 border-b border-gray-100 last:border-0"
                            >
                              <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 truncate">
                                  {suggestion.name || suggestion.full_address.split(',')[0]}
                                </div>
                                <div className="text-sm text-gray-600 truncate">
                                  {suggestion.place_formatted || suggestion.full_address}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {isSearching && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={!selectedAddress && !address.trim()}
                      className="group bg-blue-600 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold hover:bg-blue-700 transition shadow-xl inline-flex items-center justify-center gap-3 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      See prices
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </form>

                <p className="text-white/70 text-base sm:text-lg">
                  Typically $6-15 · 2-minute booking · Available in 500+ cities
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dolly Partnership Banner */}
        <div className="bg-blue-600 border-y border-blue-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-center sm:text-left">
              <DropGoodLogo size={28} className="flex-shrink-0" />
              <div>
                <p className="text-white font-bold text-base sm:text-lg">
                  Have bigger items?{' '}
                  <span className="font-normal">We're partnering with Dolly for furniture and large item pickups.</span>
                </p>
              </div>
              <a
                href="https://dolly.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white font-semibold hover:text-blue-100 transition inline-flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
              >
                Learn more
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Trust Stats Bar - Dark */}
        <div className="bg-gray-900 py-8 sm:py-12 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-3 gap-8 sm:gap-12">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="text-blue-500">{stat.icon}</div>
                    <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
                      {stat.value}
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm md:text-base text-gray-400 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <main className="bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-32">

            {/* How It Works - Dark Section */}
            <div className="text-center mb-20 sm:mb-32">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 sm:mb-6">
                Three simple steps
              </h2>
              <p className="text-lg sm:text-xl text-gray-400 mb-12 sm:mb-16 max-w-2xl mx-auto">
                From your couch to charity in minutes
              </p>

              <div className="grid md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-blue-600/20 rounded-2xl sm:rounded-3xl mb-6 border border-blue-600/30">
                    <MapPin className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                    Enter address
                  </h3>
                  <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
                    See exact prices for nearby charities based on distance
                  </p>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-green-600/20 rounded-2xl sm:rounded-3xl mb-6 border border-green-600/30">
                    <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-green-500" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                    Choose time and charity
                  </h3>
                  <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
                    Pick your favorite charity and schedule a convenient pickup time
                  </p>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-purple-600/20 rounded-2xl sm:rounded-3xl mb-6 border border-purple-600/30">
                    <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-purple-500" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                    We handle it
                  </h3>
                  <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
                    Pickup, delivery, and tax documentation—all done automatically
                  </p>
                </div>
              </div>
            </div>


            {/* What We Accept - Dark Grid */}
            <div className="mb-20 sm:mb-32 bg-gray-900/50 rounded-3xl p-8 sm:p-12 md:p-16 border border-gray-800">
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-12 text-center">
                What we accept
              </h2>

              <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 sm:p-8">
                  <div className="text-green-500 font-black text-2xl mb-4">✓</div>
                  <h3 className="text-xl font-bold text-white mb-4">We take</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Clothing & shoes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Books & media</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Small electronics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Household items</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Toys & baby items</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 sm:p-8">
                  <div className="text-red-500 font-black text-2xl mb-4">✗</div>
                  <h3 className="text-xl font-bold text-white mb-4">We don't take</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span>Furniture of any size</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span>Mattresses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span>Large appliances</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span>Broken items</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span>Hazardous materials</span>
                    </li>
                  </ul>
                </div>
              </div>

              <p className="text-center text-gray-400 mt-8 text-lg">
                Think: bags and boxes you'd carry yourself
              </p>
            </div>

            {/* FAQ Section - Dark Accordion Style */}
            <div className="mb-20 sm:mb-32">
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-12 text-center">
                Common questions
              </h2>

              <div className="max-w-3xl mx-auto space-y-4">
                <details className="group bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:bg-gray-800/50 transition cursor-pointer">
                  <summary className="flex items-center justify-between font-bold text-white text-lg cursor-pointer list-none">
                    How does pricing work?
                    <ArrowRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="mt-4 text-gray-400 leading-relaxed">
                    Pricing is based purely on distance from your location to the charity. The closer the charity, the lower the price. You'll see exact prices for all nearby charities before booking—no surprises.
                  </p>
                </details>

                <details className="group bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:bg-gray-800/50 transition cursor-pointer">
                  <summary className="flex items-center justify-between font-bold text-white text-lg cursor-pointer list-none">
                    What if I'm not home during pickup?
                    <ArrowRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="mt-4 text-gray-400 leading-relaxed">
                    Just leave your items in a safe, accessible spot (porch, garage, etc.) and include detailed instructions during booking. We'll text you when the courier is on the way and when pickup is complete.
                  </p>
                </details>

                <details className="group bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:bg-gray-800/50 transition cursor-pointer">
                  <summary className="flex items-center justify-between font-bold text-white text-lg cursor-pointer list-none">
                    Do I get a tax receipt?
                    <ArrowRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="mt-4 text-gray-400 leading-relaxed">
                    Yes! You'll receive a donation summary with all your donation details. For 501(c)(3) partner charities, you'll get an official tax-deductible receipt. For non-501(c)(3) charities, you'll receive a donation summary you can forward to them for an official receipt.
                  </p>
                </details>

                <details className="group bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:bg-gray-800/50 transition cursor-pointer">
                  <summary className="flex items-center justify-between font-bold text-white text-lg cursor-pointer list-none">
                    How quickly can you pick up?
                    <ArrowRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="mt-4 text-gray-400 leading-relaxed">
                    Most pickups are available within 24 hours. You can schedule up to a week in advance. We'll send you a text 30 minutes before arrival.
                  </p>
                </details>
              </div>
            </div>

            {/* Final CTA Section - Dark */}
            <div className="bg-gray-800 border border-gray-700 rounded-3xl p-12 sm:p-16 md:p-24 mb-20">
              <div className="text-center">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6">
                  Ready to donate?
                </h2>
                <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                  Enter your address to see prices for nearby charities
                </p>
                <button
                  onClick={() => navigate('/book')}
                  className="group bg-blue-600 text-white px-10 sm:px-12 py-4 sm:py-5 rounded-xl text-lg sm:text-xl font-bold hover:bg-blue-700 transition shadow-xl inline-flex items-center gap-3"
                >
                  Get started
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="mt-6 text-gray-500 text-sm">
                  Takes 2 minutes · No account required
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer - Clean Modern */}
        <footer className="bg-black border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
              <div>
                <h3 className="text-white font-bold mb-4">Company</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><button onClick={() => navigate('/about')} className="hover:text-white transition">About</button></li>
                  <li><button className="hover:text-white transition">Careers</button></li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-bold mb-4">Product</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><button onClick={() => navigate('/book')} className="hover:text-white transition">Book Pickup</button></li>
                  <li><button onClick={() => navigate('/pricing')} className="hover:text-white transition">Pricing</button></li>
                  <li><button onClick={() => navigate('/service-areas')} className="hover:text-white transition">Service Areas</button></li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-bold mb-4">For Charities</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><button onClick={() => navigate('/donation-centers')} className="hover:text-white transition">Get Listed</button></li>
                  <li><button onClick={() => navigate('/donation-centers')} className="hover:text-white transition">Sponsorships</button></li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-bold mb-4">For Companies</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><button onClick={() => navigate('/for-companies')} className="hover:text-white transition">Employee Benefits</button></li>
                  <li><button onClick={() => navigate('/company-signup')} className="hover:text-white transition">Sign Up Free</button></li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-bold mb-4">Support</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><button onClick={() => navigate('/help')} className="hover:text-white transition">Help Center</button></li>
                  <li><button onClick={() => navigate('/contact')} className="hover:text-white transition">Contact</button></li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex flex-col items-center sm:items-start gap-1">
                <div className="flex items-center gap-2">
                  <DropGoodLogo size={24} />
                  <span className="text-white font-bold text-lg">DropGood</span>
                </div>
                <p className="text-gray-500 text-xs">(A Workbird LLC Company)</p>
              </div>
              <p className="text-gray-500 text-sm">&copy; 2025 DropGood. All rights reserved.</p>
            </div>
          </div>
        </footer>

        {/* Support Chat Button */}
        <button
          onClick={() => setShowSupportPrompt(!showSupportPrompt)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-2xl hover:bg-blue-700 transition z-50 flex items-center gap-2"
        >
          <MessageCircle className="h-6 w-6" />
        </button>

        {showSupportPrompt && (
          <div className="fixed bottom-24 right-6 bg-white rounded-2xl shadow-2xl p-6 w-80 z-50 border border-gray-200">
            <button
              onClick={() => setShowSupportPrompt(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
              </button>
            <h3 className="font-bold text-gray-900 mb-2 text-lg">Need help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Questions about bookings, pricing, or donations?
            </p>
            <div className="space-y-2">
              <a
                href="mailto:support@dropgood.com"
                className="block text-center bg-blue-600 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
              >
                Email Support
              </a>
              <button
                onClick={() => navigate('/book')}
                className="block w-full text-center bg-gray-100 text-gray-900 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-gray-200 transition"
              >
                Start Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
