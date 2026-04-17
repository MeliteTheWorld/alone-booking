import { Router } from "express";
import { pool, query } from "../config/db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

const serviceSelect = `
  SELECT
    s.id,
    s.name,
    s.description,
    s.duration,
    s.price,
    s.is_active,
    s.created_at,
    s.updated_at,
    s.worker_id,
    CASE
      WHEN COUNT(w.id) = 0 THEN 'Не назначен'
      WHEN COUNT(w.id) = 1 THEN MAX(TRIM(CONCAT(w.last_name, ' ', w.first_name)))
      ELSE CONCAT('Выбор из ', COUNT(w.id), ' сотрудников')
    END AS staff_name,
    COUNT(w.id)::int AS workers_count,
    COALESCE(
      json_agg(
        DISTINCT jsonb_build_object(
          'id', w.id,
          'first_name', w.first_name,
          'last_name', w.last_name,
          'full_name', TRIM(CONCAT(w.last_name, ' ', w.first_name)),
          'position', w.position
        )
      ) FILTER (WHERE w.id IS NOT NULL),
      '[]'::json
    ) AS workers
  FROM services s
  LEFT JOIN service_workers sw ON sw.service_id = s.id
  LEFT JOIN workers w ON w.id = sw.worker_id
`;

async function resolveWorkers(workerIds, executor = query) {
  if (!workerIds.length) {
    return [];
  }

  const result = await executor(
    `
      SELECT
        id,
        first_name,
        last_name,
        position,
        TRIM(CONCAT(last_name, ' ', first_name)) AS full_name
      FROM workers
      WHERE id = ANY($1::int[])
      ORDER BY last_name, first_name
    `,
    [workerIds]
  );

  return result.rows;
}

function normalizeNumeric(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : null;
}

function normalizeWorkerIds(workerIds) {
  if (!Array.isArray(workerIds)) {
    return [];
  }

  return [...new Set(workerIds.map(normalizeNumeric).filter(Boolean))];
}

async function syncServiceWorkers(serviceId, workerIds, executor) {
  await executor("DELETE FROM service_workers WHERE service_id = $1", [serviceId]);

  if (!workerIds.length) {
    return;
  }

  for (const workerId of workerIds) {
    await executor(
      `
        INSERT INTO service_workers (service_id, worker_id)
        VALUES ($1, $2)
      `,
      [serviceId, workerId]
    );
  }
}

router.get("/", async (_req, res) => {
  try {
    const result = await query(
      `${serviceSelect}
       WHERE s.is_active = true
       GROUP BY s.id
       ORDER BY s.created_at DESC`
    );
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ message: "Не удалось загрузить услуги" });
  }
});

router.get(
  "/admin/all",
  requireAuth,
  requireRole("admin"),
  async (_req, res) => {
    try {
      const result = await query(
        `${serviceSelect}
         GROUP BY s.id
         ORDER BY s.is_active DESC, s.created_at DESC`
      );
      return res.json(result.rows);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Не удалось загрузить все услуги" });
    }
  }
);

router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  const client = await pool.connect();

  try {
    const { name, description, duration, price, is_active } = req.body;
    const workerIds = normalizeWorkerIds(req.body.worker_ids);

    if (!name?.trim() || !duration || price === undefined || price === null) {
      return res.status(400).json({
        message: "Название, длительность и цена обязательны"
      });
    }

    const workers = await resolveWorkers(workerIds, client.query.bind(client));

    if (workers.length !== workerIds.length) {
      return res.status(400).json({ message: "Часть выбранных работников не найдена" });
    }

    const staffName =
      workers.length === 0
        ? "Не назначен"
        : workers.length === 1
          ? workers[0].full_name
          : `Выбор из ${workers.length} сотрудников`;

    await client.query("BEGIN");

    const result = await client.query(
      `
        INSERT INTO services (
          name,
          description,
          staff_name,
          worker_id,
          duration,
          price,
          is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `,
      [
        name.trim(),
        description?.trim() || "",
        staffName,
        workers[0]?.id || null,
        duration,
        price,
        is_active ?? true
      ]
    );

    await syncServiceWorkers(result.rows[0].id, workerIds, client.query.bind(client));
    await client.query("COMMIT");

    const created = await query(`${serviceSelect} WHERE s.id = $1 GROUP BY s.id`, [
      result.rows[0].id
    ]);

    return res.status(201).json(created.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    return res.status(500).json({ message: "Не удалось создать услугу" });
  } finally {
    client.release();
  }
});

router.put("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { name, description, duration, price, is_active } = req.body;
    const workerIds = normalizeWorkerIds(req.body.worker_ids);

    if (!name?.trim() || !duration || price === undefined || price === null) {
      return res.status(400).json({
        message: "Название, длительность и цена обязательны"
      });
    }

    const workers = await resolveWorkers(workerIds, client.query.bind(client));

    if (workers.length !== workerIds.length) {
      return res.status(400).json({ message: "Часть выбранных работников не найдена" });
    }

    const staffName =
      workers.length === 0
        ? "Не назначен"
        : workers.length === 1
          ? workers[0].full_name
          : `Выбор из ${workers.length} сотрудников`;

    await client.query("BEGIN");

    const result = await client.query(
      `
        UPDATE services
        SET name = $1,
            description = $2,
            staff_name = $3,
            worker_id = $4,
            duration = $5,
            price = $6,
            is_active = $7,
            updated_at = NOW()
        WHERE id = $8
        RETURNING id
      `,
      [
        name.trim(),
        description?.trim() || "",
        staffName,
        workers[0]?.id || null,
        duration,
        price,
        Boolean(is_active),
        id
      ]
    );

    if (!result.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Услуга не найдена" });
    }

    await syncServiceWorkers(id, workerIds, client.query.bind(client));
    await client.query("COMMIT");

    const updated = await query(`${serviceSelect} WHERE s.id = $1 GROUP BY s.id`, [
      id
    ]);
    return res.json(updated.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    return res.status(500).json({ message: "Не удалось обновить услугу" });
  } finally {
    client.release();
  }
});

router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `
        UPDATE services
        SET is_active = false, updated_at = NOW()
        WHERE id = $1
        RETURNING id
      `,
      [id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: "Услуга не найдена" });
    }

    return res.json({ message: "Услуга скрыта из каталога" });
  } catch (error) {
    return res.status(500).json({ message: "Не удалось удалить услугу" });
  }
});

router.delete(
  "/:id/permanent",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    const client = await pool.connect();

    try {
      const { id } = req.params;
      const bookingUsage = await client.query(
        `
          SELECT COUNT(*)::int AS count
          FROM bookings
          WHERE service_id = $1
        `,
        [id]
      );

      if (bookingUsage.rows[0].count > 0) {
        return res.status(400).json({
          message:
            "Нельзя полностью удалить услугу, по ней уже есть записи. Сначала удалите связанные записи или оставьте услугу скрытой."
        });
      }

      await client.query("BEGIN");
      await client.query("DELETE FROM service_workers WHERE service_id = $1", [id]);
      const deleted = await client.query(
        `
          DELETE FROM services
          WHERE id = $1
          RETURNING id
        `,
        [id]
      );

      if (!deleted.rowCount) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "Услуга не найдена" });
      }

      await client.query("COMMIT");
      return res.json({ message: "Услуга полностью удалена" });
    } catch (error) {
      await client.query("ROLLBACK").catch(() => {});
      return res.status(500).json({ message: "Не удалось полностью удалить услугу" });
    } finally {
      client.release();
    }
  }
);

export default router;
