import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { DollarSign, Check, X, MapPin, AlertCircle } from 'lucide-react';
import DropGoodLogo from '../components/DropGoodLogo';

const includedFeatures = [
  'Pickup from your location',
  'Transport to donation center',
  'Real-time tracking',
  'Photo confirmation',
  'SMS updates',
  'Tax donation summary',
  'Customer support',
  'Flexible scheduling'
];

const notIncludedFeatures = [
  'Official tax receipt (partner charities only)',
  'Packing materials',
  'Disassembly of furniture',
  'Hazardous waste disposal'
];

const pricingExamples = [
  {
    distance: 'Short Distance',
    description: 'Nearby donation center',
    example: '2-5 miles',
    price: 'Starting at $15'
  },
  {
    distance: 'Medium Distance',
    description: 'Most common pickups',
    example: '6-15 miles',
    price: '$20 - $40',
    popular: true
  },
  {
    distance: 'Long Distance',
    description: 'Farther donation centers',
    example: '16-25 miles',
    price: '$45 - $65'
  }
];

export default function PricingPage() {
  return (
    <>
      <Helmet>
        <title>Pricing - How Much Does Donation Pickup Cost? | DropGood</title>
        <meta name="description" content="Simple distance-based donation pickup pricing. Pay based on the distance from your location to the donation center. No hidden fees. See exact price at checkout." />
        <meta name="keywords" content="donation pickup cost, charity pickup pricing, donation service price, pickup fee calculator, donation pickup rates, distance based pricing" />
        <link rel="canonical" href="https://dropgood.co/pricing" />

        {/* Open Graph */}
        <meta property="og:title" content="Pricing - DropGood Donation Pickup Service" />
        <meta property="og:description" content="Simple distance-based pricing for donation pickups. See your exact cost at checkout." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dropgood.co/pricing" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Pricing - DropGood" />
        <meta name="twitter:description" content="Simple distance-based donation pickup pricing. No hidden fees." />
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
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold text-sm">No Hidden Fees</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Simple, Distance-Based Pricing
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Know exactly what you'll pay before you book. Our pricing is based on the distance from your location to the donation center you choose.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* How It Works */}
          <div className="mb-16">
            <div className="max-w-4xl mx-auto">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 sm:p-12">
                <div className="text-center mb-8">
                  <div className="bg-emerald-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-emerald-400" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">How Pricing Works</h3>
                  <p className="text-slate-400 text-lg">
                    Simple, transparent, and fair
                  </p>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-emerald-500/10 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-400 font-bold text-xl">1</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white mb-2">Enter Your Address</h4>
                        <p className="text-slate-400">
                          Start by entering your pickup location during the booking process.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-emerald-500/10 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-400 font-bold text-xl">2</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white mb-2">Choose Your Charity</h4>
                        <p className="text-slate-400">
                          Select from available donation centers near you. You'll see the distance to each location.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-emerald-500/10 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-400 font-bold text-xl">3</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white mb-2">See Your Exact Price</h4>
                        <p className="text-slate-400">
                          Your total cost is calculated based on the distance. What you see is what you pay—no surprises.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-blue-300 text-sm">
                      Your exact price will be shown during booking before you confirm. The price is based on the distance from your address to the donation center you select.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Examples */}
          <div className="mb-16">
            <div className="max-w-5xl mx-auto">
              <h3 className="text-3xl font-bold text-white text-center mb-4">
                Pricing Examples
              </h3>
              <p className="text-slate-400 text-center mb-10">
                Get an idea of what to expect based on distance
              </p>

              <div className="grid sm:grid-cols-3 gap-6">
                {pricingExamples.map((example) => (
                  <div
                    key={example.distance}
                    className={`rounded-xl p-6 relative ${
                      example.popular
                        ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-2 border-emerald-500'
                        : 'bg-slate-800 border border-slate-700'
                    }`}
                  >
                    {example.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        MOST COMMON
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-2">{example.distance}</div>
                      <div className="text-slate-400 text-sm mb-3">{example.description}</div>
                      <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 mb-3">
                        <div className="text-slate-500 text-xs mb-1">Distance</div>
                        <div className="text-slate-300 font-semibold text-sm">{example.example}</div>
                      </div>
                      <div className={`text-xl font-bold ${example.popular ? 'text-emerald-400' : 'text-emerald-400'}`}>
                        {example.price}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <Link
                  to="/book"
                  className="inline-block px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg rounded-lg transition-colors shadow-lg"
                >
                  Get Your Exact Price
                </Link>
              </div>
            </div>
          </div>

          {/* What's Included */}
          <div className="mb-16">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Included */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-emerald-500/10 rounded-full w-10 h-10 flex items-center justify-center">
                    <Check className="h-5 w-5 text-emerald-400" />
                  </div>
                  <h4 className="text-2xl font-bold text-white">What's Included</h4>
                </div>
                <ul className="space-y-3">
                  {includedFeatures.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-slate-300">
                      <Check className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Not Included */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-slate-700 rounded-full w-10 h-10 flex items-center justify-center">
                    <X className="h-5 w-5 text-slate-400" />
                  </div>
                  <h4 className="text-2xl font-bold text-white">Not Included</h4>
                </div>
                <ul className="space-y-3">
                  {notIncludedFeatures.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-slate-400">
                      <X className="h-5 w-5 text-slate-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 p-3 bg-slate-900 border border-slate-700 rounded-lg">
                  <p className="text-slate-400 text-sm">
                    <span className="font-semibold text-slate-300">Partner charities</span> provide official tax-deductible receipts. Others receive a donation summary.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="mb-16">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold text-white text-center mb-10">
                Why Our Pricing is Different
              </h3>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <div className="bg-emerald-500/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <DropGoodLogo size={24} />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">
                    No Per-Item Charges
                  </h4>
                  <p className="text-slate-400">
                    Whether you have 5 boxes or 15 boxes, the price stays the same. We charge based on distance, not the number of items.
                  </p>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <div className="bg-emerald-500/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <Check className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">
                    Transparent & Upfront
                  </h4>
                  <p className="text-slate-400">
                    See your exact total before booking. No hidden fees, surge pricing, or surprises. What you see is what you pay.
                  </p>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <div className="bg-emerald-500/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <MapPin className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">
                    Distance-Based Only
                  </h4>
                  <p className="text-slate-400">
                    Simple and fair pricing based on how far we travel. Choose a closer donation center for a lower price.
                  </p>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <div className="bg-emerald-500/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <DollarSign className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">
                    One-Time Payment
                  </h4>
                  <p className="text-slate-400">
                    Pay once when you book. No recurring charges, no subscriptions, no membership fees.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Special Items */}
          <div className="mb-16">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-8 sm:p-12">
                <h3 className="text-2xl font-bold text-white mb-4 text-center">
                  Have Bigger Items?
                </h3>
                <p className="text-slate-300 text-center mb-6 leading-relaxed">
                  For large furniture, appliances, or specialty items that require extra care, we're partnering with
                  <span className="font-semibold text-blue-400"> Dolly Group</span> to ensure safe and professional handling.
                </p>
                <p className="text-slate-400 text-center text-sm">
                  Contact us for a custom quote on large item pickups
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-16">
            <div className="max-w-3xl mx-auto bg-slate-800 border border-slate-700 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Pricing FAQs</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-white mb-2">Are there any hidden fees?</h4>
                  <p className="text-slate-400">
                    No! The price you see during booking is exactly what you pay. No surprises, no extra charges.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">Do you charge based on the number of items?</h4>
                  <p className="text-slate-400">
                    No. We charge only based on distance traveled. Whether you have 5 boxes or 15 boxes, the price is the same as long as they fit in our vehicle.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">How do I see my exact price?</h4>
                  <p className="text-slate-400">
                    Start the booking process, enter your address, and select a donation center. Your exact price will be displayed before you confirm your booking.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">When do I pay?</h4>
                  <p className="text-slate-400">
                    Payment is processed when you complete your booking. You'll receive an email receipt immediately.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">Can I choose a closer charity to save money?</h4>
                  <p className="text-slate-400">
                    Yes! Since pricing is based on distance, choosing a donation center closer to your location will result in a lower price.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">What if I have very large items?</h4>
                  <p className="text-slate-400">
                    For oversized items like large furniture or appliances, we're partnering with Dolly Group for professional handling. Contact us for a custom quote.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">Can I get a refund?</h4>
                  <p className="text-slate-400">
                    Full refunds are available for cancellations made at least 24 hours before pickup. Contact us for assistance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-8 sm:p-12 shadow-2xl">
              <DollarSign className="h-12 w-12 text-white mx-auto mb-4" />
              <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Get Started?
              </h3>
              <p className="text-emerald-50 text-lg mb-8 max-w-2xl mx-auto">
                Book your pickup now and see your exact price based on your location and chosen donation center
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  to="/book"
                  className="px-8 py-4 bg-white text-emerald-600 rounded-lg font-bold text-lg hover:bg-emerald-50 transition-colors shadow-xl"
                >
                  Schedule Pickup
                </Link>
                <Link
                  to="/help"
                  className="px-8 py-4 bg-emerald-700 text-white rounded-lg font-bold text-lg hover:bg-emerald-800 transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
