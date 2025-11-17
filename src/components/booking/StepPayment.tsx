import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Lock, Building2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { supabase, type DonationCenter } from '../../lib/supabase';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, ExpressCheckoutElement, LinkAuthenticationElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { calculateFinalPriceWithSubsidies, INACTIVE_CHARITY_SERVICE_FEE, DEFAULT_SERVICE_FEE } from '../../lib/pricing';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface Props {
  pickupAddress: any;
  charity: DonationCenter & { pricing: any; distance_miles?: number; duration_minutes?: number };
  schedule: { date: string; timeStart: string; timeEnd: string; pricing?: any };
  itemsTypes: string[];
  itemsCount: number;
  bagsCount?: number;
  boxesCount?: number;
  photos: string[];
  locationType: string;
  instructions: string;
  onBack: () => void;
}

export default function StepPayment({ pickupAddress, charity, schedule, itemsTypes, itemsCount, bagsCount = 0, boxesCount = 0, photos, locationType, instructions, onBack }: Props) {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [contactMethod, setContactMethod] = useState<'both' | 'phone'>('both');
  const [driverTip, setDriverTip] = useState(0); // Optional tip (no minimum required)
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

  // Auto-initialize payment when component mounts
  useEffect(() => {
    const shouldInitialize = stripeEnabled &&
                            !bookingId &&
                            !processing &&
                            !paymentError &&
                            !clientSecret;

    if (shouldInitialize) {
      // Small delay to ensure state is settled
      const timer = setTimeout(() => {
        initializePayment();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []); // Only run once on mount

  // Use pricing from Step 4 (schedule), only adjust for tip changes
  const recalculatedPricing = useMemo(() => {
    // Use the final pricing calculated in Step 4 (includes all discounts)
    const basePricing = schedule.pricing || charity.pricing;

    // If user added a tip, adjust the pricing
    if (driverTip > 0) {
      // Calculate tip with Stripe fees
      const tipWithStripeFee = (driverTip + 0.30) / 0.971;
      const stripeFeeOnTip = tipWithStripeFee - driverTip;

      return {
        ...basePricing,
        driver_tip: driverTip,
        total_driver_tip: (basePricing.total_driver_tip || 0) + driverTip,
        subtotal: basePricing.subtotal + driverTip,
        stripe_fee: basePricing.stripe_fee + stripeFeeOnTip,
        total_price: basePricing.total_price + tipWithStripeFee
      };
    }

    // No tip - use Step 4's pricing exactly as calculated
    return basePricing;
  }, [driverTip, schedule.pricing, charity.pricing]);

  // Create booking and payment intent
  const initializePayment = async () => {
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
        bags_count: bagsCount || 0,
        boxes_count: boxesCount || 0,
        photo_urls: photos || [],
        uber_cost: recalculatedPricing.uber_cost,
        our_markup: recalculatedPricing.our_markup || 0,
        driver_tip: recalculatedPricing.driver_tip || 0,
        rush_fee: recalculatedPricing.rush_fee || 0,
        subtotal: recalculatedPricing.subtotal,
        stripe_fee: recalculatedPricing.stripe_fee,
        total_price: recalculatedPricing.total_price,
        status: 'payment_pending',
        payment_status: 'pending',
        manual_mode: manualMode,
        customer_first_name: firstName || '',
        customer_last_name: lastName || '',
        customer_phone: phone || '',
        customer_email: contactMethod === 'both' ? (email || '') : null,
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
        // Uber Direct quote_id (if available)
        uber_quote_id: recalculatedPricing.uber_quote_id || null,
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

  const createRoadieShipment = async (completedBookingId: string) => {
    try {
      console.log('🚗 Creating Roadie shipment for booking:', completedBookingId);

      // Format pickup datetime (scheduled_date + scheduled_time_start)
      const pickupDateTime = new Date(`${schedule.date}T${schedule.timeStart}:00`).toISOString();

      // Delivery window: scheduled time to 2 hours after
      const [hours, minutes] = schedule.timeStart.split(':');
      const endHour = (parseInt(hours) + 2).toString().padStart(2, '0');
      const deliveryStart = pickupDateTime;
      const deliveryEnd = new Date(`${schedule.date}T${endHour}:${minutes}:00`).toISOString();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/roadie-create-shipment`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            booking_id: completedBookingId,
            description: `DropGood donation pickup for ${charity.name}`,
            pickup_location: {
              address: {
                street: pickupAddress.street,
                city: pickupAddress.city,
                state: pickupAddress.state,
                zip_code: pickupAddress.zip
              },
              latitude: pickupAddress.latitude,
              longitude: pickupAddress.longitude,
              contact: {
                name: `${firstName} ${lastName}`.trim() || 'Customer',
                phone: phone || '5555555555',
                email: contactMethod === 'both' ? email : undefined
              },
              notes: instructions || ''
            },
            delivery_location: {
              address: {
                street: charity.street_address,
                city: charity.city,
                state: charity.state,
                zip_code: charity.zip_code
              },
              latitude: charity.latitude,
              longitude: charity.longitude,
              contact: {
                name: charity.name,
                phone: charity.phone || '5555555555'
              }
            },
            pickup_after: pickupDateTime,
            deliver_between: {
              start: deliveryStart,
              end: deliveryEnd
            },
            bags_count: bagsCount || 0,
            boxes_count: boxesCount || 0
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to create Roadie shipment:', errorText);
        return;
      }

      const shipmentData = await response.json();
      console.log('✅ Roadie shipment created:', shipmentData);
      console.log('📍 Tracking URL:', shipmentData.tracking_url);

    } catch (error) {
      console.error('❌ Error creating Roadie shipment:', error);
      // Don't throw - allow booking to complete even if Roadie shipment fails
    }
  };

  const createUberDelivery = async (completedBookingId: string, quoteId?: string) => {
    // Only create Uber delivery if we have a quote_id (real Uber API was used)
    if (!quoteId) {
      console.log('⏭️ Skipping Uber delivery creation - no quote_id (manual/mock mode)');
      return;
    }

    try {
      console.log('🚗 Creating Uber Direct delivery with quote_id:', quoteId);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/uber-create-delivery`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            booking_id: completedBookingId,
            quote_id: quoteId,
            pickup_name: `${firstName} ${lastName}`.trim() || 'DropGood Customer',
            pickup_address: `${pickupAddress.street}, ${pickupAddress.city}, ${pickupAddress.state} ${pickupAddress.zip}`,
            pickup_latitude: pickupAddress.latitude,
            pickup_longitude: pickupAddress.longitude,
            pickup_phone_number: phone || '+15555555555',
            dropoff_name: charity.name,
            dropoff_address: `${charity.street_address}, ${charity.city}, ${charity.state} ${charity.zip_code}`,
            dropoff_latitude: charity.latitude,
            dropoff_longitude: charity.longitude,
            dropoff_phone_number: charity.phone || '+15555555555',
            dropoff_notes: `Donation pickup for ${charity.name}. Items: ${itemsTypes.join(', ')}. ${instructions || ''}`.trim(),
            manifest_reference: completedBookingId,
            manifest_items: [
              ...(bagsCount > 0 ? [{
                name: 'Donation Bags',
                quantity: bagsCount,
                size: 'medium'
              }] : []),
              ...(boxesCount > 0 ? [{
                name: 'Donation Boxes',
                quantity: boxesCount,
                size: 'large'
              }] : []),
              ...itemsTypes.map(item => ({
                name: item,
                quantity: 1,
                size: 'small'
              }))
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to create Uber delivery:', errorText);
        // Don't throw - allow booking to complete even if Uber delivery fails
        return;
      }

      const deliveryData = await response.json();
      console.log('✅ Uber delivery created:', deliveryData);
      console.log('📍 Tracking URL:', deliveryData.tracking_url);

      // Update booking with Uber delivery info
      await supabase
        .from('bookings')
        .update({
          uber_delivery_id: deliveryData.delivery_id,
          uber_tracking_url: deliveryData.tracking_url,
          uber_status: deliveryData.status,
        })
        .eq('id', completedBookingId);

      console.log('✅ Booking updated with Uber delivery info');
    } catch (error) {
      console.error('❌ Error creating Uber delivery:', error);
      // Don't throw - allow booking to complete even if Uber delivery fails
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

      // Create delivery based on provider
      const deliveryProvider = recalculatedPricing.provider || (recalculatedPricing.uber_quote_id ? 'uber' : 'manual');

      if (deliveryProvider === 'roadie') {
        await createRoadieShipment(completedBookingId);
      } else if (recalculatedPricing.uber_quote_id) {
        // Create Uber Direct delivery if quote_id exists
        await createUberDelivery(completedBookingId, recalculatedPricing.uber_quote_id);
      } else {
        console.log('⏭️ Manual mode - no delivery service creation needed');
      }

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

      // Send admin notification for ALL bookings (not just manual mode)
      try {
        await supabase.functions.invoke('send-notification', {
          body: {
            type: 'booking_confirmation',
            recipient_email: 'exontract@gmail.com',
            recipient_name: 'DropGood Admin',
            send_email: true,
            send_sms: false,
            data: {
              booking_id: completedBookingId,
              donor_name: `${firstName} ${lastName}`,
              customer_phone: phone,
              customer_email: contactMethod === 'both' ? email : '',
              pickup_address: `${pickupAddress.street}, ${pickupAddress.city}, ${pickupAddress.state} ${pickupAddress.zip}`,
              donation_center_name: charity.name,
              pickup_date: schedule.date,
              pickup_time: `${schedule.timeStart} - ${schedule.timeEnd}`,
              total_price: recalculatedPricing.total_price,
              items_description: itemsTypes.join(', '),
              bags_count: bagsCount || 0,
              boxes_count: boxesCount || 0,
            }
          }
        });
        console.log('✅ Admin notification sent');
      } catch (err) {
        console.error('Failed to notify admin:', err);
      }

      // Trigger success confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Small delay to show confetti before navigation
      await new Promise(resolve => setTimeout(resolve, 500));

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
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Review Your Pickup</h2>
        <p className="text-gray-400">Confirm details before booking</p>
      </div>

      {/* Trip Summary - Single Clean Card */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
        {/* Pickup Location */}
        <div className="p-6 sm:p-8 border-b border-gray-700">
          <div className="flex items-start gap-5">
            <div className="flex flex-col items-center pt-1">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <div className="w-0.5 flex-1 bg-gray-600 min-h-[80px]"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-400 text-sm mb-1">Pickup</p>
              <p className="text-white font-semibold text-lg mb-2">
                {pickupAddress.street}
              </p>
              <p className="text-gray-300 mb-3">
                {pickupAddress.city}, {pickupAddress.state} {pickupAddress.zip}
              </p>
              <p className="text-gray-400 text-sm">
                {schedule.date} • {schedule.timeStart}-{schedule.timeEnd}
              </p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="px-6 sm:px-8 py-4 border-b border-gray-700 bg-gray-800/30">
          <div className="flex items-center gap-4">
            <span className="text-2xl">📦</span>
            <div>
              <p className="text-white font-medium">~{itemsCount} bags/boxes</p>
              <p className="text-gray-400 text-sm">{itemsTypes.join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Dropoff Location */}
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-5">
            <div className="pt-1">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-400 text-sm mb-1">Dropoff</p>
              <p className="text-green-400 font-semibold text-lg mb-2">{charity.name}</p>
              <p className="text-gray-300">
                {charity.street_address}<br/>
                {charity.city}, {charity.state}
              </p>
              <p className="text-gray-400 text-sm mt-3">
                {charity.distance_miles?.toFixed(1)} miles away
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Price Total - Big and Simple */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 sm:p-8">
        <div className="flex justify-between items-center mb-8">
          <span className="text-gray-400 text-lg">Total</span>
          <span className="text-white font-bold text-4xl">${recalculatedPricing.total_price.toFixed(2)}</span>
        </div>

        <details className="group">
          <summary className="cursor-pointer text-blue-400 text-sm font-medium hover:text-blue-300 transition list-none flex items-center gap-2">
            <span>View price breakdown</span>
            <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>

          <div className="mt-6 space-y-3 text-sm pt-6 border-t border-gray-700">
            <div className="flex justify-between">
              <span className="text-gray-400">DropGood Pickup & Delivery</span>
              <span className="text-white">${recalculatedPricing.delivery_fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">
                Service Fee <span className="text-xs text-gray-500">(helps with operations)</span>
              </span>
              <span className="text-white">${(recalculatedPricing.service_fee + recalculatedPricing.stripe_fee).toFixed(2)}</span>
            </div>
            {/* Advance booking discount - Color coded: Yellow (good) -> Orange (better) -> Green (best) */}
            {recalculatedPricing.advance_booking_discount_amount && recalculatedPricing.advance_booking_discount_amount > 0 && (
              <div className={`flex justify-between ${
                (recalculatedPricing.days_in_advance || 0) <= 3
                  ? 'text-yellow-500'   // Good (5-10%)
                  : (recalculatedPricing.days_in_advance || 0) <= 5
                    ? 'text-orange-500' // Better (13-16%)
                    : 'text-green-500'  // Best (18-20%)
              }`}>
                <span>Advance booking ({recalculatedPricing.days_in_advance} days)</span>
                <span>-${recalculatedPricing.advance_booking_discount_amount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">
                Tip <span className="text-xs text-green-500">(100% to driver)</span>
              </span>
              <span className="text-white">${recalculatedPricing.driver_tip.toFixed(2)}</span>
            </div>
          </div>
        </details>
      </div>

      {/* Driver Tip Section */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 sm:p-8">
        <h3 className="text-white font-semibold text-lg mb-2">Add a Tip (Optional)</h3>
        <p className="text-gray-400 text-sm mb-6">Extra tips are appreciated!</p>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { value: 0, label: 'No tip' },
            { value: 5, label: '$5' },
            { value: 10, label: '$10' },
            { value: 15, label: '$15' }
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => { setDriverTip(option.value); setCustomTip(''); }}
              className={`py-4 rounded-xl font-semibold text-base transition ${
                driverTip === option.value && !customTip
                  ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-3">
            Custom amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
            <input
              type="number"
              value={customTip}
              onChange={(e) => {
                setCustomTip(e.target.value);
                const amount = parseFloat(e.target.value);
                if (!isNaN(amount) && amount >= 10 && amount <= 100) {
                  setDriverTip(amount);
                } else if (amount < 10) {
                  setDriverTip(10);
                } else if (amount > 100) {
                  setDriverTip(100);
                }
              }}
              className="w-full pl-12 pr-4 py-4 bg-gray-700 border border-gray-600 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              placeholder="10.00"
              step="1"
              min="10"
              max="100"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">$10 - $100</p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 sm:p-8">
        <h3 className="text-white font-semibold text-xl mb-6">Contact Information</h3>

        <div className="space-y-6">
          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-3">
                First name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value.trim())}
                className="w-full px-4 py-4 bg-gray-700 border border-gray-600 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="John"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-3">
                Last name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value.trim())}
                className="w-full px-4 py-4 bg-gray-700 border border-gray-600 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="Doe"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">
              Phone number
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
              className="w-full px-4 py-4 bg-gray-700 border border-gray-600 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              placeholder="(555) 123-4567"
              maxLength={14}
              required
            />
          </div>

          {/* Email */}
          {contactMethod === 'both' && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-3">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
                className="w-full px-4 py-4 bg-gray-700 border border-gray-600 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="your@email.com"
                required
              />
            </div>
          )}

          {/* Receipt method toggle */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setContactMethod('both')}
              className={`py-4 rounded-xl font-medium text-sm transition ${
                contactMethod === 'both'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Email + SMS
            </button>
            <button
              type="button"
              onClick={() => setContactMethod('phone')}
              className={`py-4 rounded-xl font-medium text-sm transition ${
                contactMethod === 'phone'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              SMS only
            </button>
          </div>
        </div>
      </div>

      {/* Payment Section */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 sm:p-8">
        <h3 className="text-white font-semibold text-xl mb-6">Payment</h3>

        {stripeEnabled && paymentReady && clientSecret && bookingId ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'night',
                variables: {
                  colorPrimary: '#3b82f6',
                  colorBackground: '#374151', // bg-gray-700
                  colorText: '#ffffff',
                  colorDanger: '#ef4444',
                  fontFamily: 'system-ui, sans-serif',
                  spacingUnit: '4px',
                  borderRadius: '8px', // rounded-lg
                  fontSizeBase: '14px',
                },
                rules: {
                  '.Input': {
                    border: '1px solid #4b5563', // border-gray-600
                    boxShadow: 'none !important',
                    backgroundColor: '#374151', // bg-gray-700
                    padding: '16px', // py-4 px-4 to match other inputs
                    fontSize: '18px', // text-lg to match other inputs
                  },
                  '.Input:focus': {
                    border: '1px solid transparent',
                    boxShadow: '0 0 0 2px #3b82f6 !important', // focus:ring-2 focus:ring-blue-500
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
                    color: '#9ca3af', // text-gray-400
                    fontSize: '12px',
                    fontWeight: '500',
                    marginBottom: '8px',
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
              agreedToTerms={agreedToTerms}
              setAgreedToTerms={setAgreedToTerms}
              firstName={firstName}
              lastName={lastName}
              phone={phone}
              email={email}
              contactMethod={contactMethod}
            />
          </Elements>
        ) : processing ? (
          /* Loading Payment Form */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-white font-semibold mb-2"
            >
              Setting up secure payment...
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 text-sm"
            >
              Please wait while we prepare your payment form
            </motion.p>
          </motion.div>
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

      {/* Cancellation Policy - REMOVED */}
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
  agreedToTerms: boolean;
  setAgreedToTerms: (agreed: boolean) => void;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  contactMethod: 'both' | 'phone';
}

function PaymentForm({ amount, bookingId, onBack, onSuccess, processing, setProcessing, paymentError, setPaymentError, agreedToTerms, setAgreedToTerms, firstName, lastName, phone, email, contactMethod }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate contact info before processing payment
    if (!firstName || !lastName || !phone || (contactMethod === 'both' && !email)) {
      setPaymentError('Please provide all required contact information');
      setProcessing(false);
      return;
    }

    if (!stripe || !elements) {
      console.error('Stripe not loaded');
      return;
    }

    console.log('💳 Processing payment for booking:', bookingId);
    setProcessing(true);
    setPaymentError(null);

    try {
      // Update booking with contact info before payment
      const { error: updateContactError } = await supabase
        .from('bookings')
        .update({
          customer_first_name: firstName,
          customer_last_name: lastName,
          customer_phone: phone,
          customer_email: contactMethod === 'both' ? email : null,
        })
        .eq('id', bookingId);

      if (updateContactError) {
        console.error('Failed to update contact info:', updateContactError);
        throw new Error('Failed to update contact information');
      }

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
      {/* Card Payment */}
      <PaymentElement />

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
