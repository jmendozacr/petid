-- Add owner profile fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Update handle_new_user() to also initialise the new columns
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, notify_nearby_lost_pets, notification_lat, notification_lng, notification_location_updated_at, full_name, phone)
  VALUES (NEW.id, false, NULL, NULL, NULL, NULL, NULL)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
