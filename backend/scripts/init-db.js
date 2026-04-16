import "dotenv/config";
import { readFile } from "fs/promises";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const { Pool } = pg;

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..", "..");

const connectionString =
  process.env.DATABASE_URL ||
  "postgres://booking_user:booking_pass@localhost:5432/booking_mvp";

async function run() {
  const pool = new Pool({ connectionString });

  try {
    const schemaSql = await readFile(
      resolve(projectRoot, "database", "schema.sql"),
      "utf8"
    );
    const seedSql = await readFile(
      resolve(projectRoot, "database", "seed.sql"),
      "utf8"
    );

    await pool.query(schemaSql);
    await pool.query(seedSql);

    console.log("Database schema and seed applied successfully.");
  } catch (error) {
    console.error("Database initialization failed:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();

