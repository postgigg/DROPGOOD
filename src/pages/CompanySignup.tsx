import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, DollarSign, Sparkles, Check, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO/SEO';
import { seoPages } from '../components/SEO/seoConfig';

export default function CompanySignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'info' | 'subsidy'>('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [website, setWebsite] = useState('');

  // Subsidy settings
  const [subsidyPercentage, setSubsidyPercentage] = useState(50);

  // Demo account data generator
  const fillDemoData = () => {
    const companyNames = [
      'Acme Corp',
      'TechFlow Solutions',
      'Summit Enterprises',
      'Vertex Industries',
      'Nexus Group',
      'Catalyst Partners',
      'Momentum Labs',
      'Skyline Ventures',
      'Fusion Technologies',
      'Apex Innovations'
    ];

    const firstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'Robert', 'Lisa', 'James', 'Jennifer'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

    const randomCompany = companyNames[Math.floor(Math.random() * companyNames.length)];
    const randomFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLast = lastNames[Math.floor(Math.random() * lastNames.length)];
    const randomEmail = `${randomFirst.toLowerCase()}.${randomLast.toLowerCase()}${Math.floor(Math.random() * 1000)}@${randomCompany.toLowerCase().replace(/\s+/g, '')}.com`;
    const randomPhone = `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;

    setCompanyName(randomCompany);
    setContactName(`${randomFirst} ${randomLast}`);
    setContactEmail(randomEmail);
    setContactPhone(randomPhone);
    setWebsite(`https://www.${randomCompany.toLowerCase().replace(/\s+/g, '')}.com`);
  };

  // Helper function to get turnout meter info based on subsidy percentage
  const getTurnoutMeter = (subsidy: number) => {
    if (subsidy >= 76) {
      return {
        label: 'Excellent Turnout',
        color: 'text-green-400',
        bgColor: 'bg-green-500',
        barWidth: '100%',
        icon: '🔥'
      };
    } else if (subsidy >= 51) {
      return {
        label: 'Good Turnout',
        color: 'text-lime-400',
        bgColor: 'bg-lime-500',
        barWidth: '75%',
        icon: '✓'
      };
    } else if (subsidy >= 26) {
      return {
        label: 'Moderate Turnout',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500',
        barWidth: '50%',
        icon: '~'
      };
    } else {
      return {
        label: 'Low Turnout',
        color: 'text-red-400',
        bgColor: 'bg-red-500',
        barWidth: '25%',
        icon: '!'
      };
    }
  };

  // Helper function to calculate employee cost with subsidy
  const calculateEmployeeCost = (subsidy: number) => {
    const basePrice = 15.00; // Average pickup price
    const employeePays = basePrice * (1 - subsidy / 100);
    return employeePays;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 'info') {
      // Validate info and move to subsidy setup
      if (!companyName || !contactName || !contactEmail || !contactPhone) {
        setError('Please fill in all required fields');
        return;
      }
      setError(null);
      setStep('subsidy');
      return;
    }

    // Final submit
    setLoading(true);
    setError(null);

    try {
      // Check if user is logged in, if not create account
      let { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Create new user account with contact email
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: contactEmail,
          password: Math.random().toString(36).slice(-12) + 'A1!', // Generate random password
          options: {
            data: {
              full_name: contactName,
              user_type: 'company_admin'
            }
          }
        });

        if (signUpError) throw signUpError;
        user = signUpData.user;

        if (!user) {
          throw new Error('Failed to create user account');
        }
      }

      // Generate unique access code
      const { data: accessCodeData, error: accessCodeError } = await supabase
        .rpc('generate_company_access_code');

      if (accessCodeError) throw accessCodeError;
      const accessCode = accessCodeData;

      // Create company (simple, no tiers or subscriptions)
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: companyName,
          contact_name: contactName,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          website: website || null,
          subsidy_percentage: subsidyPercentage,
          employee_access_code: accessCode,
          owner_user_id: user.id,
          account_status: 'active',
          current_credit_balance: 0 // Starts with $0, they add credits later
        })
        .select()
        .single();

      if (companyError) throw companyError;

      console.log('✅ Company created:', company);

      // Navigate to dashboard
      navigate('/company-dashboard', {
        state: { newCompany: true, accessCode }
      });
    } catch (err) {
      console.error('Error creating company:', err);
      setError(err instanceof Error ? err.message : 'Failed to create company account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO {...seoPages.companySignup} />
      <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="h-10 w-10 text-blue-500" />
            <h1 className="text-3xl font-bold text-white">
              Create Company Account
            </h1>
          </div>
          <p className="text-lg text-gray-400">
            Sign up free and give your team subsidized donation pickups
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex items-center gap-3">
          <div className={`flex items-center gap-2 ${step === 'info' ? 'text-white' : 'text-green-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'info' ? 'bg-blue-600' : 'bg-green-600'
            }`}>
              {step !== 'info' ? <Check className="h-5 w-5" /> : '1'}
            </div>
            <span className="font-medium text-sm">Company Info</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-700" />
          <div className={`flex items-center gap-2 ${step === 'subsidy' ? 'text-white' : 'text-gray-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'subsidy' ? 'bg-blue-600' : 'bg-gray-700'
            }`}>
              2
            </div>
            <span className="font-medium text-sm">Set Subsidy</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-700 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Company Information */}
          {step === 'info' && (
            <div className="space-y-6">
              {/* Free Account Banner */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-6 w-6 text-green-400 flex-shrink-0" />
                  <div>
                    <h3 className="text-base font-semibold text-white mb-1">
                      Free to sign up
                    </h3>
                    <p className="text-sm text-gray-400">
                      No subscription fees. Add credits and only pay for what your team uses.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
              {/* Demo Button */}
              <div className="mb-6 flex justify-end">
                <button
                  type="button"
                  onClick={fillDemoData}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Fill Demo Data
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Acme Corporation"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="John Smith"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="john@company.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length > 0) {
                          if (value.length <= 3) {
                            value = `(${value}`;
                          } else if (value.length <= 6) {
                            value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
                          } else {
                            value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
                          }
                        }
                        setContactPhone(value);
                      }}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="(555) 123-4567"
                      maxLength={14}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Website (optional)
                    </label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="https://company.com"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition text-lg"
                >
                  Continue
                </button>
              </div>
              </div>
            </div>
          )}

          {/* Step 2: Subsidy Configuration */}
          {step === 'subsidy' && (
            <>
              {/* Main Subsidy Card */}
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Set Employee Subsidy</h2>
                <p className="text-gray-400 mb-8">
                  Choose what percentage of each pickup your company will cover
                </p>

                {/* Large Subsidy Display */}
                <div className="text-center mb-8">
                  <div className="text-7xl font-bold text-blue-500 mb-2">
                    {subsidyPercentage}%
                  </div>
                  <div className="text-lg text-gray-400">
                    Company subsidy
                  </div>
                </div>

                {/* Slider */}
                <div className="mb-8">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={subsidyPercentage}
                    onChange={(e) => setSubsidyPercentage(parseInt(e.target.value))}
                    className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${subsidyPercentage}%, #374151 ${subsidyPercentage}%, #374151 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Price Preview */}
                <div className="bg-gray-700/50 rounded-xl p-6 mb-6">
                  <div className="text-sm text-gray-400 mb-4 text-center">
                    Example: $15 pickup
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Regular price</span>
                      <span className="text-gray-400 line-through">$15.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Your company covers</span>
                      <span className="text-blue-400 font-semibold">
                        ${((15 * subsidyPercentage) / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="h-px bg-gray-600" />
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold">Employee pays</span>
                      <span className="text-2xl font-bold text-green-400">
                        ${calculateEmployeeCost(subsidyPercentage).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Adoption Meter */}
                {(() => {
                  const turnoutInfo = getTurnoutMeter(subsidyPercentage);
                  return (
                    <div className="bg-gray-700/50 rounded-xl p-6">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gray-300">
                          Expected Employee Adoption
                        </span>
                        <span className={`text-sm font-bold ${turnoutInfo.color}`}>
                          {turnoutInfo.label}
                        </span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-3 overflow-hidden">
                        <div
                          className={`${turnoutInfo.bgColor} h-full rounded-full transition-all duration-300 ease-out`}
                          style={{ width: turnoutInfo.barWidth }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-3 text-center">
                        {subsidyPercentage >= 76 && "High subsidy = Maximum employee participation"}
                        {subsidyPercentage >= 51 && subsidyPercentage < 76 && "Good subsidy = Strong employee participation"}
                        {subsidyPercentage >= 26 && subsidyPercentage < 51 && "Moderate subsidy = Fair employee participation"}
                        {subsidyPercentage < 26 && "Low subsidy = Limited employee participation"}
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep('info')}
                  className="flex-1 bg-gray-700 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-600 transition text-lg"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </>
          )}

        </form>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>
            Questions? Contact us at{' '}
            <a href="mailto:sales@dropgood.com" className="text-blue-400 hover:underline">
              sales@dropgood.com
            </a>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
