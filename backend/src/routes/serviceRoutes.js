import { Router } from "express";
import { query } from "../config/db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const result = await query(
      "SELECT * FROM services WHERE is_active = true ORDER BY created_at DESC"
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
      const result = await query("SELECT * FROM services ORDER BY created_at DESC");
      return res.json(result.rows);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Не удалось загрузить все услуги" });
    }
  }
);

router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { name, description, staff_name, duration, price } = req.body;

    if (!name || !staff_name || !duration || !price) {
      return res
        .status(400)
        .json({ message: "Название, исполнитель, длительность и цена обязательны" });
    }

    const result = await query(
      `
        INSERT INTO services (name, description, staff_name, duration, price)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      [name.trim(), description?.trim() || "", staff_name.trim(), duration, price]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Не удалось создать услугу" });
  }
});

router.put("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, staff_name, duration, price, is_active } = req.body;

    if (!name || !staff_name || !duration || !price) {
      return res
        .status(400)
        .json({ message: "Название, исполнитель, длительность и цена обязательны" });
    }

    const result = await query(
      `
        UPDATE services
        SET name = $1,
            description = $2,
            staff_name = $3,
            duration = $4,
            price = $5,
            is_active = $6,
            updated_at = NOW()
        WHERE id = $7
        RETURNING *
      `,
      [
        name.trim(),
        description?.trim() || "",
        staff_name.trim(),
        duration,
        price,
        Boolean(is_active),
        id
      ]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: "Услуга не найдена" });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Не удалось обновить услугу" });
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

export default router;
