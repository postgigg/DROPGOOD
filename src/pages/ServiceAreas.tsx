import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MapPin, Check, Truck, Clock, Heart, Star } from 'lucide-react';

const featuredCities = [
  { city: 'Richmond', state: 'VA', isHeadquarters: true },
  { city: 'Virginia Beach', state: 'VA' },
  { city: 'Norfolk', state: 'VA' },
  { city: 'Chesapeake', state: 'VA' },
  { city: 'Arlington', state: 'VA' },
  { city: 'Alexandria', state: 'VA' },
  { city: 'Roanoke', state: 'VA' },
  { city: 'Newport News', state: 'VA' },
];

const states = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

const benefits = [
  {
    icon: Truck,
    title: 'Local Drivers',
    description: 'Verified, background-checked drivers in your area'
  },
  {
    icon: Clock,
    title: 'Flexible Scheduling',
    description: 'Choose pickup times that work for your schedule'
  },
  {
    icon: Heart,
    title: 'Support Local Charities',
    description: 'Donate to causes in your community'
  },
  {
    icon: Check,
    title: 'Reliable Service',
    description: 'Real-time updates from booking to delivery'
  }
];

export default function ServiceAreas() {
  return (
    <>
      <Helmet>
        <title>Service Areas - Nationwide Donation Pickup | DropGood</title>
        <meta name="description" content="DropGood provides donation pickup services nationwide across all 50 states. Headquartered in Richmond, VA with full Virginia coverage. Schedule your pickup today." />
        <meta name="keywords" content="donation pickup service areas, nationwide donation pickup, Virginia donation pickup, Richmond VA charity pickup, donation service near me" />
        <link rel="canonical" href="https://dropgood.co/service-areas" />

        {/* Open Graph */}
        <meta property="og:title" content="Nationwide Donation Pickup Service - DropGood" />
        <meta property="og:description" content="We serve all 50 states with convenient donation pickup. Find out if we're in your area." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dropgood.co/service-areas" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Service Areas - DropGood" />
        <meta name="twitter:description" content="Nationwide donation pickup services across all 50 states." />

        {/* Local Business Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "DropGood",
            "description": "Nationwide donation pickup service",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Richmond",
              "addressRegion": "VA",
              "addressCountry": "US"
            },
            "areaServed": {
              "@type": "Country",
              "name": "United States"
            },
            "serviceArea": {
              "@type": "GeoCircle",
              "geoMidpoint": {
                "@type": "GeoCoordinates",
                "latitude": "37.5407",
                "longitude": "-77.4360"
              }
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-slate-900">
        {/* Header */}
        <div className="bg-gradient-to-b from-slate-800 to-slate-900 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <Link to="/" className="inline-block mb-6">
                <h1 className="text-3xl font-bold text-white">DropGood</h1>
              </Link>
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2 mb-6">
                <MapPin className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold text-sm">Serving All 50 States</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                We're Nationwide
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                From coast to coast, DropGood makes donation pickups convenient for everyone.
                Headquartered in Richmond, Virginia, we connect donors with local charities nationwide.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Featured: Virginia & Richmond */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-8 sm:p-12 text-white shadow-2xl">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-white/20 rounded-full p-3">
                    <Star className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold">Featured Coverage</h3>
                    <p className="text-emerald-50">Our headquarters and primary service area</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="h-6 w-6" />
                      <h4 className="text-2xl font-bold">Richmond, VA</h4>
                    </div>
                    <div className="bg-white/10 rounded-lg px-3 py-1.5 inline-block mb-4">
                      <span className="text-sm font-semibold">Headquarters</span>
                    </div>
                    <p className="text-emerald-50 mb-4">
                      Our home base with the fastest response times and extensive charity network.
                    </p>
                    <ul className="space-y-2 text-emerald-50">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 flex-shrink-0" />
                        Same-day pickup available
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 flex-shrink-0" />
                        50+ partner charities
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 flex-shrink-0" />
                        Premium service options
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="h-6 w-6" />
                      <h4 className="text-2xl font-bold">All of Virginia</h4>
                    </div>
                    <p className="text-emerald-50 mb-4">
                      Complete coverage across the entire Commonwealth of Virginia
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-emerald-50">
                      {featuredCities.map((city) => (
                        <div key={`${city.city}-${city.state}`} className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 flex-shrink-0" />
                          <span>{city.city}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-emerald-100 text-xs mt-4 italic">
                      And many more cities across Virginia
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-white text-center mb-4">
              Why Choose DropGood?
            </h3>
            <p className="text-slate-400 text-center mb-10 max-w-2xl mx-auto">
              No matter where you are in the country, we deliver the same high-quality service
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={benefit.title}
                    className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/10"
                  >
                    <div className="bg-emerald-500/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-emerald-400" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">{benefit.title}</h4>
                    <p className="text-slate-400 text-sm">{benefit.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* All States Coverage */}
          <div className="mb-16">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 sm:p-12">
              <div className="text-center mb-10">
                <h3 className="text-3xl font-bold text-white mb-4">
                  Complete U.S. Coverage
                </h3>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Our network of local drivers spans all 50 states, ensuring you can donate
                  conveniently no matter where you live
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {states.map((state) => (
                  <div
                    key={state}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-3 hover:border-emerald-500/50 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors">
                        {state}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-2xl p-8 sm:p-12">
              <h3 className="text-3xl font-bold text-white text-center mb-10">
                How It Works
              </h3>

              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="text-center">
                  <div className="bg-emerald-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    1
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">Enter Your Address</h4>
                  <p className="text-slate-400">
                    We'll instantly check if we serve your area (we almost certainly do!)
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-emerald-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    2
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">Choose Your Charity</h4>
                  <p className="text-slate-400">
                    Select from local charities in your community
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-emerald-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    3
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">Schedule Pickup</h4>
                  <p className="text-slate-400">
                    Pick a convenient time and we'll handle the rest
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-8 sm:p-12 shadow-2xl">
              <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Make a Difference?
              </h3>
              <p className="text-emerald-50 text-lg mb-8 max-w-2xl mx-auto">
                Schedule your donation pickup today and support charities in your local community
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  to="/book"
                  className="px-8 py-4 bg-white text-emerald-600 rounded-lg font-bold text-lg hover:bg-emerald-50 transition-colors shadow-xl"
                >
                  Schedule Pickup Now
                </Link>
                <Link
                  to="/contact"
                  className="px-8 py-4 bg-emerald-700 text-white rounded-lg font-bold text-lg hover:bg-emerald-800 transition-colors"
                >
                  Contact Us
                </Link>
              </div>
              <p className="text-emerald-100 text-sm mt-6">
                Questions? Call us at (800) 555-1234 or chat with our support team
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
