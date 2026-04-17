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

function normalizePayload(body = {}) {
  return {
    firstName: body.first_name?.trim() || "",
    lastName: body.last_name?.trim() || "",
    position: body.position?.trim() || ""
  };
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
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ message: "Не удалось загрузить работников" });
  }
});

router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { firstName, lastName, position } = normalizePayload(req.body);

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

    const result = await query(
      `
        ${workerSelect}
        WHERE w.id = $1
        GROUP BY w.id
      `,
      [created.rows[0].id]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Не удалось создать работника" });
  }
});

router.put("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, position } = normalizePayload(req.body);

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

    const result = await query(
      `
        ${workerSelect}
        WHERE w.id = $1
        GROUP BY w.id
      `,
      [id]
    );

    return res.json(result.rows[0]);
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
