-- Read full_name and phone from user metadata when creating the profile.
-- This handles both email signup (our custom data) and Google OAuth (name from provider).
-- The trigger runs with SECURITY DEFINER so it bypasses RLS — safe to write here
-- even before the user has an active session (email confirmation pending).
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    notify_nearby_lost_pets,
    notification_lat,
    notification_lng,
    notification_location_updated_at,
    full_name,
    phone
  )
  VALUES (
    NEW.id,
    false,
    NULL,
    NULL,
    NULL,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name'
    ),
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
