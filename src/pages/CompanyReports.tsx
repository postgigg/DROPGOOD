import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, Users, Package, DollarSign, Calendar, ArrowLeft, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Company {
  id: string;
  name: string;
  current_credit_balance: number;
  total_credits_used: number;
  total_bookings_count: number;
  current_employee_count: number;
  subsidy_percentage: number;
}

interface MonthlyStats {
  month: string;
  bookings: number;
  credits_used: number;
  unique_employees: number;
}

export default function CompanyReports() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/company-signup');
        return;
      }

      // Load company data
      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_user_id', user.id)
        .single();

      if (companyData) {
        setCompany(companyData);
      }

      // Generate mock monthly stats (you'd replace with real data)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const mockStats: MonthlyStats[] = months.map((month, idx) => ({
        month,
        bookings: Math.floor(Math.random() * 20) + 5,
        credits_used: Math.floor(Math.random() * 500) + 100,
        unique_employees: Math.floor(Math.random() * 10) + 3
      }));
      setMonthlyStats(mockStats);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    // Generate CSV data
    const csvContent = [
      ['Month', 'Bookings', 'Credits Used', 'Active Employees'],
      ...monthlyStats.map(stat => [
        stat.month,
        stat.bookings,
        stat.credits_used,
        stat.unique_employees
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${company?.name}-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading reports...</p>
        </div>
      </div>
    );
  }

  const totalCreditsUsed = monthlyStats.reduce((sum, stat) => sum + stat.credits_used, 0);
  const totalBookings = monthlyStats.reduce((sum, stat) => sum + stat.bookings, 0);
  const avgBookingsPerMonth = totalBookings / monthlyStats.length;
  const avgCreditsPerBooking = totalCreditsUsed / totalBookings || 0;

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/company-dashboard')}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Reports & Analytics</h1>
              <p className="text-gray-400">Track usage and optimize your employee benefits</p>
            </div>
            <button
              onClick={exportReport}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Download className="h-5 w-5" />
              Export Report
            </button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-8">
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-gray-400" />
            <span className="text-gray-400">Time Period:</span>
            <div className="flex gap-2">
              {[
                { value: '30d', label: 'Last 30 Days' },
                { value: '90d', label: 'Last 90 Days' },
                { value: '1y', label: 'Last Year' }
              ].map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedPeriod === period.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Package className="h-8 w-8 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{company?.total_bookings_count}</div>
            <div className="text-sm text-gray-400">Total Pickups</div>
            <div className="text-xs text-green-400 mt-2">
              {avgBookingsPerMonth.toFixed(1)} avg/month
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              ${company?.total_credits_used?.toFixed(0) || '0'}
            </div>
            <div className="text-sm text-gray-400">Credits Used</div>
            <div className="text-xs text-blue-400 mt-2">
              ${avgCreditsPerBooking.toFixed(2)} per booking
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{company?.current_employee_count}</div>
            <div className="text-sm text-gray-400">Active Employees</div>
            <div className="text-xs text-gray-500 mt-2">
              Enrolled in program
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-orange-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{company?.subsidy_percentage}%</div>
            <div className="text-sm text-gray-400">Subsidy Rate</div>
            <div className="text-xs text-gray-500 mt-2">
              Employee discount
            </div>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-400" />
            Monthly Trends
          </h2>

          {/* Simple Bar Chart */}
          <div className="space-y-4">
            {monthlyStats.map((stat, idx) => {
              const maxBookings = Math.max(...monthlyStats.map(s => s.bookings));
              const barWidth = (stat.bookings / maxBookings) * 100;

              return (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-400">{stat.month}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-400">
                        <span className="text-white font-semibold">{stat.bookings}</span> bookings
                      </span>
                      <span className="text-gray-400">
                        <span className="text-green-400 font-semibold">${stat.credits_used}</span> used
                      </span>
                      <span className="text-gray-400">
                        <span className="text-purple-400 font-semibold">{stat.unique_employees}</span> employees
                      </span>
                    </div>
                  </div>
                  <div className="relative h-8 bg-gray-700 rounded-lg overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <h3 className="text-xl font-bold text-white mb-4">Usage Insights</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2" />
                <div>
                  <div className="text-white font-medium">Peak Usage</div>
                  <div className="text-sm text-gray-400">Most bookings in recent months</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2" />
                <div>
                  <div className="text-white font-medium">Cost Savings</div>
                  <div className="text-sm text-gray-400">
                    Employees save {company?.subsidy_percentage}% on every pickup
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2" />
                <div>
                  <div className="text-white font-medium">Engagement Rate</div>
                  <div className="text-sm text-gray-400">
                    {((company?.total_bookings_count || 0) / (company?.current_employee_count || 1)).toFixed(1)} bookings per employee
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <h3 className="text-xl font-bold text-white mb-4">Recommendations</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2" />
                <div>
                  <div className="text-white font-medium">Promote Benefits</div>
                  <div className="text-sm text-gray-400">
                    Share access code with new employees to increase adoption
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-400 rounded-full mt-2" />
                <div>
                  <div className="text-white font-medium">Monitor Balance</div>
                  <div className="text-sm text-gray-400">
                    Current balance: ${company?.current_credit_balance?.toFixed(2)}
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-pink-400 rounded-full mt-2" />
                <div>
                  <div className="text-white font-medium">Seasonal Trends</div>
                  <div className="text-sm text-gray-400">
                    Plan credit purchases around peak donation seasons
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
