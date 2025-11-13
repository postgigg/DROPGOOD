import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building2, Users, DollarSign, TrendingUp, Package, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO/SEO';

interface Company {
  id: string;
  name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  subscription_tier: string;
  subsidy_percentage: number;
  current_employee_count: number;
  max_employees: number | null;
  employee_access_code: string;
  current_credit_balance: number;
  total_credits_used: number;
  total_bookings_count: number;
  account_status: string;
}

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Check if this is a new company signup
  const isNewCompany = location.state?.newCompany;
  const accessCode = location.state?.accessCode;

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/company-signup');
        return;
      }

      // Fetch company data for this user
      const { data, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_user_id', user.id)
        .single();

      if (companyError) {
        if (companyError.code === 'PGRST116') {
          // No company found
          setError('No company account found. Please complete signup.');
          setTimeout(() => navigate('/company-signup'), 2000);
          return;
        }
        throw companyError;
      }

      setCompany(data);
    } catch (err) {
      console.error('Error loading company:', err);
      setError(err instanceof Error ? err.message : 'Failed to load company data');
    } finally {
      setLoading(false);
    }
  };

  const copyAccessCode = () => {
    if (company?.employee_access_code) {
      navigator.clipboard.writeText(company.employee_access_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const copyInviteLink = () => {
    if (company?.employee_access_code) {
      const inviteLink = `${window.location.origin}/join-company?code=${company.employee_access_code}`;
      navigator.clipboard.writeText(inviteLink);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 max-w-md">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 text-center">{error || 'Company not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Company Dashboard - DropGood"
        description="Manage your company's employee benefits and track donation pickup usage"
      />
      <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Banner for New Companies */}
          {isNewCompany && (
            <div className="mb-8 bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-500/50 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="h-8 w-8 text-green-400 flex-shrink-0" />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-green-300 mb-2">
                    Welcome to DropGood! 🎉
                  </h2>
                  <p className="text-gray-300 mb-4">
                    Your company account has been created successfully. Share your access code with employees to get started.
                  </p>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <p className="text-sm text-gray-400 mb-2">Employee Access Code:</p>
                    <div className="flex items-center gap-3">
                      <code className="text-2xl font-bold text-blue-400 flex-1">
                        {accessCode || company.employee_access_code}
                      </code>
                      <button
                        onClick={copyAccessCode}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                      >
                        {copiedCode ? (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{company.name}</h1>
                <p className="text-gray-400">Company Dashboard</p>
              </div>
              <Building2 className="h-16 w-16 text-blue-500" />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Active Employees */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="h-8 w-8 text-blue-400" />
                <span className="text-sm text-gray-400">Employees</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {company.current_employee_count}
              </div>
              <div className="text-sm text-gray-400">
                {company.max_employees ? `of ${company.max_employees} max` : 'Unlimited'}
              </div>
            </div>

            {/* Credit Balance */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="h-8 w-8 text-green-400" />
                <span className="text-sm text-gray-400">Balance</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                ${company.current_credit_balance.toFixed(2)}
              </div>
              <div className="text-sm text-gray-400">Available credits</div>
            </div>

            {/* Total Bookings */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Package className="h-8 w-8 text-purple-400" />
                <span className="text-sm text-gray-400">Bookings</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {company.total_bookings_count}
              </div>
              <div className="text-sm text-gray-400">Total pickups</div>
            </div>

            {/* Subsidy Rate */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="h-8 w-8 text-orange-400" />
                <span className="text-sm text-gray-400">Subsidy</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {company.subsidy_percentage}%
              </div>
              <div className="text-sm text-gray-400">Employee discount</div>
            </div>
          </div>

          {/* Access Code Section */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Share with Employees</h2>
            <p className="text-gray-400 mb-6">
              Give employees this access code to enroll in your company benefits program.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Access Code
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-700 px-4 py-3 rounded-lg border border-gray-600">
                    <code className="text-xl font-bold text-blue-400">
                      {company.employee_access_code}
                    </code>
                  </div>
                  <button
                    onClick={copyAccessCode}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    {copiedCode ? (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-5 w-5" />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Invite Link
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-700 px-4 py-3 rounded-lg border border-gray-600 overflow-x-auto">
                    <code className="text-sm text-gray-300 whitespace-nowrap">
                      {window.location.origin}/join-company?code={company.employee_access_code}
                    </code>
                  </div>
                  <button
                    onClick={copyInviteLink}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-500 transition flex items-center gap-2"
                  >
                    <Copy className="h-5 w-5" />
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/company/employees')}
                className="bg-gray-700 text-white px-6 py-4 rounded-lg hover:bg-gray-600 transition text-left"
              >
                <Users className="h-6 w-6 text-blue-400 mb-2" />
                <div className="font-semibold">Manage Employees</div>
                <div className="text-sm text-gray-400">Add or remove employees</div>
              </button>

              <button
                onClick={() => navigate('/company/billing')}
                className="bg-gray-700 text-white px-6 py-4 rounded-lg hover:bg-gray-600 transition text-left"
              >
                <DollarSign className="h-6 w-6 text-green-400 mb-2" />
                <div className="font-semibold">Add Credits</div>
                <div className="text-sm text-gray-400">Fund your account</div>
              </button>

              <button
                onClick={() => navigate('/company/reports')}
                className="bg-gray-700 text-white px-6 py-4 rounded-lg hover:bg-gray-600 transition text-left"
              >
                <TrendingUp className="h-6 w-6 text-purple-400 mb-2" />
                <div className="font-semibold">View Reports</div>
                <div className="text-sm text-gray-400">Usage analytics</div>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-blue-400 hover:text-blue-300 transition"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
