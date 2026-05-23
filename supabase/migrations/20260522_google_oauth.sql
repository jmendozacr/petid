-- Auto-create profile when a new user signs up (supports OAuth providers like Google)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, notify_nearby_lost_pets, notification_lat, notification_lng, notification_location_updated_at)
  VALUES (NEW.id, false, NULL, NULL, NULL)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Users can insert their own profile (needed for manual profile creation flows)
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);
