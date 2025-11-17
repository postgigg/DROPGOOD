import { useState, useMemo } from 'react';
import { Calendar, Clock, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DonationCenter } from '../../lib/supabase';
import { calculateFinalPrice, INACTIVE_CHARITY_SERVICE_FEE, DEFAULT_SERVICE_FEE } from '../../lib/pricing';

interface Props {
  charity: DonationCenter & { pricing: any };
  pickupAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    latitude: number;
    longitude: number;
  };
  bagsCount?: number;
  boxesCount?: number;
  onNext: (schedule: { date: string; timeStart: string; timeEnd: string; pricing: any }) => void;
  onBack: () => void;
  initialSchedule: { date: string; timeStart: string; timeEnd: string } | null;
}

export default function StepSchedule({ charity, pickupAddress, bagsCount = 0, boxesCount = 0, onNext, onBack, initialSchedule }: Props) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [selectedDate, setSelectedDate] = useState(initialSchedule?.date || tomorrow.toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState(() => {
    if (initialSchedule?.timeStart && initialSchedule?.timeEnd) {
      return `${initialSchedule.timeStart}-${initialSchedule.timeEnd}`;
    } else if (initialSchedule?.timeStart) {
      return initialSchedule.timeStart.includes('-') ? initialSchedule.timeStart : '14:00-16:00';
    }
    return '14:00-16:00';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isToday = selectedDate === today.toISOString().split('T')[0];

  // Calculate days in advance for discount
  const calculateDaysInAdvance = (dateStr: string) => {
    const selected = new Date(dateStr);
    const todayStart = new Date(); // Always get fresh current date
    todayStart.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);
    const diffTime = selected.getTime() - todayStart.getTime();
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    // console.log('🔍 calculateDaysInAdvance:', { dateStr, todayStart: todayStart.toISOString(), selected: selected.toISOString(), days });
    return days;
  };

  const updatedPricing = useMemo(() => {
    // Recalculate days in advance inside memo so it updates with selectedDate
    const daysInAdvance = calculateDaysInAdvance(selectedDate);

    // Check if charity is inactive/non-verified (use 40% fee) or active (use 25% fee)
    const serviceFee = charity.is_active === false
      ? INACTIVE_CHARITY_SERVICE_FEE  // 40% for non-verified charities
      : DEFAULT_SERVICE_FEE;           // 25% for verified/active charities

    const basePricing = calculateFinalPrice(
      charity.pricing.uber_cost,
      isToday,
      0, // No base tip - driver gets bag/box fees
      serviceFee, // Use correct service fee based on charity status
      pickupAddress.state, // Pass state for state fee calculation
      bagsCount, // Number of bags
      boxesCount, // Number of boxes
      daysInAdvance // Days in advance for discount
    );

    if (charity.pricing.subsidized && charity.pricing.subsidy_amount) {
      const subsidyPercentage = (charity.pricing.subsidy_amount / charity.pricing.original_price) * 100;
      const newSubsidyAmount = basePricing.total_price * (subsidyPercentage / 100);

      return {
        ...basePricing,
        subsidy_amount: newSubsidyAmount,
        original_price: basePricing.total_price,
        total_price: basePricing.total_price - newSubsidyAmount,
        subsidized: true
      };
    }

    return basePricing;
  }, [charity.pricing.uber_cost, charity.pricing.subsidized, charity.pricing.subsidy_amount, charity.pricing.original_price, charity.is_active, isToday, selectedDate, bagsCount, boxesCount, pickupAddress.state]);

  // Calculate days in advance for display in celebration message
  const daysInAdvance = calculateDaysInAdvance(selectedDate);

  const getNextDays = (count: number) => {
    const days = [];
    for (let i = 0; i < count; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const formatDate = (date: Date) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return {
      dayName: dayNames[date.getDay()],
      monthName: monthNames[date.getMonth()],
      dayNumber: date.getDate()
    };
  };

  const timeSlots = [
    { value: '08:00-10:00', label: 'Morning (8am - 10am)' },
    { value: '14:00-16:00', label: 'Afternoon (2pm - 4pm)' },
    { value: '17:00-19:00', label: 'Evening (5pm - 7pm)' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate brief delay for smoother transition
    await new Promise(resolve => setTimeout(resolve, 300));
    const [timeStart, timeEnd] = selectedTime.split('-');
    onNext({ date: selectedDate, timeStart, timeEnd, pricing: updatedPricing });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">When should we pick this up?</h2>
        <div className="bg-blue-900/30 border border-blue-500/50 rounded-xl p-5">
          <p className="text-sm text-blue-300 mb-1">Donating to</p>
          <p className="text-xl font-bold text-white mb-3">{charity.name}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-blue-400">
              ${updatedPricing.total_price.toFixed(2)}
            </p>
            <p className="text-sm text-gray-400">total</p>
          </div>
        </div>

        {/* Advance booking discount celebration - HIDDEN FOR NOW */}
        {/* {daysInAdvance >= 2 && (
          <div className={`rounded-lg p-3 mt-2 ${
            daysInAdvance <= 3
              ? 'bg-yellow-900/20 border border-yellow-700/40'  // Good (5-10%)
              : daysInAdvance <= 5
                ? 'bg-orange-900/20 border border-orange-700/40' // Better (13-16%)
                : 'bg-green-900/20 border border-green-700/40'   // Best (18-20%)
          }`}>
            <p className={`text-sm font-semibold ${
              daysInAdvance <= 3
                ? 'text-yellow-400'   // Good
                : daysInAdvance <= 5
                  ? 'text-orange-400' // Better
                  : 'text-green-400'  // Best
            }`}>
              🎉 {updatedPricing.advance_booking_discount_percentage ? (updatedPricing.advance_booking_discount_percentage * 100).toFixed(0) : '0'}% advance booking discount applied!
            </p>
            <p className="text-gray-400 text-xs">
              You're saving ${updatedPricing.advance_booking_discount_amount ? updatedPricing.advance_booking_discount_amount.toFixed(2) : '0.00'} by booking {daysInAdvance} days in advance
            </p>
          </div>
        )} */}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          <Calendar className="inline h-4 w-4 mr-2" />
          Select Date
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {getNextDays(7).map((date, idx) => {
            const dateStr = date.toISOString().split('T')[0];
            const isSelectedToday = idx === 0;
            const dateInfo = formatDate(date);

            return (
              <motion.button
                key={dateStr}
                type="button"
                onClick={() => setSelectedDate(dateStr)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative p-3 border-2 rounded-lg transition text-center ${
                  selectedDate === dateStr
                    ? 'border-blue-500 bg-blue-600 text-white'
                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-blue-400 hover:bg-gray-700'
                }`}
              >
                {/* Advance booking discount badge - HIDDEN FOR NOW */}
                {/* {idx >= 2 && (
                  <div className={`absolute -top-2 -right-2 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg ${
                    idx === 2 ? 'bg-yellow-500' :  // 5% - good
                    idx === 3 ? 'bg-yellow-500' :  // 10% - good
                    idx === 4 ? 'bg-orange-500' :  // 15% - better
                    idx === 5 ? 'bg-orange-500' :  // 18% - better
                    idx === 6 ? 'bg-green-500' :   // 22% - best
                    'bg-green-500'                  // 25% - best
                  }`}>
                    {idx === 2 && '5% OFF'}
                    {idx === 3 && '10% OFF'}
                    {idx === 4 && '15% OFF'}
                    {idx === 5 && '18% OFF'}
                    {idx === 6 && '22% OFF'}
                    {idx >= 7 && '25% OFF'}
                  </div>
                )} */}
                <div className="text-xs font-medium mb-1">{dateInfo.dayName}</div>
                <div className="text-2xl font-bold">{dateInfo.dayNumber}</div>
                <div className="text-xs mt-1">{dateInfo.monthName}</div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          <Clock className="inline h-4 w-4 mr-2" />
          Select Time Window
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {timeSlots.map(slot => (
            <motion.button
              key={slot.value}
              type="button"
              onClick={() => setSelectedTime(slot.value)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`p-4 border-2 rounded-lg transition text-center ${
                selectedTime === slot.value
                  ? 'border-blue-500 bg-blue-600 text-white'
                  : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-blue-400 hover:bg-gray-700'
              }`}
            >
              <Clock className={`h-6 w-6 mx-auto mb-2 ${selectedTime === slot.value ? 'text-white' : 'text-gray-400'}`} />
              <div className="font-semibold">{slot.label.split('(')[0].trim()}</div>
              <div className="text-sm mt-1 opacity-80">{slot.label.match(/\(([^)]+)\)/)?.[1]}</div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="bg-green-900/20 border border-green-700/50 p-4 rounded-lg space-y-2 text-sm">
        <p className="flex items-center text-green-300">
          ✅ We'll text you 30 min before driver arrives
        </p>
        <p className="flex items-center text-green-300">
          ✅ Price guaranteed - won't change
        </p>
      </div>

      <div className="flex space-x-4">
        <motion.button
          type="button"
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting}
          className="flex-1 bg-gray-700 text-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-600 transition disabled:opacity-50"
        >
          Back
        </motion.button>
        <motion.button
          type="submit"
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            'Continue to Payment'
          )}
        </motion.button>
      </div>
    </form>
  );
}
