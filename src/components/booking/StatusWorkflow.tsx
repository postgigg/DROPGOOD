import React, { useState } from 'react';
import { CheckCircle, Clock, Truck, Package, MapPin, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface StatusWorkflowProps {
  bookingId: string;
  currentStatus: string;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  driverInfo?: {
    name: string;
    phone: string;
    vehicle: string;
  };
  donationCenterName: string;
  onStatusChange: () => void;
}

type StatusStep = {
  key: string;
  label: string;
  icon: typeof Clock;
  color: string;
  bgColor: string;
  notificationType?: string;
};

const STATUS_STEPS: StatusStep[] = [
  { key: 'payment_pending', label: 'Payment Pending', icon: Clock, color: 'text-gray-600', bgColor: 'bg-gray-100' },
  { key: 'scheduled', label: 'Scheduled', icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-100', notificationType: 'booking_confirmation' },
  { key: 'pending_driver', label: 'Finding Driver', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { key: 'driver_assigned', label: 'Driver Assigned', icon: Truck, color: 'text-blue-600', bgColor: 'bg-blue-100', notificationType: 'driver_assigned' },
  { key: 'driver_arrived', label: 'Driver Arrived', icon: MapPin, color: 'text-purple-600', bgColor: 'bg-purple-100', notificationType: 'driver_arrived' },
  { key: 'picked_up', label: 'Picked Up', icon: Package, color: 'text-indigo-600', bgColor: 'bg-indigo-100', notificationType: 'pickup_completed' },
  { key: 'in_transit', label: 'In Transit', icon: Truck, color: 'text-blue-600', bgColor: 'bg-blue-100', notificationType: 'driver_enroute' },
  { key: 'completed', label: 'Completed', icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-100', notificationType: 'delivery_completed' },
];

export default function StatusWorkflow({
  bookingId,
  currentStatus,
  customerEmail,
  customerPhone,
  customerName,
  driverInfo,
  donationCenterName,
  onStatusChange,
}: StatusWorkflowProps) {
  const [updating, setUpdating] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === currentStatus);
  const nextStep = STATUS_STEPS[currentStepIndex + 1];
  const prevStep = STATUS_STEPS[currentStepIndex - 1];

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('bookings')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      if (error) throw error;

      if (user) {
        await supabase.from('manual_operations').insert({
          booking_id: bookingId,
          admin_user_id: user.id,
          action_type: 'status_updated',
          action_data: {
            old_status: currentStatus,
            new_status: newStatus
          },
        });
      }

      const step = STATUS_STEPS.find(s => s.key === newStatus);
      if (step?.notificationType) {
        await sendNotification(step.notificationType, newStatus);
      }

      onStatusChange();
    } catch (error: any) {
      alert('Error updating status: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const sendNotification = async (notificationType: string, newStatus: string) => {
    setSendingNotification(true);
    try {
      const notificationData: any = {
        type: notificationType,
        recipient_email: customerEmail,
        recipient_phone: customerPhone,
        recipient_name: customerName,
        data: {
          customer_name: customerName,
          donation_center_name: donationCenterName,
          booking_id: bookingId,
        },
      };

      if (driverInfo && ['driver_assigned', 'driver_enroute', 'driver_arrived'].includes(notificationType)) {
        notificationData.data.driver_name = driverInfo.name;
        notificationData.data.driver_phone = driverInfo.phone;
        notificationData.data.vehicle_info = driverInfo.vehicle;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-notification`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(notificationData),
        }
      );

      if (!response.ok) {
        console.error('Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    } finally {
      setSendingNotification(false);
    }
  };

  const canMoveToStatus = (targetStatus: string): boolean => {
    if (currentStatus === 'cancelled' || currentStatus === 'failed') return false;
    if (targetStatus === 'driver_assigned' && !driverInfo?.name) return false;
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="flex items-center justify-between mb-8">
          {STATUS_STEPS.filter(s => !['cancelled', 'failed'].includes(s.key)).map((step, index) => {
            const Icon = step.icon;
            const isCompleted = STATUS_STEPS.findIndex(s => s.key === currentStatus) > index;
            const isCurrent = step.key === currentStatus;

            return (
              <div key={step.key} className="flex-1">
                <div className="relative">
                  {index > 0 && (
                    <div
                      className={`absolute top-1/2 right-1/2 -translate-y-1/2 h-1 w-full ${
                        isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                      }`}
                      style={{ right: '50%', left: '-50%' }}
                    />
                  )}
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                        isCurrent
                          ? step.bgColor + ' ' + step.color + ' ring-4 ring-offset-2 ring-emerald-200'
                          : isCompleted
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div
                      className={`text-xs font-medium text-center ${
                        isCurrent ? 'text-slate-900' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-emerald-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Status Actions</h3>

        {currentStatus === 'completed' ? (
          <div className="flex items-center gap-3 text-emerald-600 py-3">
            <CheckCircle className="w-6 h-6" />
            <span className="font-medium">Delivery Completed!</span>
          </div>
        ) : currentStatus === 'cancelled' || currentStatus === 'failed' ? (
          <div className="flex items-center gap-3 text-red-600 py-3">
            <XCircle className="w-6 h-6" />
            <span className="font-medium">Booking {currentStatus === 'cancelled' ? 'Cancelled' : 'Failed'}</span>
          </div>
        ) : (
          <div className="grid gap-3">
            {nextStep && canMoveToStatus(nextStep.key) && (
              <button
                onClick={() => updateStatus(nextStep.key)}
                disabled={updating || sendingNotification}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {React.createElement(nextStep.icon, { className: 'w-5 h-5' })}
                <span>Move to: {nextStep.label}</span>
                {sendingNotification && <span className="text-sm">(Sending notification...)</span>}
              </button>
            )}

            {nextStep && nextStep.key === 'driver_assigned' && !driverInfo?.name && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                <span className="font-medium">⚠️ Driver details required</span> - Please assign driver information above before moving to this status.
              </div>
            )}

            {prevStep && (
              <button
                onClick={() => updateStatus(prevStep.key)}
                disabled={updating || sendingNotification}
                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                ← Back to: {prevStep.label}
              </button>
            )}

            <div className="pt-3 border-t border-slate-200">
              <button
                onClick={() => updateStatus('cancelled')}
                disabled={updating}
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Cancel Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
