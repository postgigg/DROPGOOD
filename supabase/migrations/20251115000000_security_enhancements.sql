/*
  # Security Enhancements Migration

  Creates tables and indexes for security logging and monitoring

  ## New Tables

  1. `security_logs`
     - Stores security events and violations
     - Used for monitoring and threat detection

  ## Security

  - Enable RLS on security_logs
  - Only service role can write to security logs
  - Admins can read security logs
*/

-- Create security_logs table
CREATE TABLE IF NOT EXISTS public.security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  event_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  ip_address text,
  user_agent text,
  endpoint text,
  method text,
  details jsonb,
  blocked boolean DEFAULT false,

  CONSTRAINT security_logs_event_type_check CHECK (char_length(event_type) <= 100)
);

-- Create indexes for efficient querying
CREATE INDEX idx_security_logs_created_at ON public.security_logs(created_at DESC);
CREATE INDEX idx_security_logs_severity ON public.security_logs(severity) WHERE severity IN ('high', 'critical');
CREATE INDEX idx_security_logs_ip_address ON public.security_logs(ip_address) WHERE blocked = true;
CREATE INDEX idx_security_logs_event_type ON public.security_logs(event_type);

-- Enable RLS
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can insert security logs
CREATE POLICY "Service role can insert security logs"
  ON public.security_logs
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.jwt()->>'role') = 'service_role');

-- Policy: Admins can view all security logs
CREATE POLICY "Admins can view security logs"
  ON public.security_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (SELECT auth.uid())
    )
  );

-- Create function to clean up old security logs (older than 90 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_security_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  DELETE FROM public.security_logs
  WHERE created_at < (NOW() - INTERVAL '90 days');
END;
$$;

-- Create a scheduled job to run cleanup (optional, requires pg_cron extension)
-- SELECT cron.schedule('cleanup-security-logs', '0 2 * * *', 'SELECT public.cleanup_old_security_logs()');

COMMENT ON TABLE public.security_logs IS 'Stores security events and violations for monitoring';
COMMENT ON COLUMN public.security_logs.event_type IS 'Type of security event (e.g., SUSPICIOUS_REQUEST, IP_BLOCKED)';
COMMENT ON COLUMN public.security_logs.severity IS 'Severity level: low, medium, high, critical';
COMMENT ON COLUMN public.security_logs.ip_address IS 'IP address associated with the event';
COMMENT ON COLUMN public.security_logs.details IS 'Additional event details as JSON';
COMMENT ON COLUMN public.security_logs.blocked IS 'Whether the request was blocked';
