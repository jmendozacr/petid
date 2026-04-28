
-- PetID Database Schema

create table users (
  id uuid primary key,
  email text,
  created_at timestamp default now()
);

create table pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  name text,
  species text,
  breed text,
  birthdate date,
  color text,
  weight numeric,
  microchip_id text,
  photo_url text,
  owner_phone text,
  emergency_contact text,
  is_lost boolean not null default false,
  lost_since timestamp with time zone,
  created_at timestamp default now()
);

create table health_records (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id),
  type text,
  description text,
  record_date date,
  created_at timestamp default now()
);

create table found_reports (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id),
  message text,
  photo_url text,
  location text,
  contact text,
  created_at timestamp default now()
);

CREATE INDEX idx_pets_is_lost ON pets(is_lost) WHERE is_lost = TRUE;

-- ROLLBACK:
-- ALTER TABLE pets DROP COLUMN IF EXISTS is_lost;
-- ALTER TABLE pets DROP COLUMN IF EXISTS lost_since;
-- ALTER TABLE pets DROP COLUMN IF EXISTS owner_phone;
-- ALTER TABLE pets DROP COLUMN IF EXISTS emergency_contact;
-- ALTER TABLE found_reports DROP COLUMN IF EXISTS contact;
-- DROP INDEX IF EXISTS idx_pets_is_lost;
