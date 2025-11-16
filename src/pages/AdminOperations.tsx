import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, Calendar, MapPin, Phone, Clock, AlertCircle, DollarSign, CheckCircle, MessageCircle, Building2, Zap, TrendingUp } from 'lucide-react';
import AdminSupportChat from '../components/AdminSupportChat';
import DonationCentersAnalytics from '../components/DonationCentersAnalytics';
import BookingKanban from '../components/BookingKanban';
import DropGoodLogo from '../components/DropGoodLogo';

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  pickup_address: string;
  pickup_date: string;
  pickup_time: string;
  items_description: string;
  donation_center_name: string;
  donation_center_address: string;
  status: string;
  total_price: number;
  manual_mode: boolean;
  driver_name: string | null;
  driver_phone: string | null;
  vehicle_make: string | null;
  vehicle_color: string | null;
  license_plate: string | null;
  photo_urls: string[];
  created_at: string;
  messages_confirmed: boolean;
}

export default function AdminOperations() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'completed'>('all');
  const [adminName, setAdminName] = useState('');
  const [adminId, setAdminId] = useState('');
  const [activeTab, setActiveTab] = useState<'bookings' | 'support' | 'donation-centers'>('bookings');

  useEffect(() => {
    checkAuth();
    loadBookings();

    const channel = supabase
      .channel('bookings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        loadBookings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkAuth = async () => {
    // Check localStorage for bypassed auth
    const isLoggedIn = localStorage.getItem('admin_logged_in');
    const adminEmail = localStorage.getItem('admin_email');

    if (!isLoggedIn || !adminEmail) {
      navigate('/admin/login');
      return;
    }

    // Set admin info from localStorage bypass
    setAdminName('Admin User');
    setAdminId('bypass-admin');
  };

  const loadBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          donation_centers (
            name,
            street_address,
            city,
            state,
            zip_code
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedBookings = data?.map((booking: any) => ({
        ...booking,
        pickup_address: `${booking.pickup_street_address}, ${booking.pickup_city}, ${booking.pickup_state} ${booking.pickup_zip_code}`,
        pickup_date: booking.scheduled_date,
        pickup_time: booking.scheduled_time_start?.substring(0, 5) || '',
        donation_center_name: booking.donation_centers?.name || 'Unknown',
        donation_center_address: booking.donation_centers
          ? `${booking.donation_centers.street_address}, ${booking.donation_centers.city}, ${booking.donation_centers.state} ${booking.donation_centers.zip_code}`
          : 'Unknown',
      })) || [];

      setBookings(formattedBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const handleUpdateBooking = (bookingId: string, newStatus: string) => {
    setBookings(prevBookings =>
      prevBookings.map(booking =>
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      )
    );
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'pending') return ['scheduled', 'pending_driver', 'payment_pending'].includes(booking.status);
    if (filter === 'active') return ['driver_assigned', 'driver_arrived', 'picked_up', 'in_transit'].includes(booking.status);
    if (filter === 'completed') return booking.status === 'completed';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'payment_pending':
      case 'scheduled':
      case 'pending_driver':
        return 'bg-yellow-100 text-yellow-800';
      case 'driver_assigned':
      case 'driver_arrived':
        return 'bg-blue-100 text-blue-800';
      case 'picked_up':
      case 'in_transit':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-900 text-xl font-semibold">Loading operations...</p>
        </div>
      </div>
    );
  }

  // Calculate stats for dashboard
  const totalRevenue = bookings.reduce((sum, b) => sum + b.total_price, 0);
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const activeCount = bookings.filter(b => ['driver_assigned', 'driver_arrived', 'picked_up', 'in_transit'].includes(b.status)).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Operations Dashboard</h1>
              </div>
              <p className="text-sm text-gray-600 ml-14">Welcome back, {adminName}</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Quick Stats */}
              <div className="hidden lg:flex items-center gap-6 px-5 py-3 bg-gray-100 rounded-lg border border-gray-200">
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">{bookings.length}</p>
                  <p className="text-xs text-gray-600 font-medium">TOTAL</p>
                </div>
                <div className="w-px h-10 bg-gray-300"></div>
                <div className="text-center">
                  <p className="text-xl font-bold text-blue-600">{activeCount}</p>
                  <p className="text-xs text-gray-600 font-medium">ACTIVE</p>
                </div>
                <div className="w-px h-10 bg-gray-300"></div>
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">${totalRevenue.toFixed(0)}</p>
                  <p className="text-xs text-gray-600 font-medium">REVENUE</p>
                </div>
              </div>

              <button
                onClick={() => navigate('/admin/financials')}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Financials</span>
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium border border-gray-300"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Tab Navigation */}
        <div className="mb-6 flex items-center gap-2 bg-white p-1.5 rounded-lg border border-gray-200 shadow-sm">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex-1 px-5 py-3 font-semibold transition-all rounded-md ${
              activeTab === 'bookings'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Zap className="h-4 h-4" />
              Bookings
            </div>
          </button>
          <button
            onClick={() => setActiveTab('donation-centers')}
            className={`flex-1 px-5 py-3 font-semibold transition-all rounded-md ${
              activeTab === 'donation-centers'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Building2 className="h-4 w-4" />
              Donation Centers
            </div>
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`flex-1 px-5 py-3 font-semibold transition-all rounded-md ${
              activeTab === 'support'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Support Chat
            </div>
          </button>
        </div>

        {activeTab === 'bookings' && (
          <BookingKanban bookings={bookings} onUpdateBooking={handleUpdateBooking} />
        )}

        {activeTab === 'donation-centers' && (
          <DonationCentersAnalytics />
        )}

        {activeTab === 'support' && (
          <AdminSupportChat adminName={adminName} adminId={adminId} />
        )}
      </div>
    </div>
  );
}
