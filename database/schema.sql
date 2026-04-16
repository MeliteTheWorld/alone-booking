DO $$
BEGIN
  CREATE TYPE user_role AS ENUM ('client', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'in_progress';
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'completed';

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  avatar_key VARCHAR(64),
  role user_role NOT NULL DEFAULT 'client',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(160) NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  staff_name VARCHAR(160) NOT NULL DEFAULT 'Не назначен',
  duration INTEGER NOT NULL CHECK (duration > 0),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS business_hours (
  day_of_week SMALLINT PRIMARY KEY CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_working BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(booking_date, booking_time);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_unique_active_user_slot
  ON bookings(user_id, booking_date, booking_time)
  WHERE status IN ('pending', 'confirmed', 'in_progress');
