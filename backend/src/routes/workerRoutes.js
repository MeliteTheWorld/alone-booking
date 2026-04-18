import { Router } from "express";
import { pool, query } from "../config/db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

const workerSelect = `
  SELECT
    w.id,
    w.first_name,
    w.last_name,
    w.position,
    w.created_at,
    w.updated_at,
    TRIM(CONCAT(w.last_name, ' ', w.first_name)) AS full_name,
    COUNT(s.id)::int AS services_count
  FROM workers w
  LEFT JOIN service_workers sw ON sw.worker_id = w.id
  LEFT JOIN services s ON s.id = sw.service_id AND s.is_active = true
`;

const defaultSchedule = Array.from({ length: 7 }, (_, dayOfWeek) => ({
  day_of_week: dayOfWeek,
  start_time: "10:00",
  end_time: "18:00",
  is_working: dayOfWeek !== 0
}));

function normalizePayload(body = {}) {
  return {
    firstName: body.first_name?.trim() || "",
    lastName: body.last_name?.trim() || "",
    position: body.position?.trim() || ""
  };
}

function normalizeTimeValue(value, fallback) {
  return typeof value === "string" && /^\d{2}:\d{2}/.test(value)
    ? value.slice(0, 5)
    : fallback;
}

function normalizeSchedule(payload) {
  if (!Array.isArray(payload)) {
    return defaultSchedule;
  }

  const byDay = new Map(
    payload
      .map((item) => ({
        day_of_week: Number(item?.day_of_week),
        start_time: normalizeTimeValue(item?.start_time, "10:00"),
        end_time: normalizeTimeValue(item?.end_time, "18:00"),
        is_working: Boolean(item?.is_working)
      }))
      .filter((item) => Number.isInteger(item.day_of_week) && item.day_of_week >= 0 && item.day_of_week <= 6)
      .map((item) => [item.day_of_week, item])
  );

  return defaultSchedule.map((fallbackDay) => ({
    ...fallbackDay,
    ...(byDay.get(fallbackDay.day_of_week) || {})
  }));
}

async function getWorkerSchedules(workerIds, executor = query) {
  if (!workerIds.length) {
    return new Map();
  }

  const result = await executor(
    `
      SELECT
        worker_id,
        day_of_week,
        start_time,
        end_time,
        is_working
      FROM worker_business_hours
      WHERE worker_id = ANY($1::int[])
      ORDER BY worker_id ASC, day_of_week ASC
    `,
    [workerIds]
  );

  return result.rows.reduce((acc, row) => {
    const list = acc.get(row.worker_id) || [];
    list.push({
      day_of_week: row.day_of_week,
      start_time: String(row.start_time).slice(0, 5),
      end_time: String(row.end_time).slice(0, 5),
      is_working: row.is_working
    });
    acc.set(row.worker_id, list);
    return acc;
  }, new Map());
}

async function hydrateWorkerRows(rows, executor = query) {
  const schedulesByWorker = await getWorkerSchedules(
    rows.map((row) => row.id),
    executor
  );

  return rows.map((row) => ({
    ...row,
    schedule:
      schedulesByWorker.get(row.id) ||
      defaultSchedule.map((day) => ({ ...day }))
  }));
}

async function upsertWorkerSchedule(workerId, schedule, executor) {
  for (const day of normalizeSchedule(schedule)) {
    await executor(
      `
        INSERT INTO worker_business_hours (
          worker_id,
          day_of_week,
          start_time,
          end_time,
          is_working
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (worker_id, day_of_week)
        DO UPDATE SET
          start_time = EXCLUDED.start_time,
          end_time = EXCLUDED.end_time,
          is_working = EXCLUDED.is_working
      `,
      [
        workerId,
        day.day_of_week,
        day.start_time,
        day.end_time,
        day.is_working
      ]
    );
  }
}

router.get("/", requireAuth, requireRole("admin"), async (_req, res) => {
  try {
    const result = await query(
      `
        ${workerSelect}
        GROUP BY w.id
        ORDER BY w.last_name, w.first_name
      `
    );
    return res.json(await hydrateWorkerRows(result.rows));
  } catch (error) {
    return res.status(500).json({ message: "Не удалось загрузить работников" });
  }
});

router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { firstName, lastName, position } = normalizePayload(req.body);
    const schedule = normalizeSchedule(req.body.schedule);

    if (!firstName || !lastName || !position) {
      return res.status(400).json({
        message: "Имя, фамилия и должность обязательны"
      });
    }

    const created = await query(
      `
        INSERT INTO workers (first_name, last_name, position)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      [firstName, lastName, position]
    );

    await upsertWorkerSchedule(created.rows[0].id, schedule, query);

    const result = await query(
      `
        ${workerSelect}
        WHERE w.id = $1
        GROUP BY w.id
      `,
      [created.rows[0].id]
    );

    return res.status(201).json((await hydrateWorkerRows(result.rows))[0]);
  } catch (error) {
    return res.status(500).json({ message: "Не удалось создать работника" });
  }
});

router.put("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, position } = normalizePayload(req.body);
    const schedule = normalizeSchedule(req.body.schedule);

    if (!firstName || !lastName || !position) {
      return res.status(400).json({
        message: "Имя, фамилия и должность обязательны"
      });
    }

    const updated = await query(
      `
        UPDATE workers
        SET first_name = $1,
            last_name = $2,
            position = $3,
            updated_at = NOW()
        WHERE id = $4
        RETURNING id
      `,
      [firstName, lastName, position, id]
    );

    if (!updated.rowCount) {
      return res.status(404).json({ message: "Работник не найден" });
    }

    await upsertWorkerSchedule(id, schedule, query);

    const result = await query(
      `
        ${workerSelect}
        WHERE w.id = $1
        GROUP BY w.id
      `,
      [id]
    );

    return res.json((await hydrateWorkerRows(result.rows))[0]);
  } catch (error) {
    return res.status(500).json({ message: "Не удалось обновить работника" });
  }
});

router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    await client.query("BEGIN");

    const existing = await client.query("SELECT id FROM workers WHERE id = $1", [id]);

    if (!existing.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Работник не найден" });
    }

    await client.query("DELETE FROM workers WHERE id = $1", [id]);
    await client.query("COMMIT");

    return res.json({ message: "Работник удалён" });
  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).json({ message: "Не удалось удалить работника" });
  } finally {
    client.release();
  }
});

export default router;
