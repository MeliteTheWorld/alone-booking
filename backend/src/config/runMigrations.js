import { pool } from "./db.js";

const migrations = [
  "ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'in_progress'",
  "ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'completed'",
  "CREATE TABLE IF NOT EXISTS workers (id SERIAL PRIMARY KEY, first_name VARCHAR(80) NOT NULL, last_name VARCHAR(80) NOT NULL, position VARCHAR(120) NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT NOW(), updated_at TIMESTAMP NOT NULL DEFAULT NOW())",
  "CREATE INDEX IF NOT EXISTS idx_workers_name ON workers (last_name, first_name)",
  "ALTER TABLE services ADD COLUMN IF NOT EXISTS staff_name VARCHAR(160) NOT NULL DEFAULT 'Не назначен'",
  "ALTER TABLE services ADD COLUMN IF NOT EXISTS worker_id INTEGER REFERENCES workers(id) ON DELETE SET NULL",
  "ALTER TABLE services ADD COLUMN IF NOT EXISTS buffer_after_minutes INTEGER NOT NULL DEFAULT 0",
  "CREATE INDEX IF NOT EXISTS idx_services_worker ON services (worker_id)",
  "CREATE TABLE IF NOT EXISTS service_workers (service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE, worker_id INTEGER NOT NULL REFERENCES workers(id) ON DELETE CASCADE, created_at TIMESTAMP NOT NULL DEFAULT NOW(), PRIMARY KEY (service_id, worker_id))",
  "ALTER TABLE service_workers ADD COLUMN IF NOT EXISTS duration_minutes INTEGER",
  "ALTER TABLE service_workers ADD COLUMN IF NOT EXISTS buffer_after_minutes INTEGER",
  "CREATE INDEX IF NOT EXISTS idx_service_workers_worker ON service_workers (worker_id)",
  "CREATE TABLE IF NOT EXISTS worker_business_hours (worker_id INTEGER NOT NULL REFERENCES workers(id) ON DELETE CASCADE, day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), start_time TIME NOT NULL, end_time TIME NOT NULL, is_working BOOLEAN NOT NULL DEFAULT true, PRIMARY KEY (worker_id, day_of_week))",
  "CREATE INDEX IF NOT EXISTS idx_worker_business_hours_worker ON worker_business_hours (worker_id, day_of_week)",
  "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS worker_id INTEGER REFERENCES workers(id) ON DELETE SET NULL",
  "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS duration_minutes INTEGER NOT NULL DEFAULT 0",
  "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS buffer_after_minutes INTEGER NOT NULL DEFAULT 0",
  "CREATE INDEX IF NOT EXISTS idx_bookings_worker ON bookings (worker_id)",
  "UPDATE bookings b SET duration_minutes = s.duration FROM services s WHERE b.service_id = s.id AND COALESCE(b.duration_minutes, 0) = 0",
  "UPDATE bookings b SET buffer_after_minutes = s.buffer_after_minutes FROM services s WHERE b.service_id = s.id AND COALESCE(b.buffer_after_minutes, 0) = 0",
  "INSERT INTO worker_business_hours (worker_id, day_of_week, start_time, end_time, is_working) SELECT w.id, bh.day_of_week, bh.start_time, bh.end_time, bh.is_working FROM workers w CROSS JOIN business_hours bh ON CONFLICT (worker_id, day_of_week) DO NOTHING",
  "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_key VARCHAR(64)",
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_unique_active_user_slot ON bookings (user_id, booking_date, booking_time) WHERE status IN ('pending', 'confirmed', 'in_progress')",
  "CREATE TABLE IF NOT EXISTS notifications (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, type VARCHAR(80) NOT NULL, title VARCHAR(180) NOT NULL, message TEXT NOT NULL, link_path VARCHAR(240), entity_id INTEGER, is_read BOOLEAN NOT NULL DEFAULT false, read_at TIMESTAMP, created_at TIMESTAMP NOT NULL DEFAULT NOW())",
  "CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications (user_id, created_at DESC)",
  "CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications (user_id, is_read, created_at DESC)"
];

export async function runMigrations() {
  for (const statement of migrations) {
    await pool.query(statement);
  }
}
