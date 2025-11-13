import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, DollarSign, TrendingUp, Users, Target, Zap, CheckCircle } from 'lucide-react';
import SEO from '../components/SEO/SEO';
import { seoPages } from '../components/SEO/seoConfig';
import DropGoodLogo from '../components/DropGoodLogo';

export default function DonationCenterLanding() {
  const navigate = useNavigate();

  return (
    <>
      <SEO {...seoPages.donationCenters} />
      <div className="min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <nav className="flex justify-between items-center mb-12 sm:mb-20">
          <div className="flex items-center gap-2 sm:gap-3">
            <DropGoodLogo size={40} className="sm:w-10 sm:h-10" />
            <span className="text-2xl sm:text-3xl font-black text-white">DropGood</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/')}
              className="text-gray-300 hover:text-white px-3 sm:px-4 py-2 rounded-lg font-semibold transition text-xs sm:text-sm"
            >
              Home
            </button>
            <div className="bg-gray-700 text-gray-400 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm cursor-not-allowed">
              Coming Soon
            </div>
          </div>
        </nav>

        <main>
          <div className="max-w-4xl">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 sm:mb-8 leading-[0.95] tracking-tight">
              Drive more donations to your center
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-4 sm:mb-6 font-medium">
              Free listing. Powerful sponsorships. More donors.
            </p>

            <div className="mb-8 sm:mb-12 space-y-2 sm:space-y-3 text-base sm:text-lg md:text-xl text-gray-300">
              <p>• Get listed on DropGood for free</p>
              <p>• Subsidize pickups to attract more donors</p>
              <p>• Target specific neighborhoods and demographics</p>
            </div>

            <div className="bg-gray-700 text-gray-400 px-8 sm:px-10 py-4 sm:py-5 rounded-xl text-lg sm:text-xl font-bold cursor-not-allowed inline-flex items-center gap-3 w-full sm:w-auto justify-center">
              Coming Soon
            </div>

            <p className="mt-4 sm:mt-6 text-gray-400 text-base sm:text-lg text-center sm:text-left">
              We're preparing something special for donation centers.
            </p>
          </div>

          <div className="mt-16 sm:mt-24 md:mt-32 grid sm:grid-cols-3 gap-8 sm:gap-12 md:gap-16">
            <div>
              <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Free Listing</h3>
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                Add your donation center locations at no cost. Be discovered by thousands of potential donors in your area.
              </p>
            </div>

            <div>
              <div className="bg-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Smart Sponsorships</h3>
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                Subsidize pickup costs for donors. Pay 50% and we'll bring you 2x more donations from your target area.
              </p>
            </div>

            <div>
              <div className="bg-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Boost Visibility</h3>
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                Sponsored centers appear first in search results with discounted pricing, driving more volume to you.
              </p>
            </div>
          </div>

          <div className="mt-16 sm:mt-24 md:mt-32 bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-2xl sm:rounded-3xl p-6 sm:p-12 md:p-16 border border-gray-700">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-6 sm:mb-8 text-center">
              How sponsorships work
            </h2>

            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</div>
                    <h3 className="text-lg font-bold text-white">Set your subsidy</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    Choose how much you'll subsidize. Pay 50% of pickup costs? 75%? 100%? You control the budget.
                  </p>
                </div>

                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</div>
                    <h3 className="text-lg font-bold text-white">Target your area</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    Define a radius around your center. Only donors in that area see your discounted pricing.
                  </p>
                </div>

                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</div>
                    <h3 className="text-lg font-bold text-white">Appear first</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    Your center shows at the top with a "SPONSORED" badge and lower prices. More visibility = more donations.
                  </p>
                </div>

                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">4</div>
                    <h3 className="text-lg font-bold text-white">Auto-recharge</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    Set it and forget it. When your credit hits $250, we auto-recharge to keep your campaign running.
                  </p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <div className="inline-block bg-gray-900 border border-gray-700 rounded-xl p-6">
                  <p className="text-sm text-gray-400 mb-2">Example: Goodwill subsidizes 50% in 5-mile radius</p>
                  <div className="flex items-center justify-center gap-4">
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Regular price</p>
                      <p className="text-white font-bold text-lg line-through">$12.00</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Donor pays</p>
                      <p className="text-green-400 font-bold text-2xl">$6.00</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-gray-400 text-xs mb-1">You pay</p>
                      <p className="text-blue-400 font-bold text-2xl">$6.00</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 sm:mt-24 md:mt-32 border-t border-gray-700 pt-12 sm:pt-16">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-6 sm:mb-8 text-center">
              Why donation centers choose DropGood
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <CheckCircle className="h-8 w-8 text-green-500 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">No upfront costs</h3>
                <p className="text-gray-300">
                  Free listing. Only pay when you want to sponsor pickups and drive more volume.
                </p>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <Target className="h-8 w-8 text-blue-500 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Geographic targeting</h3>
                <p className="text-gray-300">
                  Focus your budget on neighborhoods that matter most to your organization.
                </p>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <Users className="h-8 w-8 text-purple-500 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Quality donors</h3>
                <p className="text-gray-300">
                  Reach people actively looking to donate, not random foot traffic.
                </p>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <Zap className="h-8 w-8 text-yellow-500 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Instant setup</h3>
                <p className="text-gray-300">
                  Create account, add locations, launch campaign. All in under 5 minutes.
                </p>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <TrendingUp className="h-8 w-8 text-green-500 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Real-time analytics</h3>
                <p className="text-gray-300">
                  Track how much you've spent, donations received, and ROI for each campaign.
                </p>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <DollarSign className="h-8 w-8 text-blue-500 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Flexible budgets</h3>
                <p className="text-gray-300">
                  Set daily limits, pause anytime, adjust subsidy percentage on the fly.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 sm:mt-24 md:mt-32 bg-gray-800 border border-gray-700 text-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-8">
                Ready to grow your donation volume?
              </h2>
              <div className="bg-gray-700 text-gray-400 px-10 sm:px-12 py-5 sm:py-6 rounded-xl text-xl sm:text-2xl font-black cursor-not-allowed inline-flex items-center gap-3 sm:gap-4">
                Coming Soon
              </div>
              <p className="mt-6 text-gray-400 text-sm sm:text-base">
                We're preparing something special for donation centers.
              </p>
            </div>
          </div>

          <div className="mt-16 sm:mt-24 md:mt-32 bg-gray-800 border border-gray-700 rounded-2xl p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-8 text-center border-b border-gray-600 pb-4">
              Common questions
            </h2>

            <div className="max-w-4xl mx-auto space-y-8">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Do we have to subsidize pickups?</h3>
                <p className="text-gray-300 leading-relaxed">
                  No! Free listing is 100% free forever. Subsidies are optional and only if you want to drive more volume.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">What if we want to pause our campaign?</h3>
                <p className="text-gray-300 leading-relaxed">
                  Click "pause" in your dashboard anytime. No penalty. Resume whenever you want.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">How do we know donors are legitimate?</h3>
                <p className="text-gray-300 leading-relaxed">
                  We verify addresses, track pickup photos, and send you delivery confirmation for every donation.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">Can we target specific types of donors?</h3>
                <p className="text-gray-300 leading-relaxed">
                  Yes. Set radius, schedule (weekdays only?), and even minimum donation size.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">What's the minimum budget?</h3>
                <p className="text-gray-300 leading-relaxed">
                  Start with just $100. Test it out. Scale when you see results.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">How is this different from our trucks?</h3>
                <p className="text-gray-300 leading-relaxed">
                  You only pay when you GET donations. No fixed costs. No trucks to maintain. No drivers to schedule.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">Can we have multiple locations?</h3>
                <p className="text-gray-300 leading-relaxed">
                  Yes! Add unlimited locations. Each can have its own subsidy campaign and budget.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 sm:mt-24 md:mt-32 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-gray-300 text-sm"
            >
              ← Are you a donor? Go to main site
            </button>
          </div>
        </main>

        <footer className="mt-16 sm:mt-24 md:mt-32 pt-6 sm:pt-8 border-t border-gray-700 text-center text-gray-500 text-sm sm:text-base">
          <p>&copy; 2025 DropGood</p>
        </footer>
      </div>
    </div>
    </>
  );
}
