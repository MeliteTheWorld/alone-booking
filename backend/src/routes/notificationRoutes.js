import { Router } from "express";
import { query } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import {
  broadcastNotificationRead,
  broadcastNotificationsReadAll
} from "../ws/notificationHub.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const [notificationsResult, unreadResult] = await Promise.all([
      query(
        `
          SELECT
            id,
            type,
            title,
            message,
            link_path,
            entity_id,
            is_read,
            read_at,
            created_at
          FROM notifications
          WHERE user_id = $1
          ORDER BY created_at DESC, id DESC
          LIMIT 25
        `,
        [req.user.id]
      ),
      query(
        `
          SELECT COUNT(*)::int AS unread_count
          FROM notifications
          WHERE user_id = $1 AND is_read = false
        `,
        [req.user.id]
      )
    ]);

    return res.json({
      items: notificationsResult.rows,
      unread_count: unreadResult.rows[0]?.unread_count || 0
    });
  } catch (error) {
    return res.status(500).json({ message: "Не удалось загрузить уведомления" });
  }
});

router.patch("/:id/read", requireAuth, async (req, res) => {
  try {
    const result = await query(
      `
        UPDATE notifications
        SET is_read = true,
            read_at = COALESCE(read_at, NOW())
        WHERE id = $1 AND user_id = $2
        RETURNING id, is_read, read_at
      `,
      [req.params.id, req.user.id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: "Уведомление не найдено" });
    }

    broadcastNotificationRead(
      req.user.id,
      result.rows[0].id,
      result.rows[0].read_at
    );

    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Не удалось отметить уведомление" });
  }
});

router.patch("/read-all", requireAuth, async (req, res) => {
  try {
    const result = await query(
      `
        UPDATE notifications
        SET is_read = true,
            read_at = COALESCE(read_at, NOW())
        WHERE user_id = $1 AND is_read = false
        RETURNING read_at
      `,
      [req.user.id]
    );

    if (result.rowCount) {
      broadcastNotificationsReadAll(
        req.user.id,
        result.rows[0].read_at
      );
    }

    return res.json({ success: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Не удалось отметить все уведомления" });
  }
});

export default router;
