import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, User, Phone, CheckCircle, FileText, MessageCircle } from 'lucide-react';
import SEO from '../components/SEO/SEO';
import { seoPages } from '../components/SEO/seoConfig';
import { supabase } from '../lib/supabase';
import BookingChat from '../components/BookingChat';
import DropGoodLogo from '../components/DropGoodLogo';

export default function TrackingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [receiptNumber, setReceiptNumber] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadBooking();
      loadReceipt();
      subscribeToBookingUpdates();
    }

    return () => {
      supabase.removeAllChannels();
    };
  }, [id]);

  function subscribeToBookingUpdates() {
    const channel = supabase
      .channel(`booking:${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setBooking((prev: any) => ({
            ...prev,
            ...payload.new,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async function loadBooking() {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          donation_centers (
            name,
            street_address,
            city,
            state
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setBooking(data);
    } catch (error) {
      console.error('Error loading booking:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadReceipt() {
    try {
      const { data } = await supabase
        .from('donation_receipts')
        .select('receipt_number')
        .eq('booking_id', id)
        .single();

      if (data) {
        setReceiptNumber(data.receipt_number);
      }
    } catch (error) {
      console.error('Error loading receipt:', error);
    }
  }

  const getStatusStep = (status: string) => {
    const steps = ['scheduled', 'driver_assigned', 'picked_up', 'completed'];
    return steps.indexOf(status) + 1;
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'scheduled': 'Waiting for driver assignment',
      'pending_driver': 'Finding a driver...',
      'driver_assigned': 'Driver on the way to pickup',
      'driver_arrived': 'Driver has arrived',
      'picked_up': 'In transit to donation center',
      'in_transit': 'In transit to donation center',
      'completed': 'Delivered successfully!',
      'cancelled': 'Booking cancelled',
      'failed': 'Delivery failed'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-700 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-white text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Booking Not Found</h1>
          <p className="text-gray-400 mb-8">We couldn't find this booking</p>
          <button
            onClick={() => navigate('/')}
            className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const currentStep = getStatusStep(booking.status);

  return (
    <>
      <SEO {...seoPages.tracking} />
      <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-white/70 hover:text-white transition mb-4"
          >
            <DropGoodLogo size={20} className="mr-2" />
            <span className="font-semibold">DropGood</span>
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Track Pickup</h1>
            <p className="text-gray-400 font-mono text-sm">#{booking.id}</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Status Card */}
        <div className="bg-gray-900 rounded-2xl overflow-hidden mb-6 shadow-2xl">
          {/* Status Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
            <p className="text-blue-100 text-sm font-semibold uppercase tracking-wide mb-2">
              Current Status
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {getStatusText(booking.status)}
            </h2>
            {booking.status === 'completed' && booking.delivered_at && (
              <p className="text-blue-100 mt-2">
                Delivered at {new Date(booking.delivered_at).toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Timeline */}
          <div className="p-8">
            <div className="space-y-6">
              {[
                { status: 'scheduled', icon: Clock, label: 'Scheduled', desc: 'Pickup window confirmed' },
                { status: 'driver_assigned', icon: User, label: 'Courier Assigned', desc: 'Driver matched and notified' },
                { status: 'picked_up', icon: Package, label: 'Picked Up', desc: 'Items collected from your location' },
                { status: 'completed', icon: CheckCircle, label: 'Delivered', desc: 'Donation complete' }
              ].map((step, idx) => {
                const StepIcon = step.icon;
                const steps = ['scheduled', 'driver_assigned', 'picked_up', 'completed'];
                const stepIndex = steps.indexOf(booking.status);
                const isActive = idx <= stepIndex;
                const isCurrent = idx === stepIndex;

                return (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isActive
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-800 text-gray-600'
                      } ${isCurrent ? 'ring-4 ring-green-600/30' : ''}`}>
                        <StepIcon className="h-5 w-5" strokeWidth={2.5} />
                      </div>
                      {idx < 3 && (
                        <div className={`w-0.5 flex-1 my-2 min-h-[30px] ${
                          isActive ? 'bg-green-600' : 'bg-gray-800'
                        }`}></div>
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <p className={`font-bold text-lg ${
                        isActive ? 'text-white' : 'text-gray-600'
                      }`}>
                        {step.label}
                      </p>
                      <p className={`text-sm ${
                        isActive ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Driver Info */}
        {booking.driver_name && (
          <div className="bg-gray-900 rounded-2xl p-6 mb-6 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Your Courier</p>
                <p className="text-white font-bold text-xl">{booking.driver_name}</p>
                <p className="text-gray-400 text-sm">{booking.driver_vehicle}</p>
                {booking.driver_rating && (
                  <p className="text-sm text-gray-400 mt-1">★ {booking.driver_rating.toFixed(1)}</p>
                )}
              </div>
              {booking.driver_phone && (
                <a
                  href={`tel:${booking.driver_phone}`}
                  className="bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition flex items-center gap-2"
                >
                  <Phone className="h-5 w-5" />
                  Call
                </a>
              )}
            </div>
          </div>
        )}

        {/* Journey Details */}
        <div className="bg-gray-900 rounded-2xl p-8 mb-6 shadow-2xl">
          <div className="space-y-6">
            {/* Pickup */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <div className="w-0.5 flex-1 bg-gray-700 min-h-[40px]"></div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Pickup</p>
                <p className="text-white font-semibold text-lg">{booking.pickup_street_address}</p>
                <p className="text-gray-400">{booking.pickup_city}, {booking.pickup_state}</p>
              </div>
            </div>

            {/* Dropoff */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Dropoff</p>
                <p className="text-white font-semibold text-lg">{booking.donation_centers.name}</p>
                <p className="text-gray-400">{booking.donation_centers.street_address}</p>
                <p className="text-gray-400">{booking.donation_centers.city}, {booking.donation_centers.state}</p>
              </div>
            </div>

            {/* Scheduled Time */}
            <div className="pt-6 border-t border-gray-800">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Pickup Window</p>
                  <p className="text-white font-semibold">
                    {new Date(booking.scheduled_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {booking.scheduled_time_start}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Receipts & Documents */}
        <div className="bg-gray-900 rounded-2xl p-8 mb-6 shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-6">Documents & Receipts</h3>

          {receiptNumber || booking.status === 'completed' ? (
            <div className="space-y-4">
              {receiptNumber && (
                <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-lg">Tax Receipt</p>
                      <p className="text-white/90 text-sm">IRS-compliant 501(c)(3) receipt</p>
                    </div>
                    <button
                      onClick={() => navigate(`/receipt/${receiptNumber}`)}
                      className="bg-white text-green-600 px-5 py-2.5 rounded-full font-bold hover:bg-gray-100 transition"
                    >
                      View
                    </button>
                  </div>
                </div>
              )}

              {booking.status === 'completed' && booking.proof_photo_url && (
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-start gap-4 mb-4">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="text-white font-bold text-lg">Delivery Proof</p>
                      <p className="text-gray-400 text-sm">Photo confirmation from charity</p>
                    </div>
                  </div>
                  <div className="bg-black rounded-lg overflow-hidden mb-4">
                    <img
                      src={booking.proof_photo_url}
                      alt="Delivery proof"
                      className="w-full h-auto"
                    />
                  </div>
                  <button
                    onClick={() => window.open(booking.proof_photo_url, '_blank')}
                    className="w-full bg-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition"
                  >
                    View Full Size
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-gray-600" />
              </div>
              <p className="text-gray-400">
                Your receipts will appear here after pickup
              </p>
            </div>
          )}
        </div>

        {/* CTAs */}
        <div className="space-y-4 mb-6">
          {booking.status === 'completed' ? (
            <button
              onClick={() => navigate('/book')}
              className="w-full bg-white text-black py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition shadow-lg"
            >
              Book Another Pickup
            </button>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition border border-gray-800"
            >
              Back to Home
            </button>
          )}

          <button
            onClick={() => setShowChat(!showChat)}
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition border border-gray-800 flex items-center justify-center gap-3"
          >
            <MessageCircle className="h-6 w-6" />
            {showChat ? 'Hide Chat' : 'Chat with Support'}
          </button>
        </div>

        {showChat && (
          <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            <BookingChat
              bookingId={id!}
              senderType="customer"
              senderName={booking.pickup_street_address.split(',')[0] || 'Customer'}
            />
          </div>
        )}
      </div>
    </div>
    </>
  );
}
