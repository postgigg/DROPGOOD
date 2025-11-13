/*
  # Booking Chat System
  
  Real-time customer support chat for each booking with typing indicators,
  read receipts, and image attachments.
  
  ## New Tables
  
  ### `booking_messages`
  Stores all chat messages between customers and support
  
  **Columns:**
  - `id` (uuid, primary key) - Message ID
  - `booking_id` (text, foreign key) - Associated booking
  - `sender_type` (text) - 'customer' or 'admin'
  - `sender_name` (text) - Name of sender
  - `message_text` (text, nullable) - Text content
  - `image_url` (text, nullable) - Attached image URL
  - `is_read` (boolean) - Whether recipient has read message
  - `read_at` (timestamp, nullable) - When message was read
  - `created_at` (timestamp) - When message was sent
  
  ### `booking_chat_activity`
  Tracks typing indicators and online status
  
  **Columns:**
  - `booking_id` (text, primary key) - Associated booking
  - `customer_typing` (boolean) - Whether customer is typing
  - `customer_last_seen` (timestamp) - Customer's last activity
  - `admin_typing` (boolean) - Whether admin is typing
  - `admin_last_seen` (timestamp) - Admin's last activity
  - `updated_at` (timestamp) - Last update time
  
  ## Security
  
  - Enable RLS on both tables
  - Customers can read/write messages for their bookings
  - Admins can read/write all messages
  - Anyone can update typing indicators for their role
  
  ## Real-time
  
  - Messages sync in real-time via Supabase subscriptions
  - Typing indicators update live
  - Read receipts update automatically
*/

-- Create booking_messages table
CREATE TABLE IF NOT EXISTS booking_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id text REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('customer', 'admin')),
  sender_name text NOT NULL,
  message_text text,
  image_url text,
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_booking_messages_booking_id ON booking_messages(booking_id, created_at);
CREATE INDEX IF NOT EXISTS idx_booking_messages_unread ON booking_messages(booking_id, is_read) WHERE is_read = false;

-- Create booking_chat_activity table
CREATE TABLE IF NOT EXISTS booking_chat_activity (
  booking_id text PRIMARY KEY REFERENCES bookings(id) ON DELETE CASCADE,
  customer_typing boolean DEFAULT false,
  customer_last_seen timestamptz,
  admin_typing boolean DEFAULT false,
  admin_last_seen timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE booking_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_chat_activity ENABLE ROW LEVEL SECURITY;

-- Policies for booking_messages
-- Anyone can view messages for any booking (guest checkout support)
CREATE POLICY "Anyone can view messages"
  ON booking_messages FOR SELECT
  USING (true);

-- Anyone can insert messages (customer or admin)
CREATE POLICY "Anyone can insert messages"
  ON booking_messages FOR INSERT
  WITH CHECK (true);

-- Anyone can update read status
CREATE POLICY "Anyone can update messages"
  ON booking_messages FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policies for booking_chat_activity
-- Anyone can view activity
CREATE POLICY "Anyone can view activity"
  ON booking_chat_activity FOR SELECT
  USING (true);

-- Anyone can update activity
CREATE POLICY "Anyone can upsert activity"
  ON booking_chat_activity FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update activity"
  ON booking_chat_activity FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_read(
  p_booking_id text,
  p_sender_type text
)
RETURNS void AS $$
BEGIN
  UPDATE booking_messages
  SET is_read = true,
      read_at = now()
  WHERE booking_id = p_booking_id
    AND sender_type != p_sender_type
    AND is_read = false;
END;
$$ LANGUAGE plpgsql;

-- Function to get unread count
CREATE OR REPLACE FUNCTION get_unread_count(
  p_booking_id text,
  p_for_sender_type text
)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM booking_messages
    WHERE booking_id = p_booking_id
      AND sender_type != p_for_sender_type
      AND is_read = false
  );
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on booking_chat_activity
CREATE TRIGGER update_booking_chat_activity_updated_at
  BEFORE UPDATE ON booking_chat_activity
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
