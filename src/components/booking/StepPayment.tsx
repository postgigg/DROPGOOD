import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Lock, Building2 } from 'lucide-react';
import { supabase, type DonationCenter } from '../../lib/supabase';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, ExpressCheckoutElement, LinkAuthenticationElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { calculateFinalPriceWithSubsidies } from '../../lib/pricing';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface Props {
  pickupAddress: any;
  charity: DonationCenter & { pricing: any; distance_miles?: number; duration_minutes?: number };
  schedule: { date: string; timeStart: string; timeEnd: string };
  itemsTypes: string[];
  itemsCount: number;
  photos: string[];
  locationType: string;
  instructions: string;
  onBack: () => void;
}

export default function StepPayment({ pickupAddress, charity, schedule, itemsTypes, itemsCount, photos, locationType, instructions, onBack }: Props) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [contactMethod, setContactMethod] = useState<'both' | 'phone'>('both');
  const [driverTip, setDriverTip] = useState(4.00);
  const [customTip, setCustomTip] = useState('');
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [paymentReady, setPaymentReady] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const manualMode = import.meta.env.VITE_MANUAL_MODE === 'true';
  const stripeEnabled = !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

  // Load saved contact info on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('dropgood_last_email');
    const savedPhone = localStorage.getItem('dropgood_last_phone');

    if (savedEmail) setEmail(savedEmail);
    if (savedPhone) setPhone(savedPhone);
  }, []);

  // Save contact info for next time
  useEffect(() => {
    if (email) localStorage.setItem('dropgood_last_email', email);
    if (phone) localStorage.setItem('dropgood_last_phone', phone);
  }, [email, phone]);

  // Auto-initialize payment when component mounts and contact info is provided
  useEffect(() => {
    const shouldInitialize = stripeEnabled &&
                            !bookingId &&
                            !processing &&
                            !paymentError &&
                            !clientSecret &&
                            phone &&
                            (contactMethod === 'phone' || (contactMethod === 'both' && email));

    if (shouldInitialize) {
      // Small delay to ensure state is settled
      const timer = setTimeout(() => {
        initializePayment();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [phone, email, contactMethod]);

  const recalculatedPricing = (() => {
    // Use the new stacked subsidy pricing function
    const charitySubsidyPct = charity.pricing.charity_subsidy_percentage || 0;
    const companySubsidyPct = charity.pricing.company_subsidy_percentage || 0;
    const isRushDelivery = (charity.pricing.rush_fee || 0) > 0;

    return calculateFinalPriceWithSubsidies(
      charity.pricing.uber_cost,
      isRushDelivery,
      driverTip,
      charitySubsidyPct,
      companySubsidyPct
    );
  })();

  // Create booking and payment intent
  const initializePayment = async () => {
    // Validate required fields
    if (!phone || (contactMethod === 'both' && !email)) {
      setPaymentError('Please provide contact information');
      return;
    }

    setProcessing(true);
    setPaymentError(null);

    try {
      const newBookingId = `DG-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      console.log('Creating booking with ID:', newBookingId);

      // Calculate timeEnd if missing (add 2 hours to timeStart)
      let timeEnd = schedule.timeEnd;
      if (!timeEnd && schedule.timeStart) {
        const [hours, minutes] = schedule.timeStart.split(':');
        const endHour = (parseInt(hours) + 2).toString().padStart(2, '0');
        timeEnd = `${endHour}:${minutes}`;
      }

      const bookingData = {
        id: newBookingId,
        user_id: null, // Guest booking - no user account required
        donation_center_id: charity.id,
        pickup_street_address: pickupAddress.street,
        pickup_city: pickupAddress.city,
        pickup_state: pickupAddress.state,
        pickup_zip_code: pickupAddress.zip,
        pickup_latitude: pickupAddress.latitude,
        pickup_longitude: pickupAddress.longitude,
        pickup_instructions: instructions || '',
        pickup_location_type: locationType || 'front_door',
        dropoff_street_address: charity.street_address,
        dropoff_city: charity.city,
        dropoff_state: charity.state,
        dropoff_zip_code: charity.zip_code,
        dropoff_latitude: charity.latitude,
        dropoff_longitude: charity.longitude,
        distance_miles: charity.distance_miles || 5,
        duration_minutes: charity.duration_minutes || 15,
        scheduled_date: schedule.date,
        scheduled_time_start: schedule.timeStart,
        scheduled_time_end: timeEnd,
        items_count: itemsCount || 1,
        items_types: itemsTypes && itemsTypes.length > 0 ? itemsTypes : ['General Donation'],
        photo_urls: photos || [],
        uber_cost: recalculatedPricing.uber_cost,
        our_markup: recalculatedPricing.our_markup,
        driver_tip: recalculatedPricing.driver_tip || 0,
        rush_fee: recalculatedPricing.rush_fee || 0,
        subtotal: recalculatedPricing.subtotal,
        stripe_fee: recalculatedPricing.stripe_fee,
        total_price: recalculatedPricing.total_price,
        status: 'payment_pending',
        payment_status: 'pending',
        manual_mode: manualMode,
        customer_phone: phone,
        customer_email: contactMethod === 'both' ? email : null,
        // Charity subsidy fields
        sponsorship_id: charity.sponsorship?.id || null,
        charity_subsidy_amount: recalculatedPricing.charity_subsidy_amount || 0,
        charity_subsidy_percentage: recalculatedPricing.charity_subsidy_percentage || 0,
        // Company subsidy fields
        company_id: charity.company_benefit?.company_id || null,
        company_employee_id: charity.company_benefit?.employee_id || null,
        company_subsidy_amount: recalculatedPricing.company_subsidy_amount || 0,
        company_subsidy_percentage: recalculatedPricing.company_subsidy_percentage || 0,
        // Combined subsidy
        total_subsidy_amount: recalculatedPricing.total_subsidy_amount || 0,
        original_price: recalculatedPricing.subsidized ? recalculatedPricing.original_price : null,
      };

      console.log('Booking data:', bookingData);

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (error) {
        console.error('Booking insert error:', error);
        throw new Error(error.message || 'Failed to create booking');
      }

      console.log('Booking created successfully:', data);
      setBookingId(newBookingId);

      // If Stripe is enabled, create payment intent
      if (stripeEnabled) {
        console.log('Creating payment intent for amount:', recalculatedPricing.total_price);

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: Math.round(recalculatedPricing.total_price * 100), // Convert dollars to cents
              booking_id: newBookingId,
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Payment intent creation failed:', errorText);
          throw new Error('Failed to initialize payment. Please try again.');
        }

        const responseData = await response.json();
        console.log('Payment intent created:', responseData);

        setClientSecret(responseData.client_secret);
        setPaymentReady(true);
        setProcessing(false);
        return;
      }

      // Non-Stripe flow
      await completeBooking(newBookingId);
    } catch (error) {
      console.error('Error initializing payment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize payment';
      setPaymentError(errorMessage);
      setProcessing(false);
    }
  };

  const completeBooking = async (completedBookingId: string) => {
    try {
      console.log('🎉 Completing booking:', completedBookingId);

      // Update booking status
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'scheduled',
          payment_status: 'completed'
        })
        .eq('id', completedBookingId);

      if (updateError) {
        console.error('Failed to update booking status:', updateError);
        throw updateError;
      }

      console.log('✅ Booking status updated');

      // Deduct charity sponsorship credit if applicable
      if (charity.sponsorship && recalculatedPricing.charity_subsidy_amount > 0) {
        console.log('Deducting charity sponsorship credit...');
        const { error: deductError } = await supabase.rpc('deduct_sponsorship_credit', {
          p_sponsorship_id: charity.sponsorship.id,
          p_booking_id: completedBookingId,
          p_original_price: recalculatedPricing.original_price,
          p_subsidy_amount: recalculatedPricing.charity_subsidy_amount,
          p_customer_paid_amount: recalculatedPricing.total_price,
          p_subsidy_percentage: recalculatedPricing.charity_subsidy_percentage,
        });

        if (deductError) {
          console.error('Failed to deduct charity sponsorship credit:', deductError);
        } else {
          console.log('✅ Charity sponsorship credit deducted');
        }
      }

      // Deduct company subsidy credit if applicable
      if (charity.company_benefit && recalculatedPricing.company_subsidy_amount > 0) {
        console.log('Deducting company subsidy credit...');
        const { error: companyDeductError } = await supabase.rpc('deduct_company_subsidy', {
          p_company_id: charity.company_benefit.company_id,
          p_employee_id: charity.company_benefit.employee_id,
          p_booking_id: completedBookingId,
          p_original_price: recalculatedPricing.original_price,
          p_charity_subsidy_amount: recalculatedPricing.charity_subsidy_amount || 0,
          p_company_subsidy_amount: recalculatedPricing.company_subsidy_amount,
          p_customer_paid_amount: recalculatedPricing.total_price,
          p_charity_subsidy_percentage: recalculatedPricing.charity_subsidy_percentage || 0,
          p_company_subsidy_percentage: recalculatedPricing.company_subsidy_percentage,
        });

        if (companyDeductError) {
          console.error('Failed to deduct company subsidy:', companyDeductError);
          // Don't fail the booking if company deduction fails - just log it
        } else {
          console.log('✅ Company subsidy credit deducted');
        }
      }

      // Send confirmation SMS with tracking link
      try {
        const trackingUrl = `${window.location.origin}/track/${completedBookingId}`;
        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-notification`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'sms',
              to: phone,
              template: 'booking_confirmation',
              data: {
                booking_id: completedBookingId,
                tracking_url: trackingUrl,
                scheduled_date: schedule.date,
                scheduled_time: schedule.timeStart,
                donation_center_name: charity.name,
              },
            }),
          }
        );
      } catch (err) {
        console.error('Failed to send confirmation SMS:', err);
      }

      if (manualMode) {
        try {
          const adminEmail = import.meta.env.VITE_ADMIN_NOTIFICATION_EMAIL;
          if (adminEmail) {
            await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-admin`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  booking_id: completedBookingId,
                  customer_name: pickupAddress.street.split(',')[0],
                  customer_phone: phone,
                  customer_email: contactMethod === 'both' ? email : null,
                  pickup_address: `${pickupAddress.street}, ${pickupAddress.city}, ${pickupAddress.state} ${pickupAddress.zip}`,
                  donation_center_name: charity.name,
                  scheduled_date: schedule.date,
                  scheduled_time: schedule.timeStart,
                  total_price: recalculatedPricing.total_price,
                  items_description: itemsTypes.join(', '),
                }),
              }
            );
          }
        } catch (err) {
          console.error('Failed to notify admin:', err);
        }
      }

      console.log('🚀 Navigating to confirmation page:', `/confirmation/${completedBookingId}`);
      navigate(`/confirmation/${completedBookingId}`);
    } catch (error) {
      console.error('❌ Error completing booking:', error);
      setPaymentError(error instanceof Error ? error.message : 'Failed to complete booking');
      setProcessing(false);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Review Your Pickup</h2>
        <p className="text-gray-400 text-sm">Please verify all details before completing your booking</p>
      </div>

      {/* Desktop: 2 Column Layout, Mobile/Tablet: Single Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN - Journey & Details */}
        <div className="space-y-6">
          {/* Point-to-Point Journey Card */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        {/* Pickup Location */}
        <div className="p-5 border-b border-gray-700">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mt-1"></div>
              <div className="w-0.5 h-full bg-gray-600 min-h-[60px]"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-white text-sm">Pickup</h3>
                <span className="text-xs text-gray-500">{schedule.date} • {schedule.timeStart}-{schedule.timeEnd}</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {pickupAddress.street}<br/>
                {pickupAddress.city}, {pickupAddress.state} {pickupAddress.zip}
              </p>
              {instructions && (
                <p className="text-xs text-gray-500 mt-2 flex items-start gap-1">
                  <span>📍</span>
                  <span>{instructions}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Items Being Donated */}
        <div className="p-5 border-b border-gray-700 bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">📦</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm mb-0.5">~{itemsCount} bags/boxes</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{itemsTypes.join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Dropoff Location */}
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm mb-1">Dropoff</h3>
              <p className="text-green-400 font-medium text-sm mb-1">{charity.name}</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                {charity.street_address}<br/>
                {charity.city}, {charity.state}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                📍 {charity.distance_miles?.toFixed(1)} miles from pickup
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Receipt Info */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
        <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
          <span>📄</span>
          Tax Receipt
        </h3>
        {charity.can_auto_issue_receipts ? (
          <div className="bg-green-900/20 border border-green-700/40 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-green-400 text-lg">✓</span>
              </div>
              <div className="flex-1">
                <p className="text-green-400 font-semibold text-sm mb-1">Automatic Tax Receipt</p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  You'll receive an IRS-compliant tax receipt via email automatically after your donation is delivered.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-900/20 border border-amber-700/40 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-amber-400 text-lg">📧</span>
              </div>
              <div className="flex-1">
                <p className="text-amber-400 font-semibold text-sm mb-1">Manual Tax Receipt</p>
                <p className="text-gray-400 text-xs leading-relaxed mb-2">
                  You'll receive a donation summary via email. Forward it to get your official tax receipt.
                </p>
                <div className="bg-gray-900/50 rounded px-3 py-2 border border-amber-700/30">
                  <p className="text-xs text-gray-500">Forward summary to:</p>
                  <p className="text-amber-300 font-medium text-sm">{charity.receipt_email || charity.email}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
        </div>

        {/* RIGHT COLUMN - Payment & Contact */}
        <div className="space-y-6">
      {/* Price Breakdown */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">💰</span>
          <h3 className="font-semibold text-white text-sm">Price Breakdown</h3>
        </div>

        {manualMode && (
          <div className="mb-4 p-3 bg-orange-900/20 border border-orange-700/40 rounded-lg">
            <p className="text-xs text-orange-300">
              📋 Estimated pricing - Final cost based on actual delivery
            </p>
          </div>
        )}

        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">{manualMode ? 'Pickup & Delivery' : 'Uber Direct delivery'}</span>
            <span className="text-white font-medium">${recalculatedPricing.uber_cost.toFixed(2)}</span>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Service fee</span>
              <span className="text-white font-medium">${(recalculatedPricing.our_markup + recalculatedPricing.stripe_fee).toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Platform operations, support & payment processing</p>
          </div>

          {recalculatedPricing.rush_fee > 0 && (
            <div className="flex justify-between items-center bg-yellow-900/20 border border-yellow-700/40 rounded-lg px-3 py-2 -mx-2">
              <span className="text-yellow-400 font-medium">Rush fee (same-day)</span>
              <span className="text-yellow-400 font-semibold">${recalculatedPricing.rush_fee.toFixed(2)}</span>
            </div>
          )}

          {driverTip > 0 && (
            <div className="flex justify-between items-center bg-green-900/20 border border-green-700/40 rounded-lg px-3 py-2 -mx-2">
              <span className="text-green-400 font-medium">Driver tip</span>
              <span className="text-green-400 font-semibold">${recalculatedPricing.driver_tip.toFixed(2)}</span>
            </div>
          )}

          {/* Subsidies Section */}
          {(recalculatedPricing.charity_subsidy_amount > 0 || recalculatedPricing.company_subsidy_amount > 0) && (
            <>
              <div className="border-t border-gray-700 pt-3 mt-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Subtotal before subsidies</span>
                  <span className="text-gray-300 font-medium">${recalculatedPricing.original_price.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Subsidies apply to delivery, not tips</p>
              </div>

              {/* Charity Subsidy */}
              {recalculatedPricing.charity_subsidy_amount > 0 && (
                <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg px-4 py-3 -mx-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-blue-400 font-semibold">💙 Charity Sponsorship</span>
                    <span className="text-blue-400 font-bold text-base">-${recalculatedPricing.charity_subsidy_amount.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-blue-300/70 leading-relaxed">
                    {charity.name} covers {recalculatedPricing.charity_subsidy_percentage}% to make donating easier
                  </p>
                </div>
              )}

              {/* Company Subsidy */}
              {recalculatedPricing.company_subsidy_amount > 0 && (
                <div className="bg-green-900/20 border border-green-700/40 rounded-lg px-4 py-3 -mx-2">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-green-400" />
                      <span className="text-green-400 font-semibold">Company Benefit</span>
                    </div>
                    <span className="text-green-400 font-bold text-base">-${recalculatedPricing.company_subsidy_amount.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-green-300/70 leading-relaxed">
                    {charity.company_benefit?.company_name} covers {recalculatedPricing.company_subsidy_percentage}% as an employee wellness benefit
                  </p>
                </div>
              )}

              {/* Total Savings (if both subsidies) */}
              {recalculatedPricing.charity_subsidy_amount > 0 && recalculatedPricing.company_subsidy_amount > 0 && (
                <div className="bg-purple-900/20 border border-purple-700/40 rounded-lg px-4 py-3 -mx-2">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-400 font-bold">⚡ Total Stacked Savings</span>
                    <span className="text-purple-400 font-bold text-lg">-${recalculatedPricing.total_subsidy_amount.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-purple-300/70 mt-1">
                    Combined discount = {((recalculatedPricing.total_subsidy_amount / recalculatedPricing.original_price) * 100).toFixed(0)}% off!
                  </p>
                </div>
              )}
            </>
          )}

          <div className="border-t border-gray-700 pt-3 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-white font-bold text-base">Total</span>
              <span className="text-white font-bold text-xl">${recalculatedPricing.total_price.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

          {/* Driver Tip Section */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">💵</span>
          <h3 className="font-semibold text-white text-sm">Add a Tip for Your Driver</h3>
        </div>
        <p className="text-xs text-gray-400 mb-4">100% goes directly to the driver</p>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { value: 0, label: 'No Tip' },
            { value: 2, label: '$2' },
            { value: 4, label: '$4' },
            { value: 6, label: '$6' }
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => { setDriverTip(option.value); setCustomTip(''); }}
              className={`px-3 py-2.5 rounded-lg font-medium text-sm transition ${
                driverTip === option.value
                  ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">
            Custom amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="number"
              value={customTip}
              onChange={(e) => {
                setCustomTip(e.target.value);
                const amount = parseFloat(e.target.value);
                if (!isNaN(amount) && amount >= 0) {
                  setDriverTip(amount);
                }
              }}
              className="w-full pl-8 pr-4 py-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">📱</span>
          <h3 className="font-semibold text-white text-sm">Contact Information</h3>
        </div>

        <div className="space-y-4">
          {/* Receipt Delivery Method - FIRST */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-3">
              Receipt delivery method
            </label>
            <div className="space-y-2">
              <label className={`flex items-center p-3.5 border rounded-lg cursor-pointer transition ${
                contactMethod === 'both'
                  ? 'border-blue-500 bg-blue-900/20'
                  : 'border-gray-700 hover:border-gray-600 hover:bg-gray-750'
              }`}>
                <input
                  type="radio"
                  name="contact-method"
                  value="both"
                  checked={contactMethod === 'both'}
                  onChange={(e) => setContactMethod(e.target.value as 'both')}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="ml-3 flex-1">
                  <div className="text-white text-sm font-medium">Email + SMS</div>
                  <div className="text-xs text-gray-400 mt-0.5">Recommended - Receipt via email</div>
                </div>
              </label>
              <label className={`flex items-center p-3.5 border rounded-lg cursor-pointer transition ${
                contactMethod === 'phone'
                  ? 'border-blue-500 bg-blue-900/20'
                  : 'border-gray-700 hover:border-gray-600 hover:bg-gray-750'
              }`}>
                <input
                  type="radio"
                  name="contact-method"
                  value="phone"
                  checked={contactMethod === 'phone'}
                  onChange={(e) => setContactMethod(e.target.value as 'phone')}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="ml-3 flex-1">
                  <div className="text-white text-sm font-medium">SMS only</div>
                  <div className="text-xs text-gray-400 mt-0.5">Tracking link with receipt</div>
                </div>
              </label>
            </div>
          </div>

          {/* Phone Number - Always visible */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Phone number (required for SMS updates)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 0) {
                  if (value.length <= 3) {
                    value = `(${value}`;
                  } else if (value.length <= 6) {
                    value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
                  } else {
                    value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
                  }
                }
                setPhone(value);
              }}
              onBlur={(e) => {
                // Validate phone number format
                const cleaned = phone.replace(/\D/g, '');
                if (cleaned.length > 0 && cleaned.length !== 10) {
                  e.target.setCustomValidity('Please enter a valid 10-digit phone number');
                } else {
                  e.target.setCustomValidity('');
                }
              }}
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="(555) 123-4567"
              maxLength={14}
              required
            />
          </div>

          {/* Email Input - Only shown if Email + SMS selected */}
          {contactMethod === 'both' && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Email for receipt
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="your@email.com"
                required
              />
            </div>
          )}
        </div>
      </div>

          {/* Security Notice */}
          <div className="bg-blue-900/10 border border-blue-700/30 rounded-xl p-4">
            <div className="flex items-center gap-2 text-blue-300 text-sm">
              <Lock className="h-4 w-4 flex-shrink-0" />
              <span>Secure payment processing. Your information is encrypted and safe.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {paymentError && (
        <div className="bg-red-900/20 border-2 border-red-700 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <span className="text-red-400 text-xl">⚠️</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-red-400 mb-2">Payment Error</h3>
              <p className="text-sm text-gray-300 mb-3">{paymentError}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentError(null);
                    setBookingId(null);
                    setClientSecret(null);
                    setPaymentReady(false);
                    setProcessing(false);
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Error Display */}
      {paymentError && (
        <div className="bg-red-900/20 border border-red-700 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-red-400 font-semibold">Payment Error</h3>
              <p className="text-red-300 text-sm mt-1">{paymentError}</p>
              <button
                type="button"
                onClick={() => {
                  setPaymentError(null);
                  setBookingId(null);
                  setClientSecret(null);
                  setPaymentReady(false);
                }}
                className="mt-3 text-sm text-red-400 hover:text-red-300 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Section - ALWAYS SHOW CARD INPUT */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="h-5 w-5 text-blue-400" />
          <h3 className="font-semibold text-white">Payment Information</h3>
        </div>

        {stripeEnabled && paymentReady && clientSecret && bookingId ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'night',
                variables: {
                  colorPrimary: '#3b82f6',
                  colorBackground: '#111827',
                  colorText: '#ffffff',
                  colorDanger: '#ef4444',
                  fontFamily: 'system-ui, sans-serif',
                  spacingUnit: '4px',
                  borderRadius: '12px',
                  fontSizeBase: '18px',
                },
                rules: {
                  '.Input': {
                    border: '2px solid #4b5563',
                    boxShadow: 'none !important',
                    backgroundColor: '#111827',
                    padding: '16px 20px',
                    fontSize: '18px',
                  },
                  '.Input:focus': {
                    border: '2px solid #3b82f6',
                    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.2) !important',
                    outline: 'none',
                  },
                  '.Input:hover': {
                    boxShadow: 'none !important',
                  },
                  '.Tab': {
                    border: '1px solid #ffffff',
                    boxShadow: 'none !important',
                    padding: '10px 12px',
                  },
                  '.Tab:hover': {
                    border: '1px solid #ffffff',
                    boxShadow: 'none !important',
                  },
                  '.Tab--selected': {
                    border: '1px solid #3b82f6',
                    boxShadow: 'none !important',
                  },
                  '.Tab--selected:focus': {
                    boxShadow: 'none !important',
                  },
                  '.Label': {
                    color: '#d1d5db',
                    fontSize: '16px',
                    fontWeight: '600',
                    marginBottom: '10px',
                  },
                  '.Block': {
                    boxShadow: 'none !important',
                  },
                  '.PickerItem': {
                    boxShadow: 'none !important',
                  },
                  '.PickerItem--selected': {
                    boxShadow: 'none !important',
                  },
                },
              },
            }}
          >
            <PaymentForm
              amount={recalculatedPricing.total_price}
              bookingId={bookingId}
              onBack={onBack}
              onSuccess={() => completeBooking(bookingId)}
              processing={processing}
              setProcessing={setProcessing}
              paymentError={paymentError}
              setPaymentError={setPaymentError}
            />
          </Elements>
        ) : processing ? (
          /* Loading Payment Form */
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-white font-semibold mb-2">Setting up secure payment...</p>
            <p className="text-gray-400 text-sm">Please wait while we prepare your payment form</p>
          </div>
        ) : (
          /* Waiting for contact info */
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-blue-900/20 border border-blue-700 rounded-full p-4 mb-4">
              <CreditCard className="h-8 w-8 text-blue-400" />
            </div>
            <p className="text-white font-semibold mb-2">Complete contact information above</p>
            <p className="text-gray-400 text-sm">Payment form will appear once contact details are provided</p>
          </div>
        )}
      </div>

      {/* Back Button - Only show when payment form isn't ready */}
      {(!stripeEnabled || !paymentReady) && !processing && (
        <div className="flex justify-start">
          <button
            type="button"
            onClick={onBack}
            className="bg-gray-700 text-gray-200 px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition text-base"
          >
            Back
          </button>
        </div>
      )}

      {/* Cancellation Policy */}
      <div className="text-center">
        <p className="text-xs text-gray-400">
          Free cancellation up to 2 hours before pickup
        </p>
      </div>
    </div>
  );
}

interface PaymentFormProps {
  amount: number;
  bookingId: string;
  onBack: () => void;
  onSuccess: () => Promise<void>;
  processing: boolean;
  setProcessing: (processing: boolean) => void;
  paymentError: string | null;
  setPaymentError: (error: string | null) => void;
}

function PaymentForm({ amount, bookingId, onBack, onSuccess, processing, setProcessing, paymentError, setPaymentError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      console.error('Stripe not loaded');
      return;
    }

    console.log('💳 Processing payment for booking:', bookingId);
    setProcessing(true);
    setPaymentError(null);

    try {
      console.log('Confirming payment with Stripe...');
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        console.error('Stripe payment error:', error);
        throw new Error(error.message);
      }

      console.log('Payment intent:', paymentIntent);

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('✅ Payment succeeded! Updating booking...');
        // Update booking with payment info
        const { error: updateError } = await supabase
          .from('bookings')
          .update({
            stripe_payment_intent_id: paymentIntent.id,
            payment_status: 'completed',
          })
          .eq('id', bookingId);

        if (updateError) {
          console.error('Failed to update booking with payment ID:', updateError);
        }

        console.log('Calling onSuccess callback...');
        // Complete the booking flow
        await onSuccess();
        console.log('✅ onSuccess completed');
      } else {
        throw new Error('Payment not completed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Payment failed. Please try again.';

      // Update booking status to failed
      try {
        await supabase
          .from('bookings')
          .update({ payment_status: 'failed' })
          .eq('id', bookingId);
      } catch (updateError) {
        console.error('Failed to update booking status:', updateError);
      }

      // Show error message
      setPaymentError(errorMsg);
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePaymentSubmit} className="space-y-6">
      {/* Apple Pay / Google Pay / Link - Express Checkout */}
      {/* Note: Apple Pay and Google Pay require HTTPS. Deploy to production to enable. */}
      <div className="mb-6">
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3 mb-4 text-sm text-blue-200">
          💡 <strong>Apple Pay & Google Pay available on production</strong> - Currently on localhost (HTTP). Deploy to HTTPS domain to enable express checkout options.
        </div>
      </div>

      {/* Regular Card Payment */}
      <PaymentElement />

      {paymentError && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
          <p className="text-red-400 font-semibold">Payment Failed</p>
          <p className="text-red-300 text-sm mt-1">{paymentError}</p>
        </div>
      )}

      {/* Terms Agreement */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:ring-offset-gray-800 cursor-pointer"
          />
          <span className="text-sm text-gray-300 group-hover:text-white transition">
            I agree to the{' '}
            <Link
              to="/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
              onClick={(e) => e.stopPropagation()}
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              to="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
              onClick={(e) => e.stopPropagation()}
            >
              Privacy Policy
            </Link>
          </span>
        </label>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onBack}
          className="sm:flex-1 bg-gray-700 text-gray-200 py-3.5 rounded-xl font-semibold hover:bg-gray-600 transition disabled:opacity-50 text-base"
          disabled={processing}
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!stripe || processing || !agreedToTerms}
          className="sm:flex-1 bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center text-base shadow-lg shadow-blue-900/30"
        >
          {processing ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Processing Payment...
            </span>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Pay ${amount.toFixed(2)}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
