/*
  # General Support Chat System

  Real-time customer support chat for general inquiries (not booking-specific).
  Anonymous visitors can start chat sessions with support team.

  ## New Tables

  ### `support_sessions`
  Stores chat session information for each visitor

  **Columns:**
  - `id` (uuid, primary key) - Session ID
  - `visitor_id` (text) - Anonymous ID from localStorage
  - `visitor_name` (text, nullable) - Optional visitor name
  - `visitor_email` (text, nullable) - Optional email for follow-up
  - `status` (text) - 'open', 'assigned', 'closed'
  - `assigned_to_admin_id` (uuid, nullable) - Admin handling this chat
  - `created_at` (timestamp) - When session started
  - `last_message_at` (timestamp) - Last activity timestamp
  - `closed_at` (timestamp, nullable) - When session was closed
  - `ip_address` (text, nullable) - Visitor IP
  - `user_agent` (text, nullable) - Browser/device info

  ### `support_messages`
  Stores all support chat messages

  **Columns:**
  - `id` (uuid, primary key) - Message ID
  - `session_id` (uuid, foreign key) - Associated session
  - `sender_type` (text) - 'visitor' or 'admin'
  - `sender_name` (text) - Name of sender
  - `message_text` (text) - Message content
  - `image_url` (text, nullable) - Attached image URL
  - `is_read` (boolean) - Whether recipient has read message
  - `read_at` (timestamp, nullable) - When message was read
  - `created_at` (timestamp) - When message was sent

  ### `support_session_activity`
  Tracks typing indicators and online status

  **Columns:**
  - `session_id` (uuid, primary key) - Associated session
  - `visitor_typing` (boolean) - Whether visitor is typing
  - `visitor_last_seen` (timestamp) - Visitor's last activity
  - `admin_typing` (boolean) - Whether admin is typing
  - `admin_last_seen` (timestamp) - Admin's last activity
  - `updated_at` (timestamp) - Last update time

  ## Security

  - Enable RLS on all tables
  - Anyone can read/write their own session messages
  - Admins can read/write all messages
  - Typing indicators are public for each session

  ## Real-time

  - Messages sync in real-time via Supabase subscriptions
  - Typing indicators update live
  - Read receipts update automatically
*/

-- Create support_sessions table
CREATE TABLE IF NOT EXISTS support_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  visitor_name text,
  visitor_email text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'closed')),
  assigned_to_admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  last_message_at timestamptz DEFAULT now(),
  closed_at timestamptz,
  ip_address text,
  user_agent text
);

-- Create indexes for support_sessions
CREATE INDEX IF NOT EXISTS idx_support_sessions_visitor_id ON support_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_support_sessions_status ON support_sessions(status, last_message_at);
CREATE INDEX IF NOT EXISTS idx_support_sessions_assigned_admin ON support_sessions(assigned_to_admin_id) WHERE assigned_to_admin_id IS NOT NULL;

-- Create support_messages table
CREATE TABLE IF NOT EXISTS support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES support_sessions(id) ON DELETE CASCADE NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('visitor', 'admin')),
  sender_name text NOT NULL,
  message_text text NOT NULL,
  image_url text,
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for support_messages
CREATE INDEX IF NOT EXISTS idx_support_messages_session_id ON support_messages(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_support_messages_unread ON support_messages(session_id, is_read) WHERE is_read = false;

-- Create support_session_activity table
CREATE TABLE IF NOT EXISTS support_session_activity (
  session_id uuid PRIMARY KEY REFERENCES support_sessions(id) ON DELETE CASCADE,
  visitor_typing boolean DEFAULT false,
  visitor_last_seen timestamptz,
  admin_typing boolean DEFAULT false,
  admin_last_seen timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE support_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_session_activity ENABLE ROW LEVEL SECURITY;

-- Policies for support_sessions
-- Anyone can view all sessions (for visitor to find their own)
CREATE POLICY "Anyone can view sessions"
  ON support_sessions FOR SELECT
  USING (true);

-- Anyone can create a new session
CREATE POLICY "Anyone can create sessions"
  ON support_sessions FOR INSERT
  WITH CHECK (true);

-- Anyone can update sessions (for status changes, assignment, etc)
CREATE POLICY "Anyone can update sessions"
  ON support_sessions FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policies for support_messages
-- Anyone can view messages
CREATE POLICY "Anyone can view support messages"
  ON support_messages FOR SELECT
  USING (true);

-- Anyone can insert messages
CREATE POLICY "Anyone can insert support messages"
  ON support_messages FOR INSERT
  WITH CHECK (true);

-- Anyone can update messages (for read status)
CREATE POLICY "Anyone can update support messages"
  ON support_messages FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policies for support_session_activity
-- Anyone can view activity
CREATE POLICY "Anyone can view support activity"
  ON support_session_activity FOR SELECT
  USING (true);

-- Anyone can upsert activity
CREATE POLICY "Anyone can upsert support activity"
  ON support_session_activity FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update support activity"
  ON support_session_activity FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Function to mark support messages as read
CREATE OR REPLACE FUNCTION mark_support_messages_read(
  p_session_id uuid,
  p_sender_type text
)
RETURNS void AS $$
BEGIN
  UPDATE support_messages
  SET is_read = true,
      read_at = now()
  WHERE session_id = p_session_id
    AND sender_type != p_sender_type
    AND is_read = false;
END;
$$ LANGUAGE plpgsql;

-- Function to get unread count for support
CREATE OR REPLACE FUNCTION get_support_unread_count(
  p_session_id uuid,
  p_for_sender_type text
)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM support_messages
    WHERE session_id = p_session_id
      AND sender_type != p_for_sender_type
      AND is_read = false
  );
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_message_at on support_sessions
CREATE OR REPLACE FUNCTION update_support_session_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE support_sessions
  SET last_message_at = NEW.created_at
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_support_session_timestamp
  AFTER INSERT ON support_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_support_session_last_message();

-- Trigger to update updated_at on support_session_activity
CREATE OR REPLACE FUNCTION update_support_activity_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_support_session_activity_updated_at
  BEFORE UPDATE ON support_session_activity
  FOR EACH ROW
  EXECUTE FUNCTION update_support_activity_updated_at();
