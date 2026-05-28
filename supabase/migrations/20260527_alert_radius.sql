-- Add per-user configurable alert radius to profiles.
-- Default 5 preserves existing behavior for all current users.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS alert_radius_km INTEGER NOT NULL DEFAULT 5;

-- The old function has 4 params (with p_radius_km DEFAULT 5).
-- CREATE OR REPLACE requires identical signatures, so we drop first.
DROP FUNCTION IF EXISTS find_nearby_opted_in_users(DOUBLE PRECISION, DOUBLE PRECISION, UUID, DOUBLE PRECISION);

CREATE OR REPLACE FUNCTION find_nearby_opted_in_users(
  p_lat      DOUBLE PRECISION,
  p_lng      DOUBLE PRECISION,
  p_owner_id UUID
)
RETURNS TABLE (
  profile_id  UUID,
  email       TEXT,
  distance_km DOUBLE PRECISION
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT profile_id, email, distance_km
  FROM (
    SELECT
      pr.id              AS profile_id,
      au.email           AS email,
      pr.alert_radius_km AS alert_radius_km,
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
  WHERE sub.distance_km <= sub.alert_radius_km
$$;

REVOKE EXECUTE ON FUNCTION find_nearby_opted_in_users(DOUBLE PRECISION, DOUBLE PRECISION, UUID) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION find_nearby_opted_in_users(DOUBLE PRECISION, DOUBLE PRECISION, UUID) TO service_role;
