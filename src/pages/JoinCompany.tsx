import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, Mail, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO/SEO';
import { seoPages } from '../components/SEO/seoConfig';

export default function JoinCompany() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const codeFromUrl = searchParams.get('code');

  const [accessCode, setAccessCode] = useState(codeFromUrl || '');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [checkingCode, setCheckingCode] = useState(false);

  // Temporarily redirect to marketing page
  useEffect(() => {
    navigate('/for-companies');
  }, [navigate]);

  // Auto-check code if provided in URL
  useEffect(() => {
    if (codeFromUrl) {
      checkAccessCode(codeFromUrl);
    }
  }, [codeFromUrl]);

  const checkAccessCode = async (code: string) => {
    if (!code || code.length < 6) return;

    setCheckingCode(true);
    setError(null);

    try {
      // Find company by access code
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('employee_access_code', code.toUpperCase())
        .eq('subscription_status', 'active')
        .single();

      if (companyError || !company) {
        setError('Invalid or expired access code. Please check with your HR department.');
        setCompanyInfo(null);
        return;
      }

      // Check if subscription is valid
      if (company.subscription_ends_at) {
        const expiresAt = new Date(company.subscription_ends_at);
        if (expiresAt < new Date()) {
          setError('This company\'s subscription has expired.');
          setCompanyInfo(null);
          return;
        }
      }

      // Check employee limit
      if (company.max_employees && company.current_employee_count >= company.max_employees) {
        setError('This company has reached its employee limit. Please contact your HR department.');
        setCompanyInfo(null);
        return;
      }

      setCompanyInfo(company);
      setError(null);
    } catch (err) {
      console.error('Error checking access code:', err);
      setError('Failed to verify access code. Please try again.');
      setCompanyInfo(null);
    } finally {
      setCheckingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessCode || !email) {
      setError('Please provide both access code and email');
      return;
    }

    if (!companyInfo) {
      setError('Please enter a valid access code first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if email domain is allowed (if company has restrictions)
      if (companyInfo.require_email_domain && companyInfo.allowed_email_domains?.length > 0) {
        const emailDomain = '@' + email.split('@')[1];
        if (!companyInfo.allowed_email_domains.includes(emailDomain)) {
          throw new Error(`Only emails from ${companyInfo.allowed_email_domains.join(', ')} are allowed`);
        }
      }

      // Check if employee already exists
      const { data: existingEmployee } = await supabase
        .from('company_employees')
        .select('*')
        .eq('company_id', companyInfo.id)
        .eq('email', email.toLowerCase())
        .single();

      if (existingEmployee) {
        if (existingEmployee.status === 'active') {
          setError('You are already enrolled in this company\'s benefits program!');
          return;
        } else if (existingEmployee.status === 'pending') {
          setError('Your enrollment is pending approval from your company.');
          return;
        } else if (existingEmployee.status === 'removed') {
          setError('Your access has been revoked. Please contact your HR department.');
          return;
        }
      }

      // Create employee record
      const employeeStatus = companyInfo.require_approval ? 'pending' : 'active';

      const { error: insertError } = await supabase
        .from('company_employees')
        .insert({
          company_id: companyInfo.id,
          email: email.toLowerCase(),
          first_name: firstName || null,
          last_name: lastName || null,
          status: employeeStatus,
          joined_at: employeeStatus === 'active' ? new Date().toISOString() : null
        });

      if (insertError) {
        // Check if it's a unique constraint violation
        if (insertError.message.includes('unique')) {
          throw new Error('This email is already registered with this company');
        }
        throw insertError;
      }

      // Save email to localStorage for booking flow
      localStorage.setItem('dropgood_last_email', email.toLowerCase());

      setSuccess(true);
    } catch (err) {
      console.error('Error joining company:', err);
      setError(err instanceof Error ? err.message : 'Failed to join company benefits program');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <SEO {...seoPages.joinCompany} />
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-2 border-green-500 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-400" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-4">
              🎉 Welcome to the Team!
            </h1>

            {companyInfo.require_approval ? (
              <>
                <p className="text-xl text-gray-300 mb-6">
                  Your enrollment is pending approval from <strong className="text-white">{companyInfo.name}</strong>.
                </p>
                <p className="text-gray-400 mb-8">
                  You'll receive an email once your access is approved. This usually takes 1-2 business days.
                </p>
              </>
            ) : (
              <>
                <p className="text-xl text-gray-300 mb-6">
                  You're now enrolled in <strong className="text-white">{companyInfo.name}</strong>'s
                  employee benefits program!
                </p>

                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Sparkles className="h-6 w-6 text-yellow-400" />
                    <h2 className="text-2xl font-bold text-yellow-400">
                      {companyInfo.subsidy_percentage}% OFF
                    </h2>
                  </div>
                  <p className="text-gray-300">
                    Your company will cover {companyInfo.subsidy_percentage}% of your donation pickup costs.
                    This benefit applies automatically when you book a pickup!
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => navigate('/book')}
                    className="w-full bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition"
                  >
                    Book Your First Pickup
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="w-full bg-gray-700 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-600 transition"
                  >
                    Go to Home
                  </button>
                </div>
              </>
            )}

            <p className="text-sm text-gray-500 mt-6">
              Questions? Contact your HR department or email us at support@dropgood.co
            </p>
          </div>
        </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO {...seoPages.joinCompany} />
      <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Building2 className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-4">
            Join Your Company's Benefits Program
          </h1>
          <p className="text-xl text-gray-400">
            Get subsidized donation pickups as an employee benefit
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-700 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gray-800 border border-gray-700 rounded-xl p-8">
          {/* Access Code */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Company Access Code *
            </label>
            <input
              type="text"
              value={accessCode}
              onChange={(e) => {
                const code = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                setAccessCode(code);
                if (code.length >= 6) {
                  checkAccessCode(code);
                }
              }}
              onBlur={() => {
                if (accessCode) checkAccessCode(accessCode);
              }}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-blue-500 uppercase"
              placeholder="XXXXXX"
              maxLength={8}
              required
            />
            <p className="text-sm text-gray-400 mt-2">
              Enter the access code provided by your employer
            </p>

            {checkingCode && (
              <div className="mt-4 flex items-center justify-center gap-2 text-gray-400">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                <span>Verifying code...</span>
              </div>
            )}
          </div>

          {/* Company Info Display */}
          {companyInfo && (
            <div className="mb-6 bg-green-900/20 border border-green-700/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-green-300 mb-1">
                    Valid Code for {companyInfo.name}
                  </h3>
                  <p className="text-sm text-gray-300">
                    You'll receive <strong className="text-white">{companyInfo.subsidy_percentage}% off</strong> your
                    donation pickup costs as an employee benefit!
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-gray-700 pt-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Your Information</h3>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Work Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="you@company.com"
                  required
                />
              </div>
              {companyInfo?.require_email_domain && companyInfo?.allowed_email_domains?.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Must be an email from: {companyInfo.allowed_email_domains.join(', ')}
                </p>
              )}
            </div>

            {/* Name Fields (Optional) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  First Name (optional)
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name (optional)
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Smith"
                />
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="mb-6 bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-300 mb-2">What happens next?</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              {companyInfo?.require_approval ? (
                <>
                  <li>• Your employer will review and approve your enrollment</li>
                  <li>• You'll receive an email confirmation once approved</li>
                  <li>• Then you can start booking subsidized pickups!</li>
                </>
              ) : (
                <>
                  <li>• Your benefit activates immediately</li>
                  <li>• The discount applies automatically when you book</li>
                  <li>• No additional steps required!</li>
                </>
              )}
            </ul>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !companyInfo || checkingCode}
            className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enrolling...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                Enroll in Benefits Program
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            By enrolling, you agree to your company tracking your usage of this benefit for administrative purposes.
          </p>
        </form>

        {/* Footer Help */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm mb-2">
            Don't have an access code?
          </p>
          <p className="text-gray-500 text-sm">
            Contact your HR department or company administrator to get your unique access code.
          </p>
        </div>
      </div>
      </div>
    </>
  );
}
