import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, Package, Calendar, MapPin, Phone, Clock, AlertCircle, DollarSign, CheckCircle, MessageCircle } from 'lucide-react';
import AdminSupportChat from '../components/AdminSupportChat';

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
  const [activeTab, setActiveTab] = useState<'bookings' | 'support'>('bookings');

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading operations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Operations Dashboard</h1>
              <p className="text-sm text-slate-600 mt-1">Welcome back, {adminName}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin/financials')}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <DollarSign className="w-4 h-4" />
                <span>Financials</span>
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-6 flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'bookings'
                ? 'text-emerald-600 border-emerald-600'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Bookings
            </div>
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'support'
                ? 'text-emerald-600 border-emerald-600'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Support Chat
            </div>
          </button>
        </div>

        {activeTab === 'bookings' && (
          <>
            <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-emerald-500 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            All ({bookings.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-emerald-500 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            Pending ({bookings.filter(b => ['scheduled', 'pending_driver', 'payment_pending'].includes(b.status)).length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'active'
                ? 'bg-emerald-500 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            Active ({bookings.filter(b => ['driver_assigned', 'driver_arrived', 'picked_up', 'in_transit'].includes(b.status)).length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-emerald-500 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            Completed ({bookings.filter(b => b.status === 'completed').length})
          </button>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No bookings found</h3>
            <p className="text-slate-600">
              {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/admin/bookings/${booking.id}`)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {booking.customer_name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusLabel(booking.status)}
                        </span>
                        {booking.manual_mode && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Manual Mode
                          </span>
                        )}
                        {booking.messages_confirmed && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Messages Confirmed
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {booking.customer_phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(booking.pickup_date).toLocaleDateString()} at {booking.pickup_time}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-600">
                        ${booking.total_price.toFixed(2)}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {new Date(booking.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-slate-900 mb-1">Pickup</div>
                          <div className="text-slate-600">{booking.pickup_address}</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-slate-900 mb-1">Donation Center</div>
                          <div className="text-slate-600">{booking.donation_center_name}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <div className="text-sm">
                      <span className="font-medium text-slate-900">Items: </span>
                      <span className="text-slate-600">{booking.items_description || 'No description provided'}</span>
                    </div>
                  </div>

                  {booking.driver_name && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-900">
                          Driver: {booking.driver_name} • {booking.vehicle_color} {booking.vehicle_make} • {booking.license_plate}
                        </span>
                      </div>
                    </div>
                  )}

                  {['scheduled', 'pending_driver', 'payment_pending'].includes(booking.status) && !booking.driver_name && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200 flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-900">
                        <span className="font-medium">Action Required:</span> Assign driver and send details to customer
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
          </>
        )}

        {activeTab === 'support' && (
          <AdminSupportChat adminName={adminName} adminId={adminId} />
        )}
      </div>
    </div>
  );
}
