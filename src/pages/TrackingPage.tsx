import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, User, Phone, CheckCircle, FileText, MessageCircle, Package, Loader2, XCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

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
            state,
            is_partner,
            can_auto_issue_receipts
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

  const formatTime = (militaryTime: string) => {
    if (!militaryTime) return '';
    const [hours, minutes] = militaryTime.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
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

  const canCancel = () => {
    // Can only cancel if not completed or already cancelled
    if (!booking) return false;
    return booking.status !== 'completed' && booking.status !== 'cancelled';
  };

  const getRefundEligibility = () => {
    if (!booking || !booking.scheduled_date || !booking.scheduled_time_start) return { eligible: false, hoursUntil: 0 };

    const scheduledDateTime = new Date(`${booking.scheduled_date}T${booking.scheduled_time_start}`);
    const now = new Date();
    const hoursUntil = (scheduledDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    return {
      eligible: hoursUntil >= 2,
      hoursUntil: Math.max(0, hoursUntil)
    };
  };

  const handleCancelBooking = async () => {
    setCancelling(true);
    try {
      const refundInfo = getRefundEligibility();

      // Update booking status to cancelled
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // If eligible for refund and payment was made, process refund
      if (refundInfo.eligible && booking.stripe_payment_intent_id && booking.payment_status === 'completed') {
        console.log('Processing automatic refund for payment intent:', booking.stripe_payment_intent_id);

        try {
          // Call Stripe refund API via Edge Function
          const refundResponse = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/refund-payment`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                payment_intent_id: booking.stripe_payment_intent_id,
                reason: 'requested_by_customer'
              }),
            }
          );

          const refundData = await refundResponse.json();

          if (refundData.success) {
            console.log('✅ Refund successful:', refundData.refund_id);

            // Update booking with refund info
            await supabase
              .from('bookings')
              .update({
                payment_status: 'refunded',
                stripe_refund_id: refundData.refund_id
              })
              .eq('id', id);
          } else {
            console.error('Refund failed:', refundData.error);
            // Still mark as refund pending so admin can manually process
            await supabase
              .from('bookings')
              .update({ payment_status: 'refund_pending' })
              .eq('id', id);
          }
        } catch (refundError) {
          console.error('Error processing refund:', refundError);
          // Mark as refund pending so admin can manually process
          await supabase
            .from('bookings')
            .update({ payment_status: 'refund_pending' })
            .eq('id', id);
        }
      }

      // Reload booking to show updated status
      await loadBooking();
      setShowCancelModal(false);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking. Please contact support.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-6" />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white text-lg font-semibold"
          >
            Loading your tracking details...
          </motion.p>
        </motion.div>
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
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50"
      >
        <div className="max-w-5xl mx-auto px-4 py-6">
          <motion.button
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center text-white/70 hover:text-white transition mb-4"
          >
            <DropGoodLogo size={20} className="mr-2" />
            <span className="font-semibold">DropGood</span>
          </motion.button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Track Pickup
            </h1>
            <p className="text-gray-400 font-mono text-sm">#{booking.id}</p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl border border-gray-800"
        >
          {/* Status Banner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 p-8 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
            <div className="relative z-10">
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-200 rounded-full animate-pulse" />
                Current Status
              </p>
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">
                {getStatusText(booking.status)}
              </h2>
              {booking.status === 'completed' && booking.delivered_at && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-blue-100 mt-3 font-medium"
                >
                  ✓ Delivered at {new Date(booking.delivered_at).toLocaleTimeString()}
                </motion.p>
              )}
            </div>
          </motion.div>

          {/* Timeline */}
          <div className="p-10">
            <div className="space-y-6">
              {[
                { status: 'scheduled', icon: Clock, label: 'Scheduled', desc: 'Pickup window confirmed', color: 'blue' },
                { status: 'driver_assigned', icon: User, label: 'Courier Assigned', desc: 'Driver matched and notified', color: 'purple' },
                { status: 'picked_up', icon: Package, label: 'Picked Up', desc: 'Items collected from your location', color: 'orange' },
                { status: 'completed', icon: CheckCircle, label: 'Delivered', desc: 'Donation complete', color: 'green' }
              ].map((step, idx) => {
                const StepIcon = step.icon;
                const steps = ['scheduled', 'driver_assigned', 'picked_up', 'completed'];
                const stepIndex = steps.indexOf(booking.status);
                const isActive = idx <= stepIndex;
                const isCurrent = idx === stepIndex;

                const colorClasses = {
                  blue: 'from-blue-600 to-blue-700',
                  purple: 'from-purple-600 to-purple-700',
                  orange: 'from-orange-500 to-orange-600',
                  green: 'from-green-600 to-green-700'
                };

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="flex gap-5"
                  >
                    <div className="flex flex-col items-center">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center relative ${
                          isActive
                            ? `bg-gradient-to-br ${colorClasses[step.color as keyof typeof colorClasses]} shadow-lg`
                            : 'bg-gray-800 text-gray-600'
                        } ${isCurrent ? 'ring-4 ring-offset-2 ring-offset-gray-900' : ''}`}
                        style={isCurrent ? { ringColor: 'rgba(59, 130, 246, 0.3)' } : {}}
                      >
                        <StepIcon className={`h-6 w-6 ${isActive ? 'text-white' : 'text-gray-600'}`} strokeWidth={2.5} />
                        {isCurrent && (
                          <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 rounded-full bg-blue-500/20"
                          />
                        )}
                      </motion.div>
                      {idx < 3 && (
                        <motion.div
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: isActive ? 1 : 0.3 }}
                          transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
                          className={`w-1 flex-1 my-2 min-h-[50px] rounded-full origin-top ${
                            isActive ? `bg-gradient-to-b ${colorClasses[step.color as keyof typeof colorClasses]}` : 'bg-gray-800'
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className={`font-bold text-xl mb-1 ${
                        isActive ? 'text-white' : 'text-gray-600'
                      }`}>
                        {step.label}
                        {isCurrent && <span className="ml-2 text-blue-400 text-sm">• In Progress</span>}
                        {isActive && !isCurrent && <span className="ml-2 text-green-400 text-sm">✓</span>}
                      </p>
                      <p className={`text-sm ${
                        isActive ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {step.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </motion.div>

        {/* Driver Info */}
        {booking.driver_name && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-700"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <User className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Your Courier</p>
                <p className="text-white font-bold text-2xl mb-1">{booking.driver_name}</p>
                <p className="text-gray-400">{booking.driver_vehicle}</p>
                {booking.driver_rating && (
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-yellow-400 font-semibold">{booking.driver_rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              {booking.driver_phone && (
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={`tel:${booking.driver_phone}`}
                  className="bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition flex items-center gap-3 shadow-lg"
                >
                  <Phone className="h-5 w-5" />
                  <span className="hidden sm:inline">Call</span>
                </motion.a>
              )}
            </div>
          </motion.div>
        )}

        {/* Journey Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gray-900/80 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-gray-800"
        >
          <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <MapPin className="h-6 w-6 text-blue-500" />
            Route Details
          </h3>
          <div className="space-y-8">
            {/* Pickup */}
            <div className="flex gap-5">
              <div className="flex flex-col items-center pt-1">
                <div className="w-4 h-4 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></div>
                <div className="w-1 flex-1 bg-gradient-to-b from-blue-500 to-green-500 min-h-[60px] rounded-full"></div>
              </div>
              <div className="flex-1 bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                <p className="text-xs text-blue-400 uppercase tracking-widest font-bold mb-3">Pickup Location</p>
                <p className="text-white font-bold text-xl mb-2">{booking.pickup_street_address}</p>
                <p className="text-gray-400 text-lg">{booking.pickup_city}, {booking.pickup_state}</p>
              </div>
            </div>

            {/* Dropoff */}
            <div className="flex gap-5">
              <div className="flex flex-col items-center pt-1">
                <div className="w-4 h-4 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
              </div>
              <div className="flex-1 bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                <p className="text-xs text-green-400 uppercase tracking-widest font-bold mb-3">Drop-off Location</p>
                <p className="text-white font-bold text-xl mb-2">{booking.donation_centers.name}</p>
                <p className="text-gray-400 text-lg">{booking.donation_centers.street_address}</p>
                <p className="text-gray-400 text-lg">{booking.donation_centers.city}, {booking.donation_centers.state}</p>
              </div>
            </div>

            {/* Scheduled Time */}
            <div className="pt-6 border-t border-gray-800">
              <div className="flex items-center gap-4 bg-gray-800/50 rounded-2xl p-5 border border-gray-700">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Pickup Window</p>
                  <p className="text-white font-bold text-lg">
                    {new Date(booking.scheduled_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {formatTime(booking.scheduled_time_start)}{booking.scheduled_time_end && ` - ${formatTime(booking.scheduled_time_end)}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

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
                      <p className="text-white font-bold text-lg">
                        {booking.donation_centers?.is_partner || booking.donation_centers?.can_auto_issue_receipts
                          ? 'Tax Receipt'
                          : 'Tax Summary'}
                      </p>
                      <p className="text-white/90 text-sm">
                        {booking.donation_centers?.is_partner || booking.donation_centers?.can_auto_issue_receipts
                          ? 'IRS-compliant 501(c)(3) receipt'
                          : 'Donation summary for your records'}
                      </p>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="space-y-4"
        >
          {booking.status === 'completed' ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/book')}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-5 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition shadow-2xl shadow-blue-500/30"
            >
              Book Another Pickup
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/')}
              className="w-full bg-gray-800 text-white py-5 rounded-2xl font-bold text-lg hover:bg-gray-700 transition border-2 border-gray-700"
            >
              Back to Home
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowChat(!showChat)}
            className="w-full bg-gray-800 text-white py-5 rounded-2xl font-bold text-lg hover:bg-gray-700 transition border-2 border-gray-700 flex items-center justify-center gap-3"
          >
            <MessageCircle className="h-6 w-6" />
            {showChat ? 'Hide Chat' : 'Chat with Support'}
          </motion.button>

          {/* Cancel Button */}
          {canCancel() && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCancelModal(true)}
              className="w-full bg-red-900/20 text-red-400 py-4 rounded-2xl font-semibold text-base hover:bg-red-900/30 transition border-2 border-red-800 flex items-center justify-center gap-2"
            >
              <XCircle className="h-5 w-5" />
              Cancel Booking
            </motion.button>
          )}
        </motion.div>

        {/* Cancel Modal */}
        <AnimatePresence>
          {showCancelModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => !cancelling && setShowCancelModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-900 rounded-3xl p-8 max-w-md w-full border-2 border-gray-800 shadow-2xl"
              >
                {(() => {
                  const refundInfo = getRefundEligibility();
                  return (
                    <>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-red-900/30 rounded-full flex items-center justify-center">
                          <AlertTriangle className="h-7 w-7 text-red-400" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white">Cancel Booking?</h3>
                          <p className="text-gray-400 text-sm">#{booking.id}</p>
                        </div>
                      </div>

                      {refundInfo.eligible ? (
                        <div className="bg-green-900/20 border border-green-800 rounded-2xl p-5 mb-6">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-green-400 font-bold text-lg mb-1">Automatic Full Refund</p>
                              <p className="text-green-300 text-sm">
                                You're cancelling more than 2 hours before pickup. We'll automatically process a full refund of <strong>${booking.total_price?.toFixed(2)}</strong> to your original payment method within 5-7 business days.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-red-900/20 border border-red-800 rounded-2xl p-5 mb-6">
                          <div className="flex items-start gap-3">
                            <XCircle className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-red-400 font-bold text-lg mb-1">No Refund</p>
                              <p className="text-red-300 text-sm">
                                Cancellations within 2 hours of pickup are not eligible for refunds. Your payment of <strong>${booking.total_price?.toFixed(2)}</strong> will not be refunded.
                              </p>
                              {refundInfo.hoursUntil > 0 && (
                                <p className="text-red-300 text-xs mt-2">
                                  Time until pickup: {refundInfo.hoursUntil.toFixed(1)} hours
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <p className="text-gray-400 text-sm mb-6">
                        Are you sure you want to cancel this booking? This action cannot be undone.
                      </p>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowCancelModal(false)}
                          disabled={cancelling}
                          className="flex-1 bg-gray-800 text-white py-4 rounded-xl font-bold hover:bg-gray-700 transition disabled:opacity-50"
                        >
                          Keep Booking
                        </button>
                        <button
                          onClick={handleCancelBooking}
                          disabled={cancelling}
                          className="flex-1 bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {cancelling ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Cancelling...
                            </>
                          ) : (
                            'Yes, Cancel'
                          )}
                        </button>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
