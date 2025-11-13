import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Heart, TrendingUp, Users, Target, Zap, CheckCircle, Sparkles, DollarSign } from 'lucide-react';
import SEO from '../components/SEO/SEO';
import { seoPages } from '../components/SEO/seoConfig';
import DropGoodLogo from '../components/DropGoodLogo';

export default function ForCompanies() {
  const navigate = useNavigate();

  return (
    <>
      <SEO {...seoPages.forCompanies} />
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
              Free employee benefit. You only pay for what's used.
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-4 sm:mb-6 font-medium">
              Subsidized donation pickups. Happier employees. Great PR.
            </p>

            <div className="mb-8 sm:mb-12 space-y-2 sm:space-y-3 text-base sm:text-lg md:text-xl text-gray-300">
              <p>• Free to sign up. Unlimited employees.</p>
              <p>• Add credit balance. Pay only for subsidies used.</p>
              <p>• 100% tax deductible. Set it and forget it.</p>
            </div>

            <div className="bg-gray-700 text-gray-400 px-8 sm:px-10 py-4 sm:py-5 rounded-xl text-lg sm:text-xl font-bold shadow-xl inline-flex items-center gap-3 w-full sm:w-auto justify-center cursor-not-allowed">
              Coming Soon
            </div>

            <p className="mt-4 sm:mt-6 text-gray-400 text-base sm:text-lg text-center sm:text-left">
              B2B program launching soon. Contact us for early access.
            </p>
          </div>

          <div className="mt-16 sm:mt-24 md:mt-32 grid sm:grid-cols-3 gap-8 sm:gap-12 md:gap-16">
            <div>
              <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Employee Wellness</h3>
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                Decluttering reduces stress and improves mental health. Give your team an easier way to donate without hauling items.
              </p>
            </div>

            <div>
              <div className="bg-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Amazing PR</h3>
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                "Company X helped donate 2,000 items to local charities this year." Perfect for recruiting and ESG reports.
              </p>
            </div>

            <div>
              <div className="bg-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Pay As You Go</h3>
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                Free to start. No subscription fees. Just add credits and pay only when employees use pickups. 100% tax deductible.
              </p>
            </div>
          </div>

          <div className="mt-16 sm:mt-24 md:mt-32 bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-2xl sm:rounded-3xl p-6 sm:p-12 md:p-16 border border-gray-700">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-6 sm:mb-8 text-center">
              How it works
            </h2>

            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</div>
                    <h3 className="text-lg font-bold text-white">Sign up free</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    Create your company account. Set how much you'll subsidize (25%, 50%, or 100%). Add initial credit balance to get started.
                  </p>
                </div>

                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</div>
                    <h3 className="text-lg font-bold text-white">Get your access code</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    We generate a unique code like "ACME2025". Share it with your team via email, Slack, or your intranet.
                  </p>
                </div>

                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</div>
                    <h3 className="text-lg font-bold text-white">Employees enroll</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    They visit DropGood, enter the code, and they're instantly enrolled. No apps to download or accounts required.
                  </p>
                </div>

                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">4</div>
                    <h3 className="text-lg font-bold text-white">Discount applies automatically</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    When they book a pickup, your company's subsidy kicks in. They see the discount at checkout. You see the impact in your dashboard.
                  </p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <div className="inline-block bg-gray-900 border border-gray-700 rounded-xl p-6">
                  <p className="text-sm text-gray-400 mb-2">Example: TechCo subsidizes 50% for 100 employees</p>
                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Regular price</p>
                      <p className="text-white font-bold text-lg line-through">$20.00</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Employee pays</p>
                      <p className="text-green-400 font-bold text-2xl">$10.00</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Deducted from your balance</p>
                      <p className="text-blue-400 font-bold text-2xl">$10.00</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">
                    💡 You fund a credit balance (like a gift card). Subsidies are deducted as employees use them.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 sm:mt-24 md:mt-32 border-t border-gray-700 pt-12 sm:pt-16">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-6 sm:mb-8 text-center">
              Why companies choose DropGood
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <CheckCircle className="h-8 w-8 text-green-500 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Unique benefit</h3>
                <p className="text-gray-300">
                  Stand out from competitors. No one else offers subsidized donation pickups as an employee perk.
                </p>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <Target className="h-8 w-8 text-blue-500 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">100% tax deductible</h3>
                <p className="text-gray-300">
                  Write it off as an employee wellness benefit. Your accountant will love this one.
                </p>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <Users className="h-8 w-8 text-purple-500 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Boosts morale</h3>
                <p className="text-gray-300">
                  Employees love unique perks that make life easier. Especially remote teams.
                </p>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <Zap className="h-8 w-8 text-yellow-500 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Setup in minutes</h3>
                <p className="text-gray-300">
                  Create account, choose plan, get code. Share with team. Done. Seriously takes 5 minutes.
                </p>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <TrendingUp className="h-8 w-8 text-green-500 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Real-time tracking</h3>
                <p className="text-gray-300">
                  See who's using it, how much you're spending, and how many items your company has donated.
                </p>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <Building2 className="h-8 w-8 text-blue-500 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Great for recruiting</h3>
                <p className="text-gray-300">
                  "We cover donation pickups" is way more interesting than "we have a ping pong table."
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 sm:mt-24 md:mt-32 bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-2xl sm:rounded-3xl p-6 sm:p-12 md:p-16 border border-gray-700">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-6 sm:mb-8 text-center">
              How pricing works
            </h2>

            <div className="max-w-3xl mx-auto">
              <div className="bg-gray-900 border-2 border-blue-500 rounded-xl p-8 text-center">
                <div className="text-6xl font-black text-blue-400 mb-4">$0</div>
                <p className="text-2xl font-bold text-white mb-2">to sign up</p>
                <p className="text-gray-400 mb-8">No subscription fees. Ever.</p>

                <div className="border-t border-gray-700 pt-6 mb-6">
                  <h3 className="text-xl font-bold text-white mb-4">Pay-as-you-go for subsidies</h3>
                  <p className="text-gray-300 leading-relaxed mb-6">
                    Add credit to your account (like a prepaid card). When employees book pickups,
                    subsidies are deducted from your balance. Simple, transparent, fair.
                  </p>

                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <div className="grid md:grid-cols-3 gap-4 text-left">
                      <div>
                        <div className="text-sm text-gray-400 mb-1">You add</div>
                        <div className="text-2xl font-bold text-green-400">$500</div>
                        <div className="text-xs text-gray-500">to credit balance</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Employee books</div>
                        <div className="text-2xl font-bold text-white">$20</div>
                        <div className="text-xs text-gray-500">pickup (50% subsidy)</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Deducted</div>
                        <div className="text-2xl font-bold text-blue-400">$10</div>
                        <div className="text-xs text-gray-500">from your balance</div>
                      </div>
                    </div>
                  </div>
                </div>

                <ul className="space-y-3 text-left text-gray-300 mb-8">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Unlimited employees</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Set subsidy percentage (25%, 50%, 100% - your choice)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Real-time usage dashboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Low balance alerts & auto-recharge</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>100% tax deductible</span>
                  </li>
                </ul>

                <div className="bg-gray-700 text-gray-400 px-8 py-4 rounded-xl text-lg font-bold w-full cursor-not-allowed text-center">
                  Coming Soon
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 sm:mt-24 md:mt-32 bg-gray-800 border border-gray-700 text-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6">
                Ready to launch this benefit?
              </h2>
              <p className="text-xl sm:text-2xl text-gray-300 mb-8">
                Join companies already making decluttering easier for their teams.
              </p>
              <div className="bg-gray-700 text-gray-400 px-10 sm:px-12 py-5 sm:py-6 rounded-xl text-xl sm:text-2xl font-black shadow-xl inline-flex items-center gap-3 sm:gap-4 cursor-not-allowed">
                Coming Soon
              </div>
              <p className="mt-6 text-gray-400 text-sm sm:text-base">
                B2B program launching soon. Join the waitlist.
              </p>
            </div>
          </div>

          <div className="mt-16 sm:mt-24 md:mt-32 bg-gray-800 border border-gray-700 rounded-2xl p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-8 text-center border-b border-gray-600 pb-4">
              Common questions
            </h2>

            <div className="max-w-3xl mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">How does pricing work?</h3>
                <p className="text-gray-300">
                  It's 100% free to sign up and add unlimited employees. You fund a credit balance (like a prepaid card).
                  When employees book pickups, subsidies are deducted from your balance. We'll alert you when balance is low.
                  Enable auto-recharge to keep it topped up automatically.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">Are there any subscription fees?</h3>
                <p className="text-gray-300">
                  Nope! Zero subscription fees. No monthly charges. No hidden costs. You only pay for the actual subsidies your employees use.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">What if my credit balance runs out?</h3>
                <p className="text-gray-300">
                  Employees can still book (they just won't get the subsidy until you add more funds). You can enable auto-recharge to automatically add $500 when balance hits $250.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">How many employees can we add?</h3>
                <p className="text-gray-300">
                  Unlimited! Add 10 employees or 10,000. No limits, no per-employee fees.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">Can employees use it unlimited times?</h3>
                <p className="text-gray-300">
                  Yes! As long as you have credit balance remaining. You can optionally set a monthly spending cap if needed.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">Is this tax deductible?</h3>
                <p className="text-gray-300">
                  100% yes. It's an employee wellness benefit, same as gym memberships or health programs. Talk to your accountant.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">What if we have charity sponsorships too?</h3>
                <p className="text-gray-300">
                  Even better! Subsidies stack. If a charity offers 50% off and your company offers 50%, employees get 100% free pickups.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">How do we track usage?</h3>
                <p className="text-gray-300">
                  Your dashboard shows real-time data: bookings, items donated, costs, employee participation, and charitable impact metrics.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">Can we cancel anytime?</h3>
                <p className="text-gray-300">
                  Yes. No long-term contracts (except Enterprise custom agreements). Cancel anytime from your dashboard.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">Do employees need to download an app?</h3>
                <p className="text-gray-300">
                  Nope. Everything works through the web. They just enter your company code when booking and the discount applies automatically.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">Can we use this for PR and recruiting?</h3>
                <p className="text-gray-300">
                  Absolutely! We encourage it. "We helped donate X items to local charities" looks great in annual reports and job postings.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 sm:mt-16 text-center text-gray-500 text-sm">
            <p>Questions? Email us at <a href="mailto:sales@dropgood.com" className="text-blue-400 hover:underline">sales@dropgood.com</a></p>
          </div>
        </main>
      </div>
    </div>
    </>
  );
}
