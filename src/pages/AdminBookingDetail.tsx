import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft, Send, Upload, Save, DollarSign,
  User, Phone, Mail, MapPin, Calendar,
  Image as ImageIcon, Truck, Clock, CheckCircle, Copy, Check, MessageCircle
} from 'lucide-react';
import StatusWorkflow from '../components/booking/StatusWorkflow';
import BookingChat from '../components/BookingChat';
import DropGoodLogo from '../components/DropGoodLogo';

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  pickup_address: string;
  pickup_date: string;
  pickup_time: string;
  items_description: string;
  donation_center_id: string;
  donation_center_name: string;
  donation_center_address: string;
  status: string;
  total_price: number;
  manual_mode: boolean;
  driver_name: string | null;
  driver_phone: string | null;
  vehicle_make: string | null;
  vehicle_color: string | null;
  license_plate: string | null;
  manual_eta: string | null;
  delivery_photo_url: string | null;
  actual_cost: number | null;
  photo_urls: string[];
  messages_confirmed: boolean;
  messages_confirmed_at: string | null;
  messages_confirmed_by: string | null;
}

interface NotificationLog {
  id: string;
  notification_type: string;
  email_sent: boolean;
  sms_sent: boolean;
  sent_at: string;
}

type TabType = 'overview' | 'driver' | 'status' | 'completion' | 'financials' | 'chat';

export default function AdminBookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [eta, setEta] = useState('');
  const [status, setStatus] = useState('');
  const [actualCost, setActualCost] = useState('');
  const [actualTip, setActualTip] = useState('');
  const [deliveryPhoto, setDeliveryPhoto] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [confirmingMessages, setConfirmingMessages] = useState(false);
  const [confirmedByName, setConfirmedByName] = useState<string | null>(null);

  useEffect(() => {
    loadBooking();
    loadNotificationLogs();
  }, [id]);

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const loadBooking = async () => {
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
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        navigate('/admin/operations');
        return;
      }

      const formattedBooking = {
        ...data,
        pickup_address: `${data.pickup_street_address}, ${data.pickup_city}, ${data.pickup_state} ${data.pickup_zip_code}`,
        pickup_date: data.scheduled_date,
        pickup_time: data.scheduled_time_start?.substring(0, 5) || '',
        donation_center_name: data.donation_centers?.name || 'Unknown',
        donation_center_address: data.donation_centers
          ? `${data.donation_centers.street_address}, ${data.donation_centers.city}, ${data.donation_centers.state} ${data.donation_centers.zip_code}`
          : 'Unknown',
      };

      setBooking(formattedBooking);
      setDriverName(formattedBooking.driver_name || '');
      setDriverPhone(formattedBooking.driver_phone || '');
      setVehicleMake(formattedBooking.vehicle_make || '');
      setVehicleColor(formattedBooking.vehicle_color || '');
      setLicensePlate(formattedBooking.license_plate || '');
      setEta(formattedBooking.manual_eta || '');
      setStatus(formattedBooking.status || 'pending');
      setActualCost(formattedBooking.actual_cost?.toString() || '');
      setActualTip(formattedBooking.driver_tip?.toString() || '4.00');

      // Load confirmed by admin name if exists
      if (formattedBooking.messages_confirmed_by) {
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('name')
          .eq('id', formattedBooking.messages_confirmed_by)
          .maybeSingle();

        if (adminData) {
          setConfirmedByName(adminData.name);
        }
      }
    } catch (error) {
      console.error('Error loading booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_logs')
        .select('*')
        .eq('booking_id', id)
        .order('sent_at', { ascending: false });

      if (error) throw error;
      setNotificationLogs(data || []);
    } catch (error) {
      console.error('Error loading notification logs:', error);
    }
  };

  const handleSaveDriverDetails = async () => {
    if (!booking) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const updates: any = {
        driver_name: driverName || null,
        driver_phone: driverPhone || null,
        vehicle_make: vehicleMake || null,
        vehicle_color: vehicleColor || null,
        license_plate: licensePlate || null,
        manual_eta: eta || null,
        status,
      };

      if (actualCost) {
        updates.actual_cost = parseFloat(actualCost);
      }

      if (actualTip) {
        updates.driver_tip = parseFloat(actualTip);
      }

      const { error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', booking.id);

      if (error) throw error;

      if (user) {
        await supabase.from('manual_operations').insert({
          booking_id: booking.id,
          admin_user_id: user.id,
          action_type: 'driver_details_updated',
          action_data: updates,
        });
      }

      await loadBooking();
      alert('Driver details saved successfully');
    } catch (error: any) {
      alert('Error saving details: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSendDriverDetails = async () => {
    if (!booking || !driverName || !driverPhone) {
      alert('Please fill in driver name and phone before sending');
      return;
    }

    setSending(true);
    try {
      await handleSaveDriverDetails();

      const notificationData = {
        booking_id: booking.id,
        type: 'driver_assigned',
        recipient_phone: booking.customer_phone,
        recipient_email: booking.customer_email,
        data: {
          customer_name: booking.customer_name,
          driver_name: driverName,
          driver_phone: driverPhone,
          vehicle_info: `${vehicleColor} ${vehicleMake}`,
          license_plate: licensePlate,
          eta: eta || booking.pickup_time,
        },
      };

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

      if (!response.ok) throw new Error('Failed to send notification');

      alert('Driver details sent to customer!');
    } catch (error: any) {
      alert('Error sending notification: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const handlePhotoUpload = async () => {
    if (!deliveryPhoto || !booking) return;

    setUploadingPhoto(true);
    try {
      const fileExt = deliveryPhoto.name.split('.').pop();
      const fileName = `${booking.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('delivery-photos')
        .upload(filePath, deliveryPhoto);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('delivery-photos')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          delivery_photo_url: publicUrl,
          status: 'delivered'
        })
        .eq('id', booking.id);

      if (updateError) throw updateError;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('manual_operations').insert({
          booking_id: booking.id,
          admin_user_id: user.id,
          action_type: 'delivery_photo_uploaded',
          action_data: { photo_url: publicUrl },
        });
      }

      await loadBooking();
      setDeliveryPhoto(null);
      alert('Delivery photo uploaded successfully!');
    } catch (error: any) {
      alert('Error uploading photo: ' + error.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSendCompletionNotification = async () => {
    if (!booking || !booking.delivery_photo_url) {
      alert('Please upload a delivery photo first');
      return;
    }

    try {
      const notificationData = {
        booking_id: booking.id,
        type: 'delivery_completed',
        recipient_phone: booking.customer_phone,
        recipient_email: booking.customer_email,
        data: {
          customer_name: booking.customer_name,
          donation_center_name: booking.donation_center_name,
          delivery_photo_url: booking.delivery_photo_url,
        },
      };

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

      if (!response.ok) throw new Error('Failed to send notification');

      alert('Completion notification sent to customer and donation center!');
    } catch (error: any) {
      alert('Error sending notification: ' + error.message);
    }
  };

  const handleConfirmMessages = async () => {
    if (!booking) return;

    setConfirmingMessages(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('You must be logged in to confirm messages');
        return;
      }

      const { error } = await supabase
        .from('bookings')
        .update({
          messages_confirmed: true,
          messages_confirmed_at: new Date().toISOString(),
          messages_confirmed_by: user.id,
        })
        .eq('id', booking.id);

      if (error) throw error;

      // Log the confirmation action
      await supabase.from('manual_operations').insert({
        booking_id: booking.id,
        admin_user_id: user.id,
        action_type: 'messages_confirmed',
        action_data: {
          confirmed_at: new Date().toISOString(),
        },
      });

      await loadBooking();
      alert('Messages confirmed successfully!');
    } catch (error: any) {
      alert('Error confirming messages: ' + error.message);
    } finally {
      setConfirmingMessages(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading booking...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/admin/operations')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Operations
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Booking #{booking.id.slice(0, 8)}</h1>
              <p className="text-sm text-slate-600 mt-1">{booking.customer_name}</p>
            </div>
            <div className="text-right">
              {actualCost && actualTip && (
                <div className="mb-2">
                  <div className={`text-sm font-semibold ${
                    parseFloat(actualCost) + parseFloat(actualTip) + (booking.stripe_fee || 0) > (booking.total_price + (booking.subsidy_amount || 0))
                      ? 'text-red-600'
                      : 'text-emerald-600'
                  }`}>
                    {(() => {
                      const totalRevenue = booking.total_price + (booking.subsidy_amount || 0);
                      const totalCosts = parseFloat(actualCost) + parseFloat(actualTip) + (booking.stripe_fee || 0);
                      const profit = totalRevenue - totalCosts;
                      const profitPercent = (profit / totalRevenue) * 100;
                      return `${profitPercent.toFixed(0)}% Profit ($${profit.toFixed(2)})`;
                    })()}
                  </div>
                </div>
              )}
              <div className="text-3xl font-bold text-emerald-600">
                ${booking.total_price.toFixed(2)}
                {booking.subsidy_amount > 0 && (
                  <span className="text-sm text-green-600 ml-2">+${booking.subsidy_amount.toFixed(2)} subsidy</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-slate-200">
            <nav className="flex gap-2 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-6 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('driver')}
                className={`py-4 px-6 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'driver'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                Driver Info
              </button>
              <button
                onClick={() => setActiveTab('status')}
                className={`py-4 px-6 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'status'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                Status Actions
              </button>
              <button
                onClick={() => setActiveTab('completion')}
                className={`py-4 px-6 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'completion'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                Completion
              </button>
              <button
                onClick={() => setActiveTab('financials')}
                className={`py-4 px-6 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'financials'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                Financials
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`py-4 px-6 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'chat'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                Chat
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-500" />
                  Customer Information
                </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm group">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-900 font-medium">{booking.customer_name}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(booking.customer_name, 'name')}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded"
                  >
                    {copiedField === 'name' ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between text-sm group">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <a href={`mailto:${booking.customer_email}`} className="text-emerald-600 hover:underline">
                      {booking.customer_email}
                    </a>
                  </div>
                  <button
                    onClick={() => copyToClipboard(booking.customer_email, 'email')}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded"
                  >
                    {copiedField === 'email' ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between text-sm group">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <a href={`tel:${booking.customer_phone}`} className="text-emerald-600 hover:underline">
                      {booking.customer_phone}
                    </a>
                  </div>
                  <button
                    onClick={() => copyToClipboard(booking.customer_phone, 'phone')}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded"
                  >
                    {copiedField === 'phone' ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-500" />
                Pickup & Delivery
              </h2>
              <div className="space-y-4">
                <div className="group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-medium text-slate-700">Pickup Address</div>
                    <button
                      onClick={() => copyToClipboard(booking.pickup_address, 'pickup')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded"
                    >
                      {copiedField === 'pickup' ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                  <div className="text-slate-900">{booking.pickup_address}</div>
                </div>
                <div className="group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-medium text-slate-700">Donation Center</div>
                    <button
                      onClick={() => copyToClipboard(booking.donation_center_address, 'dropoff')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded"
                    >
                      {copiedField === 'dropoff' ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                  <div className="text-slate-900">{booking.donation_center_name}</div>
                  <div className="text-sm text-slate-600">{booking.donation_center_address}</div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{new Date(booking.pickup_date).toLocaleDateString()} at {booking.pickup_time}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <DropGoodLogo size={20} />
                Items Description
              </h2>
              <p className="text-slate-700">{booking.items_description || 'No description provided'}</p>
            </div>

            {booking.photo_urls && booking.photo_urls.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-emerald-500" />
                  Customer Photos
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {booking.photo_urls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Item ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'driver' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-500" />
              Driver Assignment
            </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Driver Name</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Driver Phone</label>
                  <input
                    type="tel"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Vehicle Make</label>
                    <input
                      type="text"
                      value={vehicleMake}
                      onChange={(e) => setVehicleMake(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Toyota Camry"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Vehicle Color</label>
                    <input
                      type="text"
                      value={vehicleColor}
                      onChange={(e) => setVehicleColor(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Black"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">License Plate</label>
                  <input
                    type="text"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="ABC-1234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">ETA</label>
                  <input
                    type="datetime-local"
                    value={eta}
                    onChange={(e) => setEta(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveDriverDetails}
                    disabled={saving}
                    className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Details'}
                  </button>
                  <button
                    onClick={handleSendDriverDetails}
                    disabled={sending || !driverName || !driverPhone}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {sending ? 'Sending...' : 'Send to Customer'}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                Message Confirmation
              </h2>

              <div className="space-y-4">
                {/* Notification Status */}
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="text-sm font-semibold text-slate-700 mb-2">Notification Status</div>

                  {notificationLogs.length === 0 ? (
                    <div className="text-sm text-slate-600">
                      No notifications sent yet for this booking.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {notificationLogs.map((log) => (
                        <div key={log.id} className="flex items-center justify-between text-sm">
                          <div>
                            <span className="font-medium text-slate-700">
                              {log.notification_type.split('_').map(word =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </span>
                            <span className="text-slate-500 ml-2">
                              {new Date(log.sent_at).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4 text-slate-400" />
                              <span className={log.email_sent ? 'text-emerald-600' : 'text-red-600'}>
                                {log.email_sent ? '✓' : '✗'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4 text-slate-400" />
                              <span className={log.sms_sent ? 'text-emerald-600' : 'text-red-600'}>
                                {log.sms_sent ? '✓' : '✗'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Manual Confirmation */}
                <div className="border-t border-slate-200 pt-4">
                  {booking.messages_confirmed ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-semibold text-emerald-900">
                            Messages Confirmed
                          </div>
                          <div className="text-sm text-emerald-700 mt-1">
                            Confirmed by {confirmedByName || 'Admin'} on{' '}
                            {booking.messages_confirmed_at
                              ? new Date(booking.messages_confirmed_at).toLocaleString()
                              : 'Unknown date'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm text-slate-600 mb-3">
                        Manually confirm that text messages were successfully sent to the customer.
                      </div>
                      <button
                        onClick={handleConfirmMessages}
                        disabled={confirmingMessages}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {confirmingMessages ? 'Confirming...' : 'Confirm Messages Sent'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
        </div>
      )}

      {activeTab === 'status' && (
        <div className="space-y-6">
          <StatusWorkflow
            bookingId={booking.id}
            currentStatus={booking.status}
            customerEmail={booking.customer_email}
            customerPhone={booking.customer_phone}
            customerName={booking.customer_name}
            driverInfo={
              driverName && driverPhone
                ? {
                    name: driverName,
                    phone: driverPhone,
                    vehicle: `${vehicleColor} ${vehicleMake} (${licensePlate})`,
                  }
                : undefined
            }
            donationCenterName={booking.donation_center_name}
            onStatusChange={loadBooking}
          />
        </div>
      )}

      {activeTab === 'completion' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              Delivery Completion
            </h2>
              <div className="space-y-4">
                {booking.delivery_photo_url ? (
                  <div>
                    <div className="text-sm font-medium text-slate-700 mb-2">Delivery Photo</div>
                    <img
                      src={booking.delivery_photo_url}
                      alt="Delivery proof"
                      className="w-full h-64 object-cover rounded-lg mb-4"
                    />
                    <button
                      onClick={handleSendCompletionNotification}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Send Completion Notification
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Upload Delivery Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setDeliveryPhoto(e.target.files?.[0] || null)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    {deliveryPhoto && (
                      <button
                        onClick={handlePhotoUpload}
                        disabled={uploadingPhoto}
                        className="mt-4 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
        </div>
      )}

      {activeTab === 'financials' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              Cost & Profit Breakdown
            </h2>
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  <div className="text-sm font-semibold text-slate-700 mb-3">Customer Payment</div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Uber Cost (Estimated)</span>
                    <span className="font-medium">${booking.uber_cost?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Our Markup (25%)</span>
                    <span className="font-medium">${booking.our_markup?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Driver Tip</span>
                    <span className="font-medium">${booking.driver_tip?.toFixed(2) || '0.00'}</span>
                  </div>
                  {booking.rush_fee && booking.rush_fee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Rush Fee</span>
                      <span className="font-medium">${booking.rush_fee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Stripe Fee</span>
                    <span className="font-medium">${booking.stripe_fee?.toFixed(2) || '0.00'}</span>
                  </div>

                  {booking.subsidy_amount && booking.subsidy_amount > 0 && (
                    <>
                      <div className="pt-2 border-t border-slate-200">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Subtotal (before subsidy)</span>
                          <span className="font-medium">${booking.original_price?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>
                      <div className="bg-green-100 border border-green-300 rounded px-2 py-1 -mx-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-green-800 font-semibold">💚 Sponsorship Subsidy ({booking.subsidy_percentage}%)</span>
                          <span className="font-semibold text-green-800">-${booking.subsidy_amount.toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-green-700 mt-1">
                          Paid by donation center sponsorship
                        </div>
                      </div>
                    </>
                  )}

                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-900">Total Charged {booking.subsidy_amount > 0 ? '(after subsidy)' : ''}</span>
                      <span className="text-emerald-600">${booking.total_price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <div className="text-sm font-semibold text-slate-700 mb-3">Actual Costs</div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Actual Uber Cost
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={actualCost}
                        onChange={(e) => setActualCost(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder={`Estimated: $${booking.uber_cost?.toFixed(2) || '0.00'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Actual Tip Given
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={actualTip}
                        onChange={(e) => setActualTip(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="4.00"
                      />
                    </div>
                  </div>
                </div>

                {actualCost && actualTip && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Customer Payment</span>
                        <span className="font-medium">${booking.total_price.toFixed(2)}</span>
                      </div>
                      {booking.subsidy_amount && booking.subsidy_amount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Sponsorship Revenue</span>
                          <span className="font-medium text-green-600">+${booking.subsidy_amount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-semibold border-t border-emerald-200 pt-2">
                        <span className="text-slate-700">Total Revenue</span>
                        <span className="text-slate-900">${(booking.total_price + (booking.subsidy_amount || 0)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Actual Uber Cost</span>
                        <span className="font-medium text-red-600">-${parseFloat(actualCost).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Actual Tip</span>
                        <span className="font-medium text-red-600">-${parseFloat(actualTip).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Stripe Fee</span>
                        <span className="font-medium text-red-600">-${booking.stripe_fee?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="pt-2 border-t border-emerald-300">
                        <div className="flex justify-between font-bold text-lg">
                          <span className="text-slate-900">Net Profit</span>
                          <span className={parseFloat(actualCost) + parseFloat(actualTip) + (booking.stripe_fee || 0) > (booking.total_price + (booking.subsidy_amount || 0)) ? 'text-red-600' : 'text-emerald-600'}>
                            ${((booking.total_price + (booking.subsidy_amount || 0)) - parseFloat(actualCost) - parseFloat(actualTip) - (booking.stripe_fee || 0)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSaveDriverDetails}
                  disabled={saving || !actualCost || !actualTip}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Actual Costs'}
                </button>
              </div>
            </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            Customer Support Chat
          </h2>
          <BookingChat
            bookingId={id!}
            senderType="admin"
            senderName="DropGood Support"
          />
        </div>
      )}
      </div>
    </div>
  );
}
