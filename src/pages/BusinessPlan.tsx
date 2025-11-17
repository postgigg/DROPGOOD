import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Download, Eye, EyeOff, TrendingUp, DollarSign, Users, Target, Zap, Building2, CheckCircle, ArrowRight, BarChart3 } from 'lucide-react';
import DropGoodLogo from '../components/DropGoodLogo';

export default function BusinessPlan() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // PIN: 2468 (simple default - can be changed)
  const CORRECT_PIN = '2468';

  // Check if already authenticated in this session
  useEffect(() => {
    const authStatus = sessionStorage.getItem('businessplan_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate authentication delay
    setTimeout(() => {
      if (pin === CORRECT_PIN) {
        setIsAuthenticated(true);
        sessionStorage.setItem('businessplan_auth', 'true');
        setError('');
      } else {
        setError('Incorrect PIN. Please try again.');
        setPin('');
      }
      setLoading(false);
    }, 500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <DropGoodLogo size={56} />
              </div>
              <h1 className="text-2xl font-black text-white mb-2">Business Plan Access</h1>
              <p className="text-gray-400">Enter PIN to view confidential document</p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-6">
              <div>
                <label htmlFor="pin" className="block text-sm font-semibold text-gray-300 mb-2">
                  4-Digit PIN
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="pin"
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    className="w-full pl-10 pr-12 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-400">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={pin.length !== 4 || loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" />
                    Unlock Business Plan
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-xs text-gray-500 text-center">
                Confidential Document • Internal Use Only
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="mt-6 w-full text-gray-400 hover:text-white transition text-sm font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 print:bg-white">
      {/* Navigation - Hidden on Print */}
      <nav className="bg-black border-b border-gray-800 sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button onClick={() => navigate('/')} className="flex items-center gap-3">
              <DropGoodLogo size={32} />
              <span className="text-xl font-black text-white">DropGood</span>
            </button>
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>
              <button
                onClick={() => {
                  sessionStorage.removeItem('businessplan_auth');
                  setIsAuthenticated(false);
                  setPin('');
                }}
                className="text-gray-400 hover:text-white transition font-medium"
              >
                Lock
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 print:py-8">

        {/* Header */}
        <div className="mb-12 print:mb-8">
          <div className="flex items-center gap-3 mb-4 print:mb-2">
            <DropGoodLogo size={48} className="print:hidden" />
            <h1 className="text-4xl sm:text-5xl font-black text-white print:text-black">
              DropGood Business Plan
            </h1>
          </div>
          <p className="text-xl text-gray-400 print:text-gray-700">
            On-Demand Donation Pickup Platform
          </p>
          <p className="text-sm text-gray-500 print:text-gray-600 mt-2">
            Last Updated: November 2025 • Confidential Document
          </p>
        </div>

        {/* Executive Summary */}
        <section className="mb-12 print:mb-8 print:page-break-after-avoid">
          <h2 className="text-3xl font-black text-white print:text-black mb-6 flex items-center gap-3">
            <Zap className="h-8 w-8 text-blue-500 print:hidden" />
            Executive Summary
          </h2>
          <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-2xl p-8 print:border-gray-300 print:bg-white">
            <p className="text-lg text-gray-300 print:text-gray-800 leading-relaxed mb-6">
              <strong className="text-white print:text-black">DropGood</strong> is the "Uber for charity donations" - an on-demand pickup platform that eliminates the hassle of donating. Customers book white-glove pickup services in 2 minutes, and we handle the rest: pickup from their doorstep, transport to their chosen local charity, and automatic tax receipt delivery.
            </p>

            <div className="grid sm:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="text-3xl font-black text-blue-400 print:text-blue-600 mb-2">$150K+</div>
                <div className="text-sm text-gray-400 print:text-gray-700">Target Customer Income</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-green-400 print:text-green-600 mb-2">500+</div>
                <div className="text-sm text-gray-400 print:text-gray-700">Cities Coverage (via Uber)</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-purple-400 print:text-purple-600 mb-2">35-50%</div>
                <div className="text-sm text-gray-400 print:text-gray-700">Profit Margins</div>
              </div>
            </div>
          </div>
        </section>

        {/* Target Market */}
        <section className="mb-12 print:mb-8 print:page-break-after-avoid">
          <h2 className="text-3xl font-black text-white print:text-black mb-6 flex items-center gap-3">
            <Target className="h-8 w-8 text-green-500 print:hidden" />
            Target Market
          </h2>
          <div className="space-y-6">
            <div className="bg-gray-900 print:bg-white border border-gray-800 print:border-gray-300 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white print:text-black mb-4">Primary: Affluent Homeowners (B2C)</h3>
              <div className="grid sm:grid-cols-2 gap-6 text-gray-300 print:text-gray-800">
                <div>
                  <h4 className="font-bold text-white print:text-black mb-2">Demographics</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Age: 35-65 years old</li>
                    <li>• Income: $150K-$500K+</li>
                    <li>• Home Value: $500K+</li>
                    <li>• College-educated</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-white print:text-black mb-2">Psychographics</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Time-poor, money-rich</li>
                    <li>• Value convenience over cost</li>
                    <li>• Tax optimization savvy</li>
                    <li>• Socially conscious</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 print:bg-white border border-gray-800 print:border-gray-300 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white print:text-black mb-4">Secondary: Companies (B2B)</h3>
              <p className="text-gray-300 print:text-gray-800 mb-4">
                Companies (20-500 employees) offering employee wellness benefits. Pay-as-you-go model (no subscription), 100% tax-deductible.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-600/20 border border-blue-600/30 rounded-full text-sm text-blue-300 print:text-blue-600 print:bg-blue-50 print:border-blue-300">Employee Wellness</span>
                <span className="px-3 py-1 bg-green-600/20 border border-green-600/30 rounded-full text-sm text-green-300 print:text-green-600 print:bg-green-50 print:border-green-300">PR/CSR Value</span>
                <span className="px-3 py-1 bg-purple-600/20 border border-purple-600/30 rounded-full text-sm text-purple-300 print:text-purple-600 print:bg-purple-50 print:border-purple-300">Tax Deductible</span>
              </div>
            </div>
          </div>
        </section>

        {/* Revenue Model */}
        <section className="mb-12 print:mb-8 print:page-break-after-avoid">
          <h2 className="text-3xl font-black text-white print:text-black mb-6 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-yellow-500 print:hidden" />
            Revenue Streams & Pricing
          </h2>

          <div className="space-y-6">
            {/* B2C Revenue */}
            <div className="bg-gray-900 print:bg-white border border-gray-800 print:border-gray-300 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white print:text-black mb-4">1. B2C Pickup Service Fees (Primary)</h3>
              <p className="text-gray-300 print:text-gray-800 mb-4">
                <strong>Distance-based pricing:</strong> Closer charities = lower prices
              </p>

              <div className="bg-gray-950 print:bg-gray-50 border border-gray-700 print:border-gray-200 rounded-lg p-4 font-mono text-sm text-gray-300 print:text-gray-800 mb-4">
                <div>Base: $3.50 + ($0.85 × miles)</div>
                <div className="mt-2">Customer Pays:</div>
                <div>├─ Delivery Fee (Uber + 15% + 3.5% state fee*)</div>
                <div>├─ Service Fee (10% shown separately)</div>
                <div>├─ Bag Fees: $2.00/bag (→ 100% to driver)</div>
                <div>├─ Box Fees: $2.50/box (→ 100% to driver)</div>
                <div>└─ Optional Tip</div>
              </div>

              <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4 print:bg-blue-50 print:border-blue-300">
                <h4 className="font-bold text-blue-300 print:text-blue-700 mb-2">Total Markup:</h4>
                <ul className="space-y-1 text-sm text-gray-300 print:text-gray-800">
                  <li>• <strong>Active/Verified Charities:</strong> 35% margin</li>
                  <li>• <strong>Inactive/Unverified Charities:</strong> 50% margin</li>
                </ul>
              </div>
            </div>

            {/* Pricing Examples */}
            <div className="bg-gray-900 print:bg-white border border-gray-800 print:border-gray-300 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white print:text-black mb-4">Pricing Examples (Real-World)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700 print:border-gray-300">
                      <th className="text-left py-2 text-gray-400 print:text-gray-700">Distance</th>
                      <th className="text-right py-2 text-gray-400 print:text-gray-700">Uber Cost</th>
                      <th className="text-right py-2 text-gray-400 print:text-gray-700">Customer Pays*</th>
                      <th className="text-right py-2 text-gray-400 print:text-gray-700">Our Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300 print:text-gray-800">
                    <tr className="border-b border-gray-800 print:border-gray-200">
                      <td className="py-2">3 miles</td>
                      <td className="text-right">$6.05</td>
                      <td className="text-right font-semibold">$14-18</td>
                      <td className="text-right text-green-400 print:text-green-600">$5.60</td>
                    </tr>
                    <tr className="border-b border-gray-800 print:border-gray-200">
                      <td className="py-2">7 miles</td>
                      <td className="text-right">$9.45</td>
                      <td className="text-right font-semibold">$20-25</td>
                      <td className="text-right text-green-400 print:text-green-600">$8.40</td>
                    </tr>
                    <tr className="border-b border-gray-800 print:border-gray-200">
                      <td className="py-2">12 miles</td>
                      <td className="text-right">$13.70</td>
                      <td className="text-right font-semibold">$28-35</td>
                      <td className="text-right text-green-400 print:text-green-600">$11.20</td>
                    </tr>
                    <tr>
                      <td className="py-2">20 miles</td>
                      <td className="text-right">$20.50</td>
                      <td className="text-right font-semibold">$42-50</td>
                      <td className="text-right text-green-400 print:text-green-600">$17.50</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs text-gray-500 print:text-gray-600 mt-2">*Includes avg 2-3 bags/boxes + Stripe fees</p>
              </div>
            </div>

            {/* B2B Revenue */}
            <div className="bg-gray-900 print:bg-white border border-gray-800 print:border-gray-300 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white print:text-black mb-4">2. B2B Company Sponsorships (Launching Soon)</h3>

              <div className="bg-yellow-900/20 border border-yellow-700/30 print:bg-yellow-50 print:border-yellow-300 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-300 print:text-yellow-800 font-semibold">
                  NOT a subscription model! Companies are "corporate sponsors" (like charity sponsorships).
                </p>
              </div>

              <p className="text-gray-300 print:text-gray-800 mb-4 text-sm">
                <strong>How it works:</strong> Companies sign up FREE, add credit balance, set subsidy % (0-100%). When employees book pickups, company credit covers the subsidy portion automatically.
              </p>

              <div className="bg-gradient-to-br from-green-900/30 to-blue-900/30 border border-green-700/40 print:bg-green-50 print:border-green-300 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-green-300 print:text-green-700 mb-2 text-sm">💰 The Genius Part: We Earn FULL Service Fees</h4>
                <p className="text-xs text-gray-300 print:text-gray-800 mb-3">
                  Employee books $30 pickup, company subsidizes 50%:
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-gray-950 print:bg-white border border-gray-700 print:border-gray-200 rounded p-2">
                    <div className="text-gray-400 print:text-gray-600">Customer Pays</div>
                    <div className="text-white print:text-black font-bold">$15</div>
                  </div>
                  <div className="bg-gray-950 print:bg-white border border-gray-700 print:border-gray-200 rounded p-2">
                    <div className="text-gray-400 print:text-gray-600">Company Pays</div>
                    <div className="text-white print:text-black font-bold">$15</div>
                  </div>
                  <div className="col-span-2 bg-green-950 print:bg-green-100 border border-green-700 print:border-green-300 rounded p-2">
                    <div className="text-green-400 print:text-green-700">Our Service Fee (35% of full $30)</div>
                    <div className="text-green-300 print:text-green-600 font-bold text-lg">$10.50</div>
                  </div>
                </div>
                <p className="text-xs text-green-300 print:text-green-700 mt-2 font-semibold">
                  ✓ B2B pickups are MORE profitable (we get paid on both portions!)
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-950 print:bg-gray-50 border border-gray-700 print:border-gray-200 rounded-lg p-4">
                  <div className="font-bold text-white print:text-black mb-1">Starter Credit</div>
                  <div className="text-2xl font-black text-blue-400 print:text-blue-600 mb-2">$500-1K</div>
                  <div className="text-gray-400 print:text-gray-700 text-xs">• 20-50 employees</div>
                  <div className="text-gray-400 print:text-gray-700 text-xs">• 25-50% subsidy</div>
                </div>
                <div className="bg-gray-950 print:bg-gray-50 border border-green-700 print:border-green-400 rounded-lg p-4 border-2">
                  <div className="font-bold text-white print:text-black mb-1">Growth Credit</div>
                  <div className="text-2xl font-black text-green-400 print:text-green-600 mb-2">$1.5-3K</div>
                  <div className="text-gray-400 print:text-gray-700 text-xs">• 50-200 employees</div>
                  <div className="text-gray-400 print:text-gray-700 text-xs">• 50-75% subsidy</div>
                </div>
                <div className="bg-gray-950 print:bg-gray-50 border border-gray-700 print:border-gray-200 rounded-lg p-4">
                  <div className="font-bold text-white print:text-black mb-1">Enterprise Credit</div>
                  <div className="text-2xl font-black text-purple-400 print:text-purple-600 mb-2">$5K+</div>
                  <div className="text-gray-400 print:text-gray-700 text-xs">• 200+ employees</div>
                  <div className="text-gray-400 print:text-gray-700 text-xs">• 75-100% subsidy</div>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500 print:text-gray-600">
                <strong>Key Benefits:</strong> FREE signup • Pay only when used • 100% tax deductible • No subscription fees ever
              </div>
            </div>

            {/* Other Revenue */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-gray-900 print:bg-white border border-gray-800 print:border-gray-300 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white print:text-black mb-4">3. Charity Sponsorships</h3>
                <p className="text-gray-300 print:text-gray-800 text-sm">
                  Charities sponsor subsidies (25-75% off) to attract more donations to their location. Win-win: more pickups for us, more items for them.
                </p>
              </div>
              <div className="bg-gray-900 print:bg-white border border-gray-800 print:border-gray-300 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white print:text-black mb-4">4. Strategic Partnerships</h3>
                <p className="text-gray-300 print:text-gray-800 text-sm">
                  Referral fees from Dolly (furniture pickups), junk removal companies, moving services, and storage facilities.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Uber Direct Critical Success Section */}
        <section className="mb-12 print:mb-8 print:page-break-before-always">
          <h2 className="text-3xl font-black text-white print:text-black mb-6 flex items-center gap-3">
            <Zap className="h-8 w-8 text-red-500 print:hidden" />
            Why Uber Direct API is Critical for Success
          </h2>

          <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border-2 border-red-700/50 print:border-red-300 rounded-2xl p-8 mb-6 print:bg-white">
            <p className="text-lg text-gray-300 print:text-gray-800 leading-relaxed mb-4">
              <strong className="text-white print:text-black">Uber Direct API is not a "nice to have" - it's the foundation of the entire business model.</strong> Without it, DropGood becomes a traditional logistics company (high overhead, slow growth, capital-intensive). With it, DropGood becomes a scalable tech platform.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-gray-900 print:bg-white border border-gray-800 print:border-gray-300 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600 rounded-lg p-2">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white print:text-black">1. Instant National Scale</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-300 print:text-gray-800">
                <li>✓ <strong>500+ cities on Day 1</strong> (wherever Uber operates)</li>
                <li>✓ Zero driver recruitment needed</li>
                <li>✓ Expand to new markets in hours (vs. months)</li>
                <li>✓ National presence beats local competitors</li>
              </ul>
            </div>

            <div className="bg-gray-900 print:bg-white border border-gray-800 print:border-gray-300 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-600 rounded-lg p-2">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white print:text-black">2. Zero Overhead</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-300 print:text-gray-800">
                <li>✓ No driver payroll ($150-250/hour saved)</li>
                <li>✓ No vehicle fleet ($500-1K/vehicle/month saved)</li>
                <li>✓ No HR, benefits, insurance overhead</li>
                <li>✓ <strong>Monthly overhead: &lt;$200</strong> (vs. $20K-50K)</li>
              </ul>
            </div>

            <div className="bg-gray-900 print:bg-white border border-gray-800 print:border-gray-300 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-600 rounded-lg p-2">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white print:text-black">3. Trust & Credibility</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-300 print:text-gray-800">
                <li>✓ Uber = trusted brand (millions of rides)</li>
                <li>✓ Background-checked, insured drivers</li>
                <li>✓ <strong>2x better conversion</strong> (70-80% vs. 30-40%)</li>
                <li>✓ Customers comfortable with Uber in their homes</li>
              </ul>
            </div>

            <div className="bg-gray-900 print:bg-white border border-gray-800 print:border-gray-300 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-yellow-600 rounded-lg p-2">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white print:text-black">4. Real-Time Tracking</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-300 print:text-gray-800">
                <li>✓ Live GPS tracking (transparency = trust)</li>
                <li>✓ <strong>80% fewer support tickets</strong> ("Where's my driver?")</li>
                <li>✓ Photo confirmation (proof of service)</li>
                <li>✓ 4.5+ star reviews (vs. 3.5 without tracking)</li>
              </ul>
            </div>

            <div className="bg-gray-900 print:bg-white border border-gray-800 print:border-gray-300 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-600 rounded-lg p-2">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white print:text-black">5. Pricing Accuracy</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-300 print:text-gray-800">
                <li>✓ Dynamic pricing (traffic, demand adjustments)</li>
                <li>✓ No guesswork (Uber's battle-tested algorithm)</li>
                <li>✓ <strong>5-10% higher margins</strong> (pricing accuracy)</li>
                <li>✓ Eliminates losses from underpriced deliveries</li>
              </ul>
            </div>

            <div className="bg-gray-900 print:bg-white border border-gray-800 print:border-gray-300 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-600 rounded-lg p-2">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white print:text-black">6. Focus on Core</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-300 print:text-gray-800">
                <li>✓ We handle: Product, marketing, UX</li>
                <li>✓ Uber handles: Logistics, drivers, routing</li>
                <li>✓ <strong>1 + 1 = 3</strong> (synergistic strengths)</li>
                <li>✓ Build moat vs. competitors (Uber API access = barrier)</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 bg-gray-900 print:bg-white border border-gray-800 print:border-gray-300 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white print:text-black mb-4">Bottom Line Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700 print:border-gray-300">
                    <th className="text-left py-2 text-gray-400 print:text-gray-700">Metric</th>
                    <th className="text-center py-2 text-red-400 print:text-red-600">Without Uber Direct</th>
                    <th className="text-center py-2 text-green-400 print:text-green-600">With Uber Direct</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300 print:text-gray-800">
                  <tr className="border-b border-gray-800 print:border-gray-200">
                    <td className="py-2">Coverage</td>
                    <td className="text-center">1-2 cities</td>
                    <td className="text-center font-bold">500+ cities</td>
                  </tr>
                  <tr className="border-b border-gray-800 print:border-gray-200">
                    <td className="py-2">Startup Capital</td>
                    <td className="text-center">$50K+</td>
                    <td className="text-center font-bold">$500</td>
                  </tr>
                  <tr className="border-b border-gray-800 print:border-gray-200">
                    <td className="py-2">Monthly Overhead</td>
                    <td className="text-center">$20K-50K</td>
                    <td className="text-center font-bold">&lt;$200</td>
                  </tr>
                  <tr className="border-b border-gray-800 print:border-gray-200">
                    <td className="py-2">Profit Margins</td>
                    <td className="text-center">10-15%</td>
                    <td className="text-center font-bold">30-40%</td>
                  </tr>
                  <tr className="border-b border-gray-800 print:border-gray-200">
                    <td className="py-2">New City Launch Time</td>
                    <td className="text-center">3-6 months</td>
                    <td className="text-center font-bold">1-3 days</td>
                  </tr>
                  <tr>
                    <td className="py-2">Conversion Rate</td>
                    <td className="text-center">30-40%</td>
                    <td className="text-center font-bold">70-80%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Marketing Strategy */}
        <section className="mb-12 print:mb-8 print:page-break-before-always">
          <h2 className="text-3xl font-black text-white print:text-black mb-6 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-purple-500 print:hidden" />
            Low-Overhead Marketing ($500 Budget)
          </h2>

          <div className="bg-gray-900 print:bg-white border border-gray-800 print:border-gray-300 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-white print:text-black mb-4">Marketing Philosophy</h3>
            <p className="text-gray-300 print:text-gray-800 mb-4">
              We don't need expensive advertising. Our ideal customers (affluent, time-poor) are reached through <strong>word-of-mouth, charity partnerships, local SEO, and referral incentives</strong>.
            </p>
            <div className="bg-purple-900/20 border border-purple-700/30 print:bg-purple-50 print:border-purple-300 rounded-lg p-4">
              <strong className="text-purple-300 print:text-purple-700">Goal:</strong> Acquire first 100 customers for &lt;$500, then grow organically.
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-900 print:bg-white border border-gray-800 print:border-gray-300 rounded-xl p-6">
              <h4 className="font-bold text-white print:text-black mb-3">$200 - Local SEO & Google</h4>
              <ul className="space-y-2 text-sm text-gray-300 print:text-gray-800">
                <li>• $0 - Google Business Profile (FREE)</li>
                <li>• $50 - Local citations (Yelp, Nextdoor)</li>
                <li>• $50 - On-page SEO optimization</li>
                <li>• $100 - Google Ads (ultra-targeted)</li>
              </ul>
            </div>
            <div className="bg-gray-900 print:bg-white border border-gray-800 print:border-gray-300 rounded-xl p-6">
              <h4 className="font-bold text-white print:text-black mb-3">$150 - Social Media</h4>
              <ul className="space-y-2 text-sm text-gray-300 print:text-gray-800">
                <li>• $0 - Organic setup (Instagram, Facebook)</li>
                <li>• $50 - Facebook/Instagram ads</li>
                <li>• $50 - Nextdoor sponsored posts</li>
                <li>• $50 - Canva Pro (design tools)</li>
              </ul>
            </div>
            <div className="bg-gray-900 print:bg-white border border-gray-800 print:border-gray-300 rounded-xl p-6">
              <h4 className="font-bold text-white print:text-black mb-3">$100 - Partnerships</h4>
              <ul className="space-y-2 text-sm text-gray-300 print:text-gray-800">
                <li>• $0 - Charity outreach (FREE)</li>
                <li>• $50 - Printed flyers (1,000 qty)</li>
                <li>• $50 - Business cards (500 qty)</li>
              </ul>
            </div>
            <div className="bg-gray-900 print:bg-white border border-gray-800 print:border-gray-300 rounded-xl p-6">
              <h4 className="font-bold text-white print:text-black mb-3">$50 - PR & Content</h4>
              <ul className="space-y-2 text-sm text-gray-300 print:text-gray-800">
                <li>• $0 - Press releases (FREE)</li>
                <li>• $0 - SEO blog posts (DIY)</li>
                <li>• $50 - Community event sponsorship</li>
              </ul>
            </div>
          </div>

          <div className="bg-green-900/20 border border-green-700/30 print:bg-green-50 print:border-green-300 rounded-xl p-6">
            <h4 className="font-bold text-green-300 print:text-green-700 mb-3">Expected Results (Months 1-3)</h4>
            <div className="grid sm:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-black text-green-400 print:text-green-600 mb-1">30-50</div>
                <div className="text-sm text-gray-400 print:text-gray-700">Bookings</div>
              </div>
              <div>
                <div className="text-2xl font-black text-green-400 print:text-green-600 mb-1">$1,250-$2,500</div>
                <div className="text-sm text-gray-400 print:text-gray-700">Revenue</div>
              </div>
              <div>
                <div className="text-2xl font-black text-green-400 print:text-green-600 mb-1">2.5x-5x</div>
                <div className="text-sm text-gray-400 print:text-gray-700">ROI</div>
              </div>
            </div>
          </div>
        </section>

        {/* Financial Projections */}
        <section className="mb-12 print:mb-8 print:page-break-before-always">
          <h2 className="text-3xl font-black text-white print:text-black mb-6 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-green-500 print:hidden" />
            Financial Projections
          </h2>

          <div className="bg-gray-900 print:bg-white border border-gray-800 print:border-gray-300 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-white print:text-black mb-4">Key Assumptions</h3>
            <ul className="space-y-2 text-sm text-gray-300 print:text-gray-800">
              <li>• Average revenue per booking: <strong>$10</strong> (35% margin)</li>
              <li>• Monthly growth rate: <strong>30%</strong> (conservative)</li>
              <li>• B2B revenue starts Month 6</li>
              <li>• Churn rate: <strong>5%</strong> (low due to one-time purchase)</li>
            </ul>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm bg-gray-900 print:bg-white border border-gray-800 print:border-gray-300 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-gray-800 print:bg-gray-100">
                  <th className="text-left py-3 px-4 text-gray-400 print:text-gray-700">Month</th>
                  <th className="text-right py-3 px-4 text-gray-400 print:text-gray-700">Bookings</th>
                  <th className="text-right py-3 px-4 text-gray-400 print:text-gray-700">B2C</th>
                  <th className="text-right py-3 px-4 text-gray-400 print:text-gray-700">B2B</th>
                  <th className="text-right py-3 px-4 text-gray-400 print:text-gray-700">Total</th>
                  <th className="text-right py-3 px-4 text-gray-400 print:text-gray-700">Profit</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 print:text-gray-800">
                <tr className="border-b border-gray-800 print:border-gray-200">
                  <td className="py-2 px-4">1</td>
                  <td className="text-right">10</td>
                  <td className="text-right">$100</td>
                  <td className="text-right">$0</td>
                  <td className="text-right font-semibold">$100</td>
                  <td className="text-right text-red-400 print:text-red-600">-$600</td>
                </tr>
                <tr className="border-b border-gray-800 print:border-gray-200">
                  <td className="py-2 px-4">3</td>
                  <td className="text-right">30</td>
                  <td className="text-right">$300</td>
                  <td className="text-right">$0</td>
                  <td className="text-right font-semibold">$300</td>
                  <td className="text-right text-green-400 print:text-green-600">$100</td>
                </tr>
                <tr className="border-b border-gray-800 print:border-gray-200">
                  <td className="py-2 px-4">6</td>
                  <td className="text-right">95</td>
                  <td className="text-right">$950</td>
                  <td className="text-right">$500</td>
                  <td className="text-right font-semibold">$1,450</td>
                  <td className="text-right text-green-400 print:text-green-600">$1,150</td>
                </tr>
                <tr className="border-b border-gray-800 print:border-gray-200">
                  <td className="py-2 px-4">12</td>
                  <td className="text-right">620</td>
                  <td className="text-right">$6,200</td>
                  <td className="text-right">$5,000</td>
                  <td className="text-right font-semibold">$11,200</td>
                  <td className="text-right text-green-400 print:text-green-600">$10,700</td>
                </tr>
                <tr className="bg-gray-800 print:bg-gray-100 font-bold">
                  <td className="py-3 px-4">Year 1</td>
                  <td className="text-right">2,288</td>
                  <td className="text-right">$22,880</td>
                  <td className="text-right">$17,000</td>
                  <td className="text-right">$39,880</td>
                  <td className="text-right text-green-400 print:text-green-600">$35,680</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mt-6">
            <div className="bg-blue-900/20 border border-blue-700/30 print:bg-blue-50 print:border-blue-300 rounded-xl p-6">
              <h4 className="font-bold text-blue-300 print:text-blue-700 mb-3">Year 1 Highlights</h4>
              <ul className="space-y-2 text-sm text-gray-300 print:text-gray-800">
                <li>• Revenue: <strong>$39,880</strong></li>
                <li>• Net Profit: <strong>$35,680</strong></li>
                <li>• Profit Margin: <strong>89%</strong></li>
                <li>• Break-even: <strong>Month 2</strong></li>
              </ul>
            </div>
            <div className="bg-green-900/20 border border-green-700/30 print:bg-green-50 print:border-green-300 rounded-xl p-6">
              <h4 className="font-bold text-green-300 print:text-green-700 mb-3">Year 2 Projection</h4>
              <ul className="space-y-2 text-sm text-gray-300 print:text-gray-800">
                <li>• Revenue: <strong>$210,000</strong></li>
                <li>• Net Profit: <strong>$150,000</strong></li>
                <li>• Profit Margin: <strong>71%</strong></li>
                <li>• Cities: <strong>3-5 markets</strong></li>
              </ul>
            </div>
          </div>
        </section>

        {/* Growth Roadmap */}
        <section className="mb-12 print:mb-8">
          <h2 className="text-3xl font-black text-white print:text-black mb-6 flex items-center gap-3">
            <ArrowRight className="h-8 w-8 text-blue-500 print:hidden" />
            Growth Roadmap
          </h2>

          <div className="space-y-4">
            <div className="bg-gray-900 print:bg-white border border-gray-800 print:border-gray-300 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</div>
                <h3 className="text-xl font-bold text-white print:text-black">Phase 1: Local MVP (Months 1-3)</h3>
              </div>
              <p className="text-gray-300 print:text-gray-800 text-sm mb-3">
                Launch in 1 city, partner with 10 charities, acquire 50 customers, validate product-market fit
              </p>
              <div className="bg-gray-950 print:bg-gray-50 border border-gray-700 print:border-gray-200 rounded-lg p-3 text-sm text-gray-400 print:text-gray-700">
                <strong>Success:</strong> 30+ bookings/month, 80%+ satisfaction, profitable
              </div>
            </div>

            <div className="bg-gray-900 print:bg-white border border-gray-800 print:border-gray-300 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</div>
                <h3 className="text-xl font-bold text-white print:text-black">Phase 2: Uber Direct Integration (Months 4-6)</h3>
              </div>
              <p className="text-gray-300 print:text-gray-800 text-sm mb-3">
                Connect Uber Direct API, launch live tracking, automate dispatch, scale to 100+ bookings/month
              </p>
              <div className="bg-gray-950 print:bg-gray-50 border border-gray-700 print:border-gray-200 rounded-lg p-3 text-sm text-gray-400 print:text-gray-700">
                <strong>Success:</strong> 95%+ automated, 30% fewer support tickets, 35%+ margins
              </div>
            </div>

            <div className="bg-gray-900 print:bg-white border border-gray-800 print:border-gray-300 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</div>
                <h3 className="text-xl font-bold text-white print:text-black">Phase 3: Multi-City + B2B (Months 7-12)</h3>
              </div>
              <p className="text-gray-300 print:text-gray-800 text-sm mb-3">
                Expand to 3 cities, launch B2B program, sign 10 company clients, hire VA
              </p>
              <div className="bg-gray-950 print:bg-gray-50 border border-gray-700 print:border-gray-200 rounded-lg p-3 text-sm text-gray-400 print:text-gray-700">
                <strong>Success:</strong> 400+ bookings/month, $10K+ revenue, 5-10 B2B clients
              </div>
            </div>

            <div className="bg-gray-900 print:bg-white border border-gray-800 print:border-gray-300 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-yellow-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">4</div>
                <h3 className="text-xl font-bold text-white print:text-black">Phase 4: National Scale (Year 2)</h3>
              </div>
              <p className="text-gray-300 print:text-gray-800 text-sm mb-3">
                10+ metros (NY, LA, Chicago, SF), 50+ B2B clients, charity sponsorships, 3 FTE hires
              </p>
              <div className="bg-gray-950 print:bg-gray-50 border border-gray-700 print:border-gray-200 rounded-lg p-3 text-sm text-gray-400 print:text-gray-700">
                <strong>Success:</strong> 1,000+ bookings/month, $75K+ revenue, 60%+ margins
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t border-gray-800 print:border-gray-300 pt-8 mt-12 text-center">
          <p className="text-sm text-gray-500 print:text-gray-600 mb-2">
            <strong>DropGood Business Plan</strong> • Version 1.0 • November 2025
          </p>
          <p className="text-xs text-gray-600 print:text-gray-500">
            Confidential Document • Internal Use Only • All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
}
