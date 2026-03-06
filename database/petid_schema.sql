
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
  created_at timestamp default now()
);
