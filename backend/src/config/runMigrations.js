import { pool } from "./db.js";

const migrations = [
  "ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'in_progress'",
  "ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'completed'",
  "ALTER TABLE services ADD COLUMN IF NOT EXISTS staff_name VARCHAR(160) NOT NULL DEFAULT 'Не назначен'",
  "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_key VARCHAR(64)",
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_unique_active_user_slot ON bookings (user_id, booking_date, booking_time) WHERE status IN ('pending', 'confirmed', 'in_progress')"
];

export async function runMigrations() {
  for (const statement of migrations) {
    await pool.query(statement);
  }
}
