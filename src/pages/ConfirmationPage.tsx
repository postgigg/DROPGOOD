import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, Receipt, FileText } from 'lucide-react';
import SEO from '../components/SEO/SEO';
import { seoPages } from '../components/SEO/seoConfig';
import { supabase } from '../lib/supabase';
import confetti from 'canvas-confetti';
import DropGoodLogo from '../components/DropGoodLogo';

export default function ConfirmationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [receiptNumber, setReceiptNumber] = useState<string | null>(null);
  const [receiptType, setReceiptType] = useState<'tax_receipt' | 'donation_summary' | null>(null);
  const [forwardEmail, setForwardEmail] = useState<string | null>(null);
  const [generatingReceipt, setGeneratingReceipt] = useState(false);
  const [loading, setLoading] = useState(true);

  const formatTime = (militaryTime: string) => {
    if (!militaryTime) return '';
    const [hours, minutes] = militaryTime.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    if (id) {
      loadBooking();
      generateReceipt();
      saveToHistory(id);

      // 🎉 Subtle celebration confetti
      const celebrateWithConfetti = () => {
        const colors = ['#10b981', '#3b82f6', '#f59e0b'];

        // Single nice burst from the top
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.5 },
          colors: colors,
          ticks: 150
        });
      };

      // Trigger confetti after a brief delay
      setTimeout(celebrateWithConfetti, 400);
    }
  }, [id]);

  function saveToHistory(bookingId: string) {
    try {
      const historyStr = localStorage.getItem('dropgood_booking_history');
      const history = historyStr ? JSON.parse(historyStr) : [];

      const existingIndex = history.findIndex((b: any) => b.id === bookingId);
      if (existingIndex === -1) {
        history.unshift({
          id: bookingId,
          timestamp: Date.now(),
        });

        const maxHistory = 10;
        if (history.length > maxHistory) {
          history.splice(maxHistory);
        }

        localStorage.setItem('dropgood_booking_history', JSON.stringify(history));
      }
    } catch (error) {
      console.error('Error saving to history:', error);
    }
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
            zip_code
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

  async function generateReceipt() {
    try {
      setGeneratingReceipt(true);
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-receipt`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ booking_id: id }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReceiptNumber(data.receipt.receipt_number);
        setReceiptType(data.type);
        setForwardEmail(data.forward_to);
      }
    } catch (error) {
      console.error('Error generating receipt:', error);
    } finally {
      setGeneratingReceipt(false);
    }
  }

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

  return (
    <>
      <SEO {...seoPages.confirmation} />
      <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-green-600 to-green-700 pt-8 pb-32">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-white/90 hover:text-white mb-8 transition"
          >
            <DropGoodLogo size={24} className="mr-2" />
            <span className="font-semibold text-lg">DropGood</span>
          </button>

          <div className="text-center py-8">
            {/* Success Animation */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-6 animate-[bounce_1s_ease-in-out]">
              <CheckCircle className="h-16 w-16 text-green-600" strokeWidth={2.5} />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Pickup Scheduled
            </h1>
            <p className="text-white/90 text-lg md:text-xl font-medium">
              Your donation is on its way to making a difference
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-24">
        {/* Main Card */}
        <div className="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
          {/* Booking Details Card */}
          <div className="p-8 bg-gray-800 border-b border-gray-700">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Date & Time */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400 text-sm uppercase tracking-wide font-semibold">
                  <Calendar className="h-4 w-4" />
                  <span>Pickup Window</span>
                </div>
                <div className="text-white">
                  <p className="text-2xl font-bold">{new Date(booking.scheduled_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  <p className="text-lg text-gray-300">{formatTime(booking.scheduled_time_start)} - {formatTime(booking.scheduled_time_end)}</p>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400 text-sm uppercase tracking-wide font-semibold">
                  <Receipt className="h-4 w-4" />
                  <span>Total</span>
                </div>
                <div className="text-white">
                  <p className="text-3xl font-bold">${booking.total_price.toFixed(2)}</p>
                  <p className="text-sm text-gray-400">All fees included</p>
                </div>
              </div>
            </div>

            {/* Confirmation Number */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Confirmation Number</p>
              <p className="text-white font-mono text-lg mt-1">{booking.id}</p>
            </div>
          </div>

          {/* Journey */}
          <div className="p-8 space-y-6">
            {/* Pickup */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <div className="w-0.5 flex-1 bg-gray-700 min-h-[40px]"></div>
              </div>
              <div className="flex-1 pb-2">
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
          </div>

          {/* Tax Receipt Banner */}
          {receiptNumber && receiptType === 'tax_receipt' && (
            <div className="mx-8 mb-6 bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg mb-1">Tax Receipt Ready</h3>
                  <p className="text-white/90 text-sm">IRS-compliant 501(c)(3) donation receipt</p>
                </div>
                <button
                  onClick={() => navigate(`/receipt/${receiptNumber}`)}
                  className="bg-white text-green-600 px-6 py-2.5 rounded-full font-bold hover:bg-gray-100 transition shadow-lg"
                >
                  View
                </button>
              </div>
            </div>
          )}

          {receiptNumber && receiptType === 'donation_summary' && (
            <div className="mx-8 mb-6 bg-gradient-to-r from-amber-600 to-amber-700 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg mb-1">Donation Summary</h3>
                  {forwardEmail && (
                    <p className="text-white/90 text-sm">Forward to {forwardEmail} for tax receipt</p>
                  )}
                </div>
                <button
                  onClick={() => navigate(`/receipt/${receiptNumber}`)}
                  className="bg-white text-amber-600 px-6 py-2.5 rounded-full font-bold hover:bg-gray-100 transition shadow-lg"
                >
                  View
                </button>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="px-8 pb-8 border-b border-gray-700">
            <h3 className="text-xl font-bold text-white mb-6">What to Expect</h3>
            <div className="space-y-6">
              {[
                {
                  step: 1,
                  title: "Courier en route",
                  desc: "We'll text you 30 minutes before pickup",
                  time: "30 min before",
                },
                {
                  step: 2,
                  title: "Pickup",
                  desc: "Items collected during your scheduled window",
                  time: `${formatTime(booking.scheduled_time_start)} - ${formatTime(booking.scheduled_time_end)}`,
                },
                {
                  step: 3,
                  title: "In transit",
                  desc: `On the way to ${booking.donation_centers.name}`,
                  time: "Same day",
                },
                {
                  step: 4,
                  title: "Delivered",
                  desc: "You'll receive photo proof and confirmation",
                  time: "Same day",
                },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                      {item.step}
                    </div>
                    {idx < 3 && <div className="w-0.5 flex-1 bg-gray-700 my-2"></div>}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-baseline justify-between mb-1">
                      <p className="font-semibold text-white text-lg">{item.title}</p>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">{item.time}</span>
                    </div>
                    <p className="text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="p-8">
            <button
              onClick={() => navigate(`/track/${booking.id}`)}
              className="w-full bg-white text-black py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition shadow-lg flex items-center justify-center gap-3"
            >
              <DropGoodLogo size={24} />
              Track Your Pickup
            </button>
            <p className="text-center text-gray-500 text-sm mt-4">
              Real-time updates, receipts, and photo proof
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center py-12 space-y-4">
          <button
            onClick={() => navigate('/')}
            className="text-white text-lg font-semibold hover:text-gray-300 transition"
          >
            Book Another Pickup
          </button>
          <p className="text-gray-500 text-sm">
            Questions? <a href="mailto:support@dropgood.co" className="text-blue-400 hover:underline">support@dropgood.co</a>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
