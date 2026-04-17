import { createServer } from "http";
import app from "./app.js";
import { pool } from "./config/db.js";
import { runMigrations } from "./config/runMigrations.js";
import { setupNotificationWebSocket } from "./ws/notificationsServer.js";

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await pool.query("SELECT 1");
    await runMigrations();
    const server = createServer(app);
    setupNotificationWebSocket(server);
    server.listen(PORT, () => {
      console.log(`API server started on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}

start();
