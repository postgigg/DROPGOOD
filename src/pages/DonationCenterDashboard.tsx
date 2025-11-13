import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, DollarSign, TrendingUp, Plus, LogOut, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DonationCenter {
  id: string;
  name: string;
  city: string;
  state: string;
  total_donations_received: number;
  is_active: boolean;
}

interface Sponsorship {
  id: string;
  name: string;
  donation_center_id: string;
  subsidy_percentage: number;
  current_credit_balance: number;
  total_spent: number;
  is_active: boolean;
}

export default function DonationCenterDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<DonationCenter[]>([]);
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [stats, setStats] = useState({
    totalLocations: 0,
    activeSponsorships: 0,
    totalSubsidized: 0,
    totalDonations: 0
  });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        navigate('/donation-center/auth');
        return;
      }

      const { data: dcUser, error } = await supabase
        .from('donation_center_users')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (error || !dcUser) {
        navigate('/donation-center/auth');
        return;
      }

      setUser(dcUser);
      await loadDashboardData(dcUser.id);
    } catch (err) {
      console.error('Auth error:', err);
      navigate('/donation-center/auth');
    } finally {
      setLoading(false);
    }
  }

  async function loadDashboardData(userId: string) {
    const [locationsData, sponsorshipsData] = await Promise.all([
      supabase
        .from('donation_centers')
        .select('id, name, city, state, total_donations_received, is_active')
        .eq('owner_user_id', userId),
      supabase
        .from('sponsorships')
        .select('*')
        .eq('owner_user_id', userId)
    ]);

    if (locationsData.data) {
      setLocations(locationsData.data);
      const totalDonations = locationsData.data.reduce((sum, loc) => sum + (loc.total_donations_received || 0), 0);
      setStats(prev => ({ ...prev, totalLocations: locationsData.data.length, totalDonations }));
    }

    if (sponsorshipsData.data) {
      setSponsorships(sponsorshipsData.data);
      const activeCount = sponsorshipsData.data.filter(s => s.is_active).length;
      const totalSubsidized = sponsorshipsData.data.reduce((sum, s) => sum + (s.total_spent || 0), 0);
      setStats(prev => ({ ...prev, activeSponsorships: activeCount, totalSubsidized }));
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate('/donation-center/auth');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-500" />
              <div>
                <span className="text-xl font-bold text-white">DropGood</span>
                <span className="text-sm text-gray-400 ml-2">Donation Center Portal</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-300">{user?.organization_name}</span>
              <button
                onClick={() => navigate('/donation-center/settings')}
                className="text-gray-400 hover:text-gray-300"
              >
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-gray-400 hover:text-gray-300"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back, {user?.contact_name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <MapPin className="h-8 w-8 text-blue-500" />
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.totalLocations}</h3>
            <p className="text-gray-400 text-sm">Total Locations</p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 text-green-500" />
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.activeSponsorships}</h3>
            <p className="text-gray-400 text-sm">Active Sponsorships</p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Package className="h-8 w-8 text-purple-500" />
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.totalDonations}</h3>
            <p className="text-gray-400 text-sm">Total Donations</p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 text-yellow-500" />
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">${stats.totalSubsidized.toFixed(2)}</h3>
            <p className="text-gray-400 text-sm">Total Subsidized</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Your Locations</h2>
              <button
                onClick={() => navigate('/donation-center/locations/add')}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="h-4 w-4" />
                Add Location
              </button>
            </div>

            <div className="space-y-4">
              {locations.length === 0 ? (
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
                  <MapPin className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-white font-semibold mb-2">No locations yet</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Add your first donation center location to get started
                  </p>
                  <button
                    onClick={() => navigate('/donation-center/locations/add')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Add Your First Location
                  </button>
                </div>
              ) : (
                locations.map((location) => (
                  <div
                    key={location.id}
                    className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition cursor-pointer"
                    onClick={() => navigate(`/donation-center/locations/${location.id}`)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-white">{location.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        location.is_active
                          ? 'bg-green-900/50 text-green-400'
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {location.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">
                      {location.city}, {location.state}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        {location.total_donations_received} donations received
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Sponsorships</h2>
              <button
                onClick={() => navigate('/donation-center/sponsorships/create')}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                <Plus className="h-4 w-4" />
                Create Sponsorship
              </button>
            </div>

            <div className="space-y-4">
              {sponsorships.length === 0 ? (
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
                  <DollarSign className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-white font-semibold mb-2">No sponsorships yet</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Create a sponsorship campaign to subsidize pickups and attract more donors
                  </p>
                  <button
                    onClick={() => navigate('/donation-center/sponsorships/create')}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Create Your First Sponsorship
                  </button>
                </div>
              ) : (
                sponsorships.map((sponsorship) => (
                  <div
                    key={sponsorship.id}
                    className="bg-gray-800 border border-gray-700 rounded-xl p-6"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-white">{sponsorship.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        sponsorship.is_active && sponsorship.current_credit_balance > 0
                          ? 'bg-green-900/50 text-green-400'
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {sponsorship.is_active && sponsorship.current_credit_balance > 0 ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4 mb-4">
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Subsidy</p>
                        <p className="text-white font-semibold">{sponsorship.subsidy_percentage}%</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Remaining Credit</p>
                        <p className="text-white font-semibold">${sponsorship.current_credit_balance.toFixed(2)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/donation-center/sponsorships/${sponsorship.id}/add-funds`)}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                      <DollarSign className="h-4 w-4" />
                      Add Funds
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
