import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  DollarSign, TrendingUp, TrendingDown, Users,
  Calendar, Download, ArrowLeft, Loader2
} from 'lucide-react';
import DropGoodLogo from '../components/DropGoodLogo';

interface FinancialStats {
  totalRevenue: number;
  totalUberCosts: number;
  totalProfit: number;
  totalBookings: number;
  avgOrderValue: number;
  completedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  costs: number;
  profit: number;
  bookings: number;
}

export default function AdminFinancialDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days' | 'all'>('30days');

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadFinancialData();
    }
  }, [dateRange]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      navigate('/admin/login');
      return;
    }

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (!adminUser) {
      navigate('/admin/login');
      return;
    }

    setLoading(false);
    loadFinancialData();
  };

  const loadFinancialData = async () => {
    try {
      let dateFilter = new Date();

      switch (dateRange) {
        case '7days':
          dateFilter.setDate(dateFilter.getDate() - 7);
          break;
        case '30days':
          dateFilter.setDate(dateFilter.getDate() - 30);
          break;
        case '90days':
          dateFilter.setDate(dateFilter.getDate() - 90);
          break;
        case 'all':
          dateFilter = new Date('2020-01-01');
          break;
      }

      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .gte('created_at', dateFilter.toISOString());

      if (error) throw error;

      const completedBookings = bookings?.filter(b => b.status === 'completed') || [];
      const cancelledBookings = bookings?.filter(b => b.status === 'cancelled') || [];
      const pendingBookings = bookings?.filter(b =>
        !['completed', 'cancelled', 'failed'].includes(b.status)
      ) || [];

      const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
      const totalUberCosts = completedBookings.reduce((sum, b) => {
        const cost = b.manual_mode && b.actual_cost !== null ? b.actual_cost : (b.uber_cost || 0);
        return sum + cost;
      }, 0);
      const totalProfit = totalRevenue - totalUberCosts;
      const avgOrderValue = completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0;

      setStats({
        totalRevenue,
        totalUberCosts,
        totalProfit,
        totalBookings: bookings?.length || 0,
        avgOrderValue,
        completedBookings: completedBookings.length,
        cancelledBookings: cancelledBookings.length,
        pendingBookings: pendingBookings.length,
      });

      const monthlyMap = new Map<string, MonthlyData>();
      completedBookings.forEach(booking => {
        const date = new Date(booking.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, {
            month: monthKey,
            revenue: 0,
            costs: 0,
            profit: 0,
            bookings: 0,
          });
        }

        const monthData = monthlyMap.get(monthKey)!;
        const bookingCost = booking.manual_mode && booking.actual_cost !== null ? booking.actual_cost : (booking.uber_cost || 0);
        monthData.revenue += booking.total_price || 0;
        monthData.costs += bookingCost;
        monthData.profit = monthData.revenue - monthData.costs;
        monthData.bookings += 1;
      });

      const sortedMonthly = Array.from(monthlyMap.values()).sort((a, b) =>
        a.month.localeCompare(b.month)
      );

      setMonthlyData(sortedMonthly);
    } catch (error) {
      console.error('Error loading financial data:', error);
    }
  };

  const exportToCSV = () => {
    if (!monthlyData.length) return;

    const headers = ['Month', 'Revenue', 'Costs', 'Profit', 'Bookings'];
    const rows = monthlyData.map(m => [
      m.month,
      m.revenue.toFixed(2),
      m.costs.toFixed(2),
      m.profit.toFixed(2),
      m.bookings,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/admin/operations')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Operations
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Financial Dashboard</h1>
              <p className="text-sm text-slate-600 mt-1">Revenue, costs, and profit analysis</p>
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Time Period</label>
          <div className="flex gap-2">
            {[
              { value: '7days', label: 'Last 7 Days' },
              { value: '30days', label: 'Last 30 Days' },
              { value: '90days', label: 'Last 90 Days' },
              { value: 'all', label: 'All Time' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setDateRange(option.value as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  dateRange === option.value
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-emerald-500">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-slate-600">Total Revenue</h3>
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-3xl font-bold text-slate-900">${stats.totalRevenue.toFixed(2)}</div>
                <p className="text-sm text-slate-500 mt-1">{stats.completedBookings} completed bookings</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-slate-600">Uber Costs</h3>
                  <TrendingDown className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-3xl font-bold text-slate-900">${stats.totalUberCosts.toFixed(2)}</div>
                <p className="text-sm text-slate-500 mt-1">
                  {stats.totalRevenue > 0
                    ? `${((stats.totalUberCosts / stats.totalRevenue) * 100).toFixed(1)}% of revenue`
                    : '0% of revenue'}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-slate-600">Net Profit</h3>
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <div className={`text-3xl font-bold ${stats.totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  ${stats.totalProfit.toFixed(2)}
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  {stats.totalRevenue > 0
                    ? `${((stats.totalProfit / stats.totalRevenue) * 100).toFixed(1)}% margin`
                    : '0% margin'}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-slate-600">Avg Order Value</h3>
                  <DropGoodLogo size={20} />
                </div>
                <div className="text-3xl font-bold text-slate-900">${stats.avgOrderValue.toFixed(2)}</div>
                <p className="text-sm text-slate-500 mt-1">Per completed booking</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <DropGoodLogo size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Total Bookings</h3>
                    <p className="text-sm text-slate-500">All statuses</p>
                  </div>
                </div>
                <div className="text-4xl font-bold text-slate-900">{stats.totalBookings}</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <DropGoodLogo size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Completed</h3>
                    <p className="text-sm text-slate-500">Successfully delivered</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl font-bold text-green-600">{stats.completedBookings}</div>
                  <div className="text-sm text-slate-500">
                    ({stats.totalBookings > 0 ? ((stats.completedBookings / stats.totalBookings) * 100).toFixed(1) : 0}%)
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <DropGoodLogo size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Pending</h3>
                    <p className="text-sm text-slate-500">In progress</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl font-bold text-yellow-600">{stats.pendingBookings}</div>
                  <div className="text-sm text-slate-500">
                    ({stats.totalBookings > 0 ? ((stats.pendingBookings / stats.totalBookings) * 100).toFixed(1) : 0}%)
                  </div>
                </div>
              </div>
            </div>

            {monthlyData.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-500" />
                  Monthly Breakdown
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Month</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Bookings</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Revenue</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Costs</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Profit</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Margin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyData.map((month) => (
                        <tr key={month.month} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 text-sm font-medium text-slate-900">
                            {new Date(month.month + '-01').toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long'
                            })}
                          </td>
                          <td className="text-right py-3 px-4 text-sm text-slate-700">{month.bookings}</td>
                          <td className="text-right py-3 px-4 text-sm font-medium text-emerald-600">
                            ${month.revenue.toFixed(2)}
                          </td>
                          <td className="text-right py-3 px-4 text-sm text-red-600">
                            ${month.costs.toFixed(2)}
                          </td>
                          <td className={`text-right py-3 px-4 text-sm font-semibold ${
                            month.profit >= 0 ? 'text-blue-600' : 'text-red-600'
                          }`}>
                            ${month.profit.toFixed(2)}
                          </td>
                          <td className="text-right py-3 px-4 text-sm text-slate-700">
                            {month.revenue > 0 ? ((month.profit / month.revenue) * 100).toFixed(1) : 0}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 font-semibold">
                        <td className="py-3 px-4 text-sm text-slate-900">Total</td>
                        <td className="text-right py-3 px-4 text-sm text-slate-900">
                          {monthlyData.reduce((sum, m) => sum + m.bookings, 0)}
                        </td>
                        <td className="text-right py-3 px-4 text-sm text-emerald-600">
                          ${monthlyData.reduce((sum, m) => sum + m.revenue, 0).toFixed(2)}
                        </td>
                        <td className="text-right py-3 px-4 text-sm text-red-600">
                          ${monthlyData.reduce((sum, m) => sum + m.costs, 0).toFixed(2)}
                        </td>
                        <td className={`text-right py-3 px-4 text-sm ${
                          monthlyData.reduce((sum, m) => sum + m.profit, 0) >= 0
                            ? 'text-blue-600'
                            : 'text-red-600'
                        }`}>
                          ${monthlyData.reduce((sum, m) => sum + m.profit, 0).toFixed(2)}
                        </td>
                        <td className="text-right py-3 px-4 text-sm text-slate-900">
                          {monthlyData.reduce((sum, m) => sum + m.revenue, 0) > 0
                            ? ((monthlyData.reduce((sum, m) => sum + m.profit, 0) /
                               monthlyData.reduce((sum, m) => sum + m.revenue, 0)) * 100).toFixed(1)
                            : 0}%
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
