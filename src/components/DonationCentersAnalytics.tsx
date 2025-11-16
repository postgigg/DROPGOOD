import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ChevronDown, ChevronRight, Building2, TrendingUp, Package, DollarSign, Loader } from 'lucide-react';

interface DonationCenterStats {
  id: string;
  name: string;
  city: string;
  state: string;
  street_address: string;
  zip_code: string;
  total_bookings: number;
  total_bags: number;
  total_boxes: number;
  total_uber_cost: number;
  total_revenue: number;
  net_profit: number;
  is_active: boolean;
}

interface StateGroup {
  state: string;
  centers: DonationCenterStats[];
  totalCenters: number;
  totalBookings: number;
  totalRevenue: number;
}

export default function DonationCentersAnalytics() {
  const [stateGroups, setStateGroups] = useState<StateGroup[]>([]);
  const [expandedStates, setExpandedStates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState<DonationCenterStats | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Get all donation centers with their booking stats
      const { data: centers, error: centersError } = await supabase
        .from('donation_centers')
        .select('*')
        .order('state', { ascending: true })
        .order('name', { ascending: true });

      if (centersError) throw centersError;

      // Get booking stats for each center
      const { data: bookingStats, error: statsError } = await supabase
        .from('bookings')
        .select('donation_center_id, total_price, uber_cost, bags_count, boxes_count')
        .eq('status', 'completed');

      if (statsError) throw statsError;

      // Aggregate stats per center
      const centerStatsMap = new Map<string, {
        totalBookings: number;
        totalBags: number;
        totalBoxes: number;
        totalUberCost: number;
        totalRevenue: number;
      }>();

      bookingStats?.forEach((booking: any) => {
        const centerId = booking.donation_center_id;
        if (!centerId) return;

        const existing = centerStatsMap.get(centerId) || {
          totalBookings: 0,
          totalBags: 0,
          totalBoxes: 0,
          totalUberCost: 0,
          totalRevenue: 0,
        };

        centerStatsMap.set(centerId, {
          totalBookings: existing.totalBookings + 1,
          totalBags: existing.totalBags + (booking.bags_count || 0),
          totalBoxes: existing.totalBoxes + (booking.boxes_count || 0),
          totalUberCost: existing.totalUberCost + (parseFloat(booking.uber_cost) || 0),
          totalRevenue: existing.totalRevenue + (parseFloat(booking.total_price) || 0),
        });
      });

      // Map centers with their stats
      const centersWithStats: DonationCenterStats[] = centers?.map((center: any) => {
        const stats = centerStatsMap.get(center.id) || {
          totalBookings: 0,
          totalBags: 0,
          totalBoxes: 0,
          totalUberCost: 0,
          totalRevenue: 0,
        };

        return {
          id: center.id,
          name: center.name,
          city: center.city,
          state: center.state,
          street_address: center.street_address,
          zip_code: center.zip_code,
          total_bookings: stats.totalBookings,
          total_bags: stats.totalBags,
          total_boxes: stats.totalBoxes,
          total_uber_cost: stats.totalUberCost,
          total_revenue: stats.totalRevenue,
          net_profit: stats.totalRevenue - stats.totalUberCost,
          is_active: center.is_active,
        };
      }) || [];

      // Group by state
      const grouped = centersWithStats.reduce((acc, center) => {
        const stateGroup = acc.find(g => g.state === center.state);
        if (stateGroup) {
          stateGroup.centers.push(center);
          stateGroup.totalCenters++;
          stateGroup.totalBookings += center.total_bookings;
          stateGroup.totalRevenue += center.total_revenue;
        } else {
          acc.push({
            state: center.state,
            centers: [center],
            totalCenters: 1,
            totalBookings: center.total_bookings,
            totalRevenue: center.total_revenue,
          });
        }
        return acc;
      }, [] as StateGroup[]);

      // Sort by total bookings (most active states first)
      grouped.sort((a, b) => b.totalBookings - a.totalBookings);

      setStateGroups(grouped);
    } catch (error) {
      console.error('Error loading donation center analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleState = (state: string) => {
    const newExpanded = new Set(expandedStates);
    if (newExpanded.has(state)) {
      newExpanded.delete(state);
    } else {
      newExpanded.add(state);
    }
    setExpandedStates(newExpanded);
  };

  const handleCenterClick = (center: DonationCenterStats) => {
    setSelectedCenter(selectedCenter?.id === center.id ? null : center);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Centers</p>
              <p className="text-2xl font-bold text-slate-900">
                {stateGroups.reduce((sum, g) => sum + g.totalCenters, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <Package className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Donations</p>
              <p className="text-2xl font-bold text-slate-900">
                {stateGroups.reduce((sum, g) => sum + g.totalBookings, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900">
                ${stateGroups.reduce((sum, g) => sum + g.totalRevenue, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* State Groups */}
      {stateGroups.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No donation centers found</h3>
          <p className="text-slate-600">Add donation centers to see analytics</p>
        </div>
      ) : (
        stateGroups.map((stateGroup) => (
          <div key={stateGroup.state} className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* State Header */}
            <button
              onClick={() => toggleState(stateGroup.state)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {expandedStates.has(stateGroup.state) ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
                <h3 className="text-lg font-bold text-slate-900">{stateGroup.state}</h3>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                  {stateGroup.totalCenters} {stateGroup.totalCenters === 1 ? 'center' : 'centers'}
                </span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-right">
                  <p className="text-slate-600">Donations</p>
                  <p className="font-semibold text-slate-900">{stateGroup.totalBookings}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-600">Revenue</p>
                  <p className="font-semibold text-emerald-600">${stateGroup.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </button>

            {/* Centers List */}
            {expandedStates.has(stateGroup.state) && (
              <div className="border-t border-slate-200">
                {stateGroup.centers.map((center) => (
                  <div key={center.id}>
                    <button
                      onClick={() => handleCenterClick(center)}
                      className="w-full px-6 py-4 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-900">{center.name}</h4>
                            {!center.is_active && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs font-medium">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600">
                            {center.street_address}, {center.city}, {center.state} {center.zip_code}
                          </p>
                        </div>
                        <div className="flex items-center gap-8 text-sm">
                          <div className="text-center">
                            <p className="text-slate-600 text-xs">Donations</p>
                            <p className="font-bold text-slate-900">{center.total_bookings}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-slate-600 text-xs">Bags</p>
                            <p className="font-bold text-blue-600">{center.total_bags}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-slate-600 text-xs">Boxes</p>
                            <p className="font-bold text-purple-600">{center.total_boxes}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-slate-600 text-xs">Revenue</p>
                            <p className="font-bold text-emerald-600">${center.total_revenue.toFixed(2)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-slate-600 text-xs">Profit</p>
                            <p className={`font-bold ${center.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${center.net_profit.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Expanded Details */}
                    {selectedCenter?.id === center.id && (
                      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <Package className="w-4 h-4 text-blue-500" />
                              <p className="text-xs text-slate-600 font-medium">Total Bags</p>
                            </div>
                            <p className="text-2xl font-bold text-blue-600">{center.total_bags}</p>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <Package className="w-4 h-4 text-purple-500" />
                              <p className="text-xs text-slate-600 font-medium">Total Boxes</p>
                            </div>
                            <p className="text-2xl font-bold text-purple-600">{center.total_boxes}</p>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <DollarSign className="w-4 h-4 text-red-500" />
                              <p className="text-xs text-slate-600 font-medium">Total Costs</p>
                            </div>
                            <p className="text-2xl font-bold text-red-600">${center.total_uber_cost.toFixed(2)}</p>
                            <p className="text-xs text-slate-500 mt-1">Uber + fees</p>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="w-4 h-4 text-green-500" />
                              <p className="text-xs text-slate-600 font-medium">Net Profit</p>
                            </div>
                            <p className={`text-2xl font-bold ${center.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${center.net_profit.toFixed(2)}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {center.net_profit >= 0 ? 'Profitable' : 'Loss'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
