import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, MapPin, Phone, Package, Clock, Zap, CheckCircle2, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  pickup_address: string;
  pickup_date: string;
  pickup_time: string;
  items_description: string;
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
  photo_urls: string[];
  created_at: string;
  messages_confirmed: boolean;
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  icon: any;
}

const COLUMNS: KanbanColumn[] = [
  { id: 'payment_pending', title: 'Payment Pending', color: 'bg-gray-600', icon: Clock },
  { id: 'scheduled', title: 'Scheduled', color: 'bg-blue-600', icon: Calendar },
  { id: 'pending_driver', title: 'Finding Driver', color: 'bg-yellow-600', icon: Clock },
  { id: 'driver_assigned', title: 'Driver Assigned', color: 'bg-blue-700', icon: Zap },
  { id: 'driver_arrived', title: 'Driver Arrived', color: 'bg-purple-600', icon: MapPin },
  { id: 'picked_up', title: 'Picked Up', color: 'bg-indigo-600', icon: Package },
  { id: 'in_transit', title: 'In Transit', color: 'bg-blue-500', icon: Zap },
  { id: 'completed', title: 'Completed', color: 'bg-gray-900', icon: CheckCircle2 },
];

const STATUS_STEPS = [
  'payment_pending',
  'scheduled',
  'pending_driver',
  'driver_assigned',
  'driver_arrived',
  'picked_up',
  'in_transit',
  'completed',
];

function BookingCard({ booking, onStatusUpdate }: { booking: Booking; onStatusUpdate: (bookingId: string, newStatus: string) => void }) {
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: booking.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const currentStepIndex = STATUS_STEPS.findIndex(s => s === booking.status);
  const nextStep = STATUS_STEPS[currentStepIndex + 1];
  const nextStepLabel = COLUMNS.find(c => c.id === nextStep)?.title;

  const handleStatusUpdate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!nextStep) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: nextStep })
        .eq('id', booking.id);

      if (error) throw error;
      onStatusUpdate(booking.id, nextStep);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => navigate(`/admin/bookings/${booking.id}`)}
      className="bg-white rounded-lg p-3 shadow hover:shadow-lg transition-all cursor-grab active:cursor-grabbing border border-gray-200 hover:border-blue-500 mb-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900">{booking.customer_name}</h3>
          <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-0.5">
            <Phone className="w-3 h-3 text-gray-500" />
            <span>{booking.customer_phone}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-blue-600">
            ${booking.total_price.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Date & Time */}
      <div className="flex items-center gap-1.5 mb-2 px-2 py-1 bg-gray-50 rounded text-xs">
        <Calendar className="w-3 h-3 text-gray-600" />
        <span className="font-medium text-gray-700">
          {new Date(booking.pickup_date).toLocaleDateString()} at {booking.pickup_time}
        </span>
      </div>

      {/* Pickup */}
      <div className="flex items-start gap-1.5 mb-1.5">
        <MapPin className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-500">PICKUP</p>
          <p className="text-xs text-gray-900 truncate">{booking.pickup_address}</p>
        </div>
      </div>

      {/* Donation Center */}
      <div className="flex items-start gap-1.5 mb-2">
        <MapPin className="w-3 h-3 text-gray-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-500">DROPOFF</p>
          <p className="text-xs text-gray-900 truncate">{booking.donation_center_name}</p>
        </div>
      </div>

      {/* Status Action Button */}
      {nextStep && (
        <button
          onClick={handleStatusUpdate}
          disabled={updating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 px-2 rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
        >
          {updating ? (
            'Updating...'
          ) : (
            <>
              <ChevronRight className="w-3 h-3" />
              Move to {nextStepLabel}
            </>
          )}
        </button>
      )}

      {/* Badges */}
      {(booking.manual_mode || booking.messages_confirmed) && (
        <div className="flex items-center gap-1 mt-2">
          {booking.manual_mode && (
            <span className="px-1.5 py-0.5 bg-red-600 text-white text-xs font-semibold rounded">
              MANUAL
            </span>
          )}
          {booking.messages_confirmed && (
            <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded flex items-center gap-0.5">
              <CheckCircle2 className="w-2.5 h-2.5" />
              CONFIRMED
            </span>
          )}
        </div>
      )}
    </div>
  );
}

interface Props {
  bookings: Booking[];
  onUpdateBooking: (bookingId: string, newStatus: string) => void;
}

export default function BookingKanban({ bookings, onUpdateBooking }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeBooking = bookings.find(b => b.id === active.id);
    if (!activeBooking) {
      setActiveId(null);
      return;
    }

    const overColumnId = over.id as string;
    const targetColumn = COLUMNS.find(col => col.id === overColumnId);

    if (targetColumn && activeBooking.status !== targetColumn.id) {
      try {
        const { error } = await supabase
          .from('bookings')
          .update({ status: targetColumn.id })
          .eq('id', activeBooking.id);

        if (error) throw error;
        onUpdateBooking(activeBooking.id, targetColumn.id);
      } catch (error) {
        console.error('Error updating status:', error);
      }
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const getColumnBookings = (columnId: string) => {
    return bookings.filter(booking => booking.status === columnId);
  };

  const activeBooking = activeId ? bookings.find(b => b.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 overflow-x-auto">
        {COLUMNS.map((column) => {
          const Icon = column.icon;
          const columnBookings = getColumnBookings(column.id);

          return (
            <div key={column.id} className="flex flex-col min-w-[250px]">
              {/* Column Header */}
              <div className={`${column.color} rounded-lg p-3 mb-3 shadow-sm`}>
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-white/20 rounded">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold">{column.title}</h2>
                      <p className="text-xs font-medium opacity-90">
                        {columnBookings.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drop Zone */}
              <SortableContext
                id={column.id}
                items={columnBookings.map(b => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex-1 bg-white rounded-lg p-2 min-h-[400px] border-2 border-dashed border-gray-300">
                  {columnBookings.length === 0 ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="text-center">
                        <Icon className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                        <p className="text-gray-500 font-medium text-xs">No bookings</p>
                      </div>
                    </div>
                  ) : (
                    columnBookings.map((booking) => (
                      <BookingCard key={booking.id} booking={booking} onStatusUpdate={onUpdateBooking} />
                    ))
                  )}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeBooking ? (
          <div className="rotate-2 scale-105 opacity-90">
            <BookingCard booking={activeBooking} onStatusUpdate={onUpdateBooking} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
