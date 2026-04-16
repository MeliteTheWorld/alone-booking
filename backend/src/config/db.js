import pg from "pg";

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL ||
  "postgres://booking_user:booking_pass@localhost:5433/booking_mvp";

export const pool = new Pool({
  connectionString
});

export const query = (text, params = []) => pool.query(text, params);
