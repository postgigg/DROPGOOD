import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type DonationCenter = {
  id: string;
  name: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude: number;
  longitude: number;
  distance_miles?: number;
  is_sponsored: boolean;
  accepted_items: string[];
  hours: Record<string, any>;
  rating: number;
  total_donations_received: number;
  logo_url?: string;
  phone?: string;
};

export type Booking = {
  id: string;
  user_id: string;
  donation_center_id: string;
  pickup_street_address: string;
  pickup_city: string;
  pickup_state: string;
  pickup_zip_code: string;
  pickup_latitude: number;
  pickup_longitude: number;
  pickup_instructions?: string;
  pickup_location_type: string;
  dropoff_street_address: string;
  dropoff_city: string;
  dropoff_state: string;
  dropoff_zip_code: string;
  dropoff_latitude: number;
  dropoff_longitude: number;
  distance_miles: number;
  duration_minutes: number;
  scheduled_date: string;
  scheduled_time_start: string;
  scheduled_time_end: string;
  items_count: number;
  items_types: string[];
  items_description?: string;
  photo_urls?: string[];
  uber_cost: number;
  our_markup: number;
  subtotal: number;
  stripe_fee: number;
  total_price: number;
  status: string;
  created_at: string;
};
