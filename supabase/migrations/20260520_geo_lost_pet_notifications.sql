-- pets: store location when marked as lost
ALTER TABLE pets
  ADD COLUMN IF NOT EXISTS lost_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS lost_lng DOUBLE PRECISION;

-- profiles: notification opt-in + alert location
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS notify_nearby_lost_pets BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notification_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS notification_lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS notification_location_updated_at TIMESTAMPTZ;

-- audit log + dedup table
CREATE TABLE IF NOT EXISTS lost_pet_notifications (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id           UUID         NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  notified_user_id UUID         NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sent_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  channel          TEXT         NOT NULL DEFAULT 'email'
);

-- index for fast dedup queries
CREATE INDEX IF NOT EXISTS lost_pet_notifications_pet_sent_idx
  ON lost_pet_notifications (pet_id, sent_at DESC);

-- RLS for lost_pet_notifications
ALTER TABLE lost_pet_notifications ENABLE ROW LEVEL SECURITY;

-- Users can read notifications sent to them
CREATE POLICY "Users read own notifications"
  ON lost_pet_notifications
  FOR SELECT
  USING (notified_user_id = auth.uid());

-- Only service role can insert (Edge Function)
-- No INSERT/UPDATE/DELETE policy for authenticated users

-- SECURITY DEFINER needed to join auth.users (not accessible from public schema)
CREATE OR REPLACE FUNCTION find_nearby_opted_in_users(
  p_lat        DOUBLE PRECISION,
  p_lng        DOUBLE PRECISION,
  p_owner_id   UUID,
  p_radius_km  DOUBLE PRECISION DEFAULT 5
)
RETURNS TABLE (
  profile_id UUID,
  email      TEXT,
  distance_km DOUBLE PRECISION
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT profile_id, email, distance_km
  FROM (
    SELECT
      pr.id    AS profile_id,
      au.email AS email,
      6371 * acos(
        LEAST(1.0,
          cos(radians(p_lat)) * cos(radians(pr.notification_lat))
          * cos(radians(pr.notification_lng) - radians(p_lng))
          + sin(radians(p_lat)) * sin(radians(pr.notification_lat))
        )
      ) AS distance_km
    FROM profiles pr
    JOIN auth.users au ON au.id = pr.id
    WHERE
      pr.notify_nearby_lost_pets = true
      AND pr.notification_lat    IS NOT NULL
      AND pr.notification_lng    IS NOT NULL
      AND pr.id != p_owner_id
  ) sub
  WHERE sub.distance_km <= p_radius_km
$$;

-- Only service role can call this function
REVOKE EXECUTE ON FUNCTION find_nearby_opted_in_users FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION find_nearby_opted_in_users TO service_role;

-- pg_net trigger for calling the Edge Function when a pet is marked lost
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;

CREATE OR REPLACE FUNCTION notify_lost_pet_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.is_lost = true AND (OLD.is_lost IS DISTINCT FROM true) THEN
    PERFORM net.http_post(
      url     := 'https://judarnzcbuidbberzhtu.supabase.co/functions/v1/notify-lost-pet'::text,
      body    := json_build_object('record', row_to_json(NEW))::jsonb,
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZGFybnpjYnVpZGJiZXJ6aHR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NDUwODYsImV4cCI6MjA4ODQyMTA4Nn0.PLIPmicH6XuNc2GqwWDs16X5pKDMhixArGwUFvzDG_0'
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_pet_marked_lost
  AFTER UPDATE ON pets
  FOR EACH ROW
  EXECUTE FUNCTION notify_lost_pet_webhook();
