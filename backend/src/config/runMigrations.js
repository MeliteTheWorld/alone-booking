import { pool } from "./db.js";

const migrations = [
  "ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'in_progress'",
  "ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'completed'",
  "ALTER TABLE services ADD COLUMN IF NOT EXISTS staff_name VARCHAR(160) NOT NULL DEFAULT 'Не назначен'"
];

export async function runMigrations() {
  for (const statement of migrations) {
    await pool.query(statement);
  }
}
