import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Clock, CheckCircle } from 'lucide-react';
import SEO from '../components/SEO/SEO';
import { LocalBusinessSchema, BreadcrumbSchema } from '../components/SEO/StructuredData';
import { getCitySEO, generateCitySEO, type CitySEOConfig } from '../components/SEO/seoConfig';
import DropGoodLogo from '../components/DropGoodLogo';

export default function CityLandingPage() {
  const { citySlug } = useParams<{ citySlug: string }>();
  const navigate = useNavigate();

  // Get city data from config or generate it dynamically
  const cityData: CitySEOConfig | null = citySlug ? getCitySEO(citySlug) : null;

  // If no city data found in config, we could generate it or show 404
  if (!cityData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold text-white mb-4">City not found</h1>
          <p className="text-gray-400 mb-8">We're expanding to new cities every week.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const { cityName, stateName, stateCode, localCharities = [] } = cityData;

  return (
    <>
      {/* SEO Meta Tags */}
      <SEO {...cityData} />

      {/* Structured Data */}
      <LocalBusinessSchema cityName={cityName} stateName={stateName} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://dropgood.com' },
          { name: `${cityName}, ${stateCode}`, url: `https://dropgood.com/donate/${citySlug}` },
        ]}
      />

      <div className="min-h-screen bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Navigation */}
          <nav className="flex justify-between items-center mb-12 sm:mb-20">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 sm:gap-3 hover:opacity-80">
              <DropGoodLogo size={40} className="sm:w-10 sm:h-10" />
              <span className="text-2xl sm:text-3xl font-black text-white">DropGood</span>
            </button>
            <button
              onClick={() => navigate('/book')}
              className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition text-xs sm:text-sm"
            >
              Book Pickup
            </button>
          </nav>

          {/* Hero Section */}
          <main>
            <div className="max-w-4xl">
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 sm:mb-8 leading-[0.95] tracking-tight">
                Donation pickup in {cityName}, {stateCode}
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-4 sm:mb-6 font-medium">
                Schedule pickup and delivery to local {cityName} charities. Done in 2 minutes.
              </p>

              <div className="mb-8 sm:mb-12 space-y-2 sm:space-y-3 text-base sm:text-lg md:text-xl text-gray-300">
                <p>• We pick up from your door in {cityName}</p>
                <p>• Deliver to verified {cityName} charities</p>
                <p>• Tax-deductible receipts automatically sent</p>
              </div>

              <button
                onClick={() => navigate('/book')}
                className="group bg-blue-600 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl text-lg sm:text-xl font-bold hover:bg-blue-700 transition shadow-xl inline-flex items-center gap-3 w-full sm:w-auto justify-center"
              >
                Enter your {cityName} address
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="mt-4 sm:mt-6 text-gray-400 text-base sm:text-lg text-center sm:text-left">
                Typical cost: $6-15. Available across {cityName} metro area.
              </p>
            </div>

            {/* Local Charities Section */}
            {localCharities.length > 0 && (
              <div className="mt-16 sm:mt-24 bg-gray-800 border border-gray-700 rounded-2xl sm:rounded-3xl p-6 sm:p-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-6 sm:mb-8 text-center">
                  {cityName} Charities We Partner With
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {localCharities.map((charity, index) => (
                    <div key={index} className="flex items-center gap-3 bg-gray-900 border border-gray-700 rounded-lg p-4">
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                      <span className="text-lg text-white">{charity}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-center text-gray-400">
                  ...and many more {cityName} charities accepting donations
                </p>
              </div>
            )}

            {/* How It Works */}
            <div className="mt-16 sm:mt-24 md:mt-32 border-t border-gray-700 pt-12 sm:pt-16">
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-6 sm:mb-8">
                How it works in {cityName}
              </h2>
              <div className="space-y-4 sm:space-y-6 text-lg sm:text-xl text-gray-300">
                <div className="flex gap-4">
                  <span className="font-black text-blue-500 text-2xl">1.</span>
                  <p>Enter your {cityName} address</p>
                </div>
                <div className="flex gap-4">
                  <span className="font-black text-blue-500 text-2xl">2.</span>
                  <p>See prices for nearby {cityName} charities based on distance</p>
                </div>
                <div className="flex gap-4">
                  <span className="font-black text-blue-500 text-2xl">3.</span>
                  <p>Pick a convenient time slot</p>
                </div>
                <div className="flex gap-4">
                  <span className="font-black text-blue-500 text-2xl">4.</span>
                  <p>We pick it up and deliver it to your chosen {cityName} charity</p>
                </div>
                <div className="flex gap-4">
                  <span className="font-black text-blue-500 text-2xl">5.</span>
                  <p>Get your tax receipt and photo proof of delivery</p>
                </div>
              </div>
            </div>

            {/* Service Area Map (Placeholder) */}
            <div className="mt-16 sm:mt-24 bg-gray-800 border border-gray-700 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <MapPin className="h-8 w-8 text-blue-500 flex-shrink-0" />
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Serving All of {cityName} Metro Area
                  </h3>
                  <p className="text-gray-300 text-lg mb-4">
                    We provide donation pickup service throughout {cityName}, {stateName} and surrounding communities.
                  </p>
                  <p className="text-gray-400">
                    Enter your address during booking to see exact pricing and available charities near you.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="mt-16 sm:mt-24 md:mt-32 text-center">
              <button
                onClick={() => navigate('/book')}
                className="group bg-blue-600 text-white px-10 sm:px-12 py-5 sm:py-6 rounded-xl text-xl sm:text-2xl font-black hover:bg-blue-700 transition shadow-xl inline-flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-center"
              >
                Schedule pickup in {cityName}
                <ArrowRight className="group-hover:translate-x-1 transition-transform w-6 h-6 sm:w-7 sm:h-7" />
              </button>
            </div>
          </main>

          {/* Footer */}
          <footer className="mt-16 sm:mt-24 md:mt-32 pt-6 sm:pt-8 border-t border-gray-700">
            <div className="text-center mb-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-400 hover:text-gray-300 text-sm"
              >
                ← Back to main site
              </button>
            </div>
            <p className="text-center text-gray-500 text-sm sm:text-base">
              &copy; 2025 DropGood - Serving {cityName} and 500+ cities nationwide
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
