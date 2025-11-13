import { useState, useMemo } from 'react';
import { Calendar, Clock } from 'lucide-react';
import type { DonationCenter } from '../../lib/supabase';
import { calculateFinalPrice } from '../../lib/pricing';

interface Props {
  charity: DonationCenter & { pricing: any };
  onNext: (schedule: { date: string; timeStart: string; timeEnd: string; pricing: any }) => void;
  onBack: () => void;
  initialSchedule: { date: string; timeStart: string; timeEnd: string } | null;
}

export default function StepSchedule({ charity, onNext, onBack, initialSchedule }: Props) {
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

  const isToday = selectedDate === today.toISOString().split('T')[0];

  const updatedPricing = useMemo(() => {
    const basePricing = calculateFinalPrice(charity.pricing.uber_cost, isToday);

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
  }, [charity.pricing.uber_cost, charity.pricing.subsidized, charity.pricing.subsidy_amount, charity.pricing.original_price, isToday]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [timeStart, timeEnd] = selectedTime.split('-');
    onNext({ date: selectedDate, timeStart, timeEnd, pricing: updatedPricing });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">When should we pick this up?</h2>
        <div className="bg-blue-900/20 border border-blue-700/50 p-4 rounded-lg mt-4">
          <p className="font-semibold text-white">Selected charity: {charity.name}</p>
          <p className="text-sm text-gray-400">
            Final price: ${updatedPricing.total_price.toFixed(2)}
            {isToday && <span className="ml-2 text-yellow-400">(includes $5 rush fee)</span>}
          </p>
          <p className="text-sm text-gray-400">Distance: {charity.distance_miles} miles</p>
        </div>
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
              <button
                key={dateStr}
                type="button"
                onClick={() => setSelectedDate(dateStr)}
                className={`relative p-3 border-2 rounded-lg transition text-center ${
                  selectedDate === dateStr
                    ? 'border-blue-500 bg-blue-600 text-white'
                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-blue-400 hover:bg-gray-700'
                }`}
              >
                <div className="text-xs font-medium mb-1">{dateInfo.dayName}</div>
                <div className="text-2xl font-bold">{dateInfo.dayNumber}</div>
                <div className="text-xs mt-1">{dateInfo.monthName}</div>
                {isSelectedToday && (
                  <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                    +$5
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {selectedDate === today.toISOString().split('T')[0] && (
          <p className="text-xs text-yellow-400 mt-2">* Same-day pickup includes a $5 rush fee</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          <Clock className="inline h-4 w-4 mr-2" />
          Select Time Window
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {timeSlots.map(slot => (
            <button
              key={slot.value}
              type="button"
              onClick={() => setSelectedTime(slot.value)}
              className={`p-4 border-2 rounded-lg transition text-center ${
                selectedTime === slot.value
                  ? 'border-blue-500 bg-blue-600 text-white'
                  : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-blue-400 hover:bg-gray-700'
              }`}
            >
              <Clock className={`h-6 w-6 mx-auto mb-2 ${selectedTime === slot.value ? 'text-white' : 'text-gray-400'}`} />
              <div className="font-semibold">{slot.label.split('(')[0].trim()}</div>
              <div className="text-sm mt-1 opacity-80">{slot.label.match(/\(([^)]+)\)/)?.[1]}</div>
            </button>
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
        <button
          type="button"
          onClick={onBack}
          className="flex-1 bg-gray-700 text-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Continue to Payment
        </button>
      </div>
    </form>
  );
}
