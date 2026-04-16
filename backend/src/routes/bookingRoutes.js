import { Router } from "express";
import { pool, query } from "../config/db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { generateSlots } from "../utils/slots.js";

const router = Router();
const RESERVED_STATUSES = ["pending", "confirmed", "in_progress", "completed"];
const ACTIVE_BOOKING_STATUSES = ["pending", "confirmed", "in_progress"];
const CLIENT_BOOKING_LIMITS = {
  cooldownSeconds: 15,
  maxActiveTotal: 10,
  maxActivePerDay: 3
};
const ADMIN_STATUS_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["in_progress", "cancelled"],
  in_progress: ["completed"],
  completed: [],
  cancelled: []
};

async function getService(serviceId, executor = query) {
  const result = await executor(
    "SELECT id, name, duration, is_active FROM services WHERE id = $1",
    [serviceId]
  );
  return result.rows[0];
}

async function getDayConfig(date, executor = query) {
  const dayOfWeek = new Date(date).getUTCDay();
  const result = await executor(
    `
      SELECT start_time, end_time, is_working
      FROM business_hours
      WHERE day_of_week = $1
    `,
    [dayOfWeek]
  );
  return result.rows[0];
}

async function getAvailableSlots(
  date,
  serviceId,
  excludeBookingId,
  executor = query
) {
  const service = await getService(serviceId, executor);
  const dayConfig = await getDayConfig(date, executor);

  if (!service || !service.is_active || !dayConfig?.is_working) {
    return [];
  }

  const params = [date];
  let exclusionClause = "";

  if (excludeBookingId) {
    params.push(excludeBookingId);
    exclusionClause = "AND b.id <> $2";
  }

  const bookingsResult = await executor(
    `
      SELECT b.booking_time, s.duration
      FROM bookings b
      JOIN services s ON s.id = b.service_id
      WHERE b.booking_date = $1
        AND b.status = ANY($${excludeBookingId ? 3 : 2})
        ${exclusionClause}
    `,
    [...params, RESERVED_STATUSES]
  );

  return generateSlots({
    startTime: dayConfig.start_time.slice(0, 5),
    endTime: dayConfig.end_time.slice(0, 5),
    serviceDuration: Number(service.duration),
    existingBookings: bookingsResult.rows
  });
}

async function getRecentBookingAttempt(userId, executor = query) {
  const result = await executor(
    `
      SELECT created_at
      FROM bookings
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [userId]
  );

  return result.rows[0];
}

function getCooldownRemainingSeconds(createdAt) {
  if (!createdAt) {
    return 0;
  }

  const secondsSinceLastAttempt = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / 1000
  );

  return Math.max(
    0,
    CLIENT_BOOKING_LIMITS.cooldownSeconds - secondsSinceLastAttempt
  );
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";

    const result = await query(
      `
        SELECT
          b.id,
          b.booking_date::text AS booking_date,
          b.booking_time,
          b.status,
          b.created_at,
          u.id AS user_id,
          u.name AS user_name,
          u.email AS user_email,
          s.id AS service_id,
          s.name AS service_name,
          s.duration,
          s.price
        FROM bookings b
        JOIN users u ON u.id = b.user_id
        JOIN services s ON s.id = b.service_id
        WHERE ($1::text = 'admin' OR b.user_id = $2)
        ORDER BY b.booking_date ASC, b.booking_time ASC
      `,
      [req.user.role, req.user.id]
    );

    return res.json(
      result.rows.map((row) => ({
        ...row,
        isAdmin
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: "Не удалось загрузить записи" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  let client;

  try {
    if (req.user.role === "admin") {
      return res.status(403).json({
        message: "Администратор не может создавать личные записи"
      });
    }

    const { service_id, booking_date, booking_time } = req.body;

    if (!service_id || !booking_date || !booking_time) {
      return res
        .status(400)
        .json({ message: "Выберите услугу, дату и время записи" });
    }

    client = await pool.connect();
    const execute = client.query.bind(client);

    await client.query("BEGIN");
    await execute("SELECT pg_advisory_xact_lock(hashtext($1))", [booking_date]);

    const recentAttempt = await getRecentBookingAttempt(req.user.id, execute);
    const cooldownRemaining = getCooldownRemainingSeconds(
      recentAttempt?.created_at
    );

    if (cooldownRemaining > 0) {
      await client.query("ROLLBACK");
      return res.status(429).json({
        message: `Слишком частые записи. Подождите ${cooldownRemaining} сек.`
      });
    }

    const activeBookingsResult = await execute(
      `
        SELECT
          COUNT(*) FILTER (WHERE status = ANY($2))::int AS active_total,
          COUNT(*) FILTER (
            WHERE status = ANY($2) AND booking_date = $3
          )::int AS active_for_day
        FROM bookings
        WHERE user_id = $1
      `,
      [req.user.id, ACTIVE_BOOKING_STATUSES, booking_date]
    );

    const bookingStats = activeBookingsResult.rows[0];

    if (bookingStats.active_total >= CLIENT_BOOKING_LIMITS.maxActiveTotal) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message:
          "У вас уже слишком много активных записей. Отмените или завершите часть визитов."
      });
    }

    if (bookingStats.active_for_day >= CLIENT_BOOKING_LIMITS.maxActivePerDay) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message:
          "На эту дату у вас уже слишком много активных записей. Выберите другой день."
      });
    }

    const personalConflictResult = await execute(
      `
        SELECT id
        FROM bookings
        WHERE user_id = $1
          AND booking_date = $2
          AND booking_time = $3
          AND status = ANY($4)
        LIMIT 1
      `,
      [req.user.id, booking_date, booking_time, ACTIVE_BOOKING_STATUSES]
    );

    if (personalConflictResult.rowCount) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: "У вас уже есть активная запись на это время"
      });
    }

    const duplicateBookingResult = await execute(
      `
        SELECT id
        FROM bookings
        WHERE user_id = $1
          AND service_id = $2
          AND booking_date = $3
          AND booking_time = $4
          AND status = ANY($5)
        LIMIT 1
      `,
      [
        req.user.id,
        service_id,
        booking_date,
        booking_time,
        ACTIVE_BOOKING_STATUSES
      ]
    );

    if (duplicateBookingResult.rowCount) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: "Такая запись у вас уже есть"
      });
    }

    const service = await getService(service_id, execute);

    if (!service?.is_active) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Услуга недоступна" });
    }

    const slots = await getAvailableSlots(
      booking_date,
      service_id,
      undefined,
      execute
    );

    if (!slots.includes(booking_time.slice(0, 5))) {
      await client.query("ROLLBACK");
      return res
        .status(409)
        .json({ message: "Этот слот уже занят, выберите другое время" });
    }

    const result = await execute(
      `
        INSERT INTO bookings (user_id, service_id, booking_date, booking_time, status)
        VALUES ($1, $2, $3, $4, 'pending')
        RETURNING *
      `,
      [req.user.id, service_id, booking_date, booking_time]
    );

    await client.query("COMMIT");

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch(() => {});
    }

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Такая активная запись уже существует"
      });
    }

    return res.status(500).json({ message: "Не удалось создать запись" });
  } finally {
    client?.release();
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { booking_date, booking_time, status } = req.body;

    const bookingResult = await query(
      `
        SELECT b.*, s.duration, s.is_active
        FROM bookings b
        JOIN services s ON s.id = b.service_id
        WHERE b.id = $1
      `,
      [id]
    );

    const booking = bookingResult.rows[0];

    if (!booking) {
      return res.status(404).json({ message: "Запись не найдена" });
    }

    const isOwner = booking.user_id === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Нет доступа к записи" });
    }

    let nextStatus =
      status && isAdmin
        ? status
        : status === "cancelled"
          ? "cancelled"
          : booking.status;

    let nextDate =
      typeof booking.booking_date === "string"
        ? booking.booking_date.slice(0, 10)
        : booking.booking_date.toISOString().slice(0, 10);
    let nextTime = booking.booking_time.slice(0, 5);

    if (booking_date && booking_time) {
      if (["in_progress", "completed", "cancelled"].includes(booking.status)) {
        return res.status(400).json({
          message: "Эту запись больше нельзя переносить"
        });
      }

      const slots = await getAvailableSlots(
        booking_date,
        booking.service_id,
        booking.id
      );

      if (!slots.includes(booking_time.slice(0, 5))) {
        return res
          .status(409)
          .json({ message: "Выбранный новый слот уже занят" });
      }

      nextDate = booking_date;
      nextTime = booking_time;

      if (booking.status !== "cancelled") {
        nextStatus = "pending";
      }
    }

    const result = await query(
      `
        UPDATE bookings
        SET booking_date = $1,
            booking_time = $2,
            status = $3,
            updated_at = NOW()
        WHERE id = $4
        RETURNING *
      `,
      [nextDate, nextTime, nextStatus, id]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Не удалось обновить запись" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const bookingResult = await query("SELECT * FROM bookings WHERE id = $1", [
      id
    ]);
    const booking = bookingResult.rows[0];

    if (!booking) {
      return res.status(404).json({ message: "Запись не найдена" });
    }

    const isOwner = booking.user_id === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Нет доступа к записи" });
    }

    if (["in_progress", "completed"].includes(booking.status)) {
      return res.status(400).json({
        message: "Нельзя отменить запись, услуга уже начата или завершена"
      });
    }

    if (booking.status === "cancelled") {
      return res.json({ message: "Запись уже отменена" });
    }

    await query(
      `
        UPDATE bookings
        SET status = 'cancelled',
            updated_at = NOW()
        WHERE id = $1
      `,
      [id]
    );

    return res.json({ message: "Запись отменена" });
  } catch (error) {
    return res.status(500).json({ message: "Не удалось отменить запись" });
  }
});

router.delete(
  "/:id/permanent",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await query(
        `
          DELETE FROM bookings
          WHERE id = $1
          RETURNING id
        `,
        [id]
      );

      if (!result.rowCount) {
        return res.status(404).json({ message: "Запись не найдена" });
      }

      return res.json({ message: "Запись удалена" });
    } catch (error) {
      return res.status(500).json({ message: "Не удалось удалить запись" });
    }
  }
);

router.patch(
  "/:id/status",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const allowedStatuses = [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled"
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Некорректный статус" });
      }

      const bookingResult = await query("SELECT * FROM bookings WHERE id = $1", [
        id
      ]);

      const booking = bookingResult.rows[0];

      if (!booking) {
        return res.status(404).json({ message: "Запись не найдена" });
      }

      if (booking.status === status) {
        return res.json(booking);
      }

      const nextStatuses = ADMIN_STATUS_TRANSITIONS[booking.status] || [];

      if (!nextStatuses.includes(status)) {
        return res.status(400).json({
          message: "Для этой записи такое действие сейчас недоступно"
        });
      }

      const result = await query(
        `
          UPDATE bookings
          SET status = $1,
              updated_at = NOW()
          WHERE id = $2
          RETURNING *
        `,
        [status, id]
      );

      if (!result.rowCount) {
        return res.status(404).json({ message: "Запись не найдена" });
      }

      return res.json(result.rows[0]);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Не удалось обновить статус записи" });
    }
  }
);

router.get(
  "/dashboard/summary",
  requireAuth,
  requireRole("admin"),
  async (_req, res) => {
    try {
      const [servicesCount, clientsCount, bookingsCount, todayCount] =
        await Promise.all([
          query("SELECT COUNT(*)::int AS count FROM services WHERE is_active = true"),
          query("SELECT COUNT(*)::int AS count FROM users WHERE role = 'client'"),
          query(
            "SELECT COUNT(*)::int AS count FROM bookings WHERE status = ANY($1)",
            [ACTIVE_BOOKING_STATUSES]
          ),
          query(
            "SELECT COUNT(*)::int AS count FROM bookings WHERE booking_date = CURRENT_DATE AND status = ANY($1)",
            [ACTIVE_BOOKING_STATUSES]
          )
        ]);

      return res.json({
        services: servicesCount.rows[0].count,
        clients: clientsCount.rows[0].count,
        activeBookings: bookingsCount.rows[0].count,
        todayBookings: todayCount.rows[0].count
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Не удалось загрузить данные дашборда" });
    }
  }
);

router.get(
  "/dashboard/analytics",
  requireAuth,
  requireRole("admin"),
  async (_req, res) => {
    try {
      const [
        overviewResult,
        clientsResult,
        servicesResult,
        monthlyRevenueResult,
        topMonthResult,
        topServicesResult,
        topClientsResult,
        statusBreakdownResult
      ] = await Promise.all([
        query(
          `
            SELECT
              COALESCE(
                SUM(
                  CASE
                    WHEN b.status = 'completed' AND b.booking_date = CURRENT_DATE
                    THEN s.price
                    ELSE 0
                  END
                ),
                0
              )::numeric(10, 2) AS revenue_today,
              COALESCE(
                SUM(
                  CASE
                    WHEN b.status = 'completed'
                     AND date_trunc('month', b.booking_date) = date_trunc('month', CURRENT_DATE)
                    THEN s.price
                    ELSE 0
                  END
                ),
                0
              )::numeric(10, 2) AS revenue_month,
              COALESCE(
                SUM(
                  CASE
                    WHEN b.status = 'completed'
                     AND date_trunc('year', b.booking_date) = date_trunc('year', CURRENT_DATE)
                    THEN s.price
                    ELSE 0
                  END
                ),
                0
              )::numeric(10, 2) AS revenue_year,
              COUNT(*)::int AS bookings_total,
              COUNT(*) FILTER (WHERE b.status = 'completed')::int AS bookings_completed,
              COUNT(*) FILTER (WHERE b.status = 'cancelled')::int AS bookings_cancelled,
              COUNT(*) FILTER (WHERE b.status = ANY($1))::int AS bookings_active
            FROM bookings b
            JOIN services s ON s.id = b.service_id
          `,
          [ACTIVE_BOOKING_STATUSES]
        ),
        query(
          `
            SELECT
              COUNT(*)::int AS clients_total,
              COUNT(*) FILTER (
                WHERE created_at >= date_trunc('month', CURRENT_DATE)
              )::int AS clients_this_month
            FROM users
            WHERE role = 'client'
          `
        ),
        query(
          `
            SELECT
              COUNT(*)::int AS services_total,
              COUNT(*) FILTER (WHERE is_active = true)::int AS services_active
            FROM services
          `
        ),
        query(
          `
            SELECT
              EXTRACT(MONTH FROM b.booking_date)::int AS month,
              COALESCE(SUM(s.price), 0)::numeric(10, 2) AS revenue,
              COUNT(*)::int AS completed_count
            FROM bookings b
            JOIN services s ON s.id = b.service_id
            WHERE b.status = 'completed'
              AND date_trunc('year', b.booking_date) = date_trunc('year', CURRENT_DATE)
            GROUP BY EXTRACT(MONTH FROM b.booking_date)
            ORDER BY month ASC
          `
        ),
        query(
          `
            SELECT
              EXTRACT(YEAR FROM b.booking_date)::int AS year,
              EXTRACT(MONTH FROM b.booking_date)::int AS month,
              COALESCE(SUM(s.price), 0)::numeric(10, 2) AS revenue,
              COUNT(*)::int AS completed_count
            FROM bookings b
            JOIN services s ON s.id = b.service_id
            WHERE b.status = 'completed'
              AND date_trunc('year', b.booking_date) = date_trunc('year', CURRENT_DATE)
            GROUP BY EXTRACT(YEAR FROM b.booking_date), EXTRACT(MONTH FROM b.booking_date)
            ORDER BY revenue DESC, completed_count DESC
            LIMIT 1
          `
        ),
        query(
          `
            SELECT
              s.id,
              s.name,
              COUNT(*)::int AS completed_count,
              COALESCE(SUM(s.price), 0)::numeric(10, 2) AS revenue
            FROM bookings b
            JOIN services s ON s.id = b.service_id
            WHERE b.status = 'completed'
            GROUP BY s.id, s.name
            ORDER BY revenue DESC, completed_count DESC
            LIMIT 5
          `
        ),
        query(
          `
            SELECT
              u.id,
              u.name,
              u.email,
              COUNT(*)::int AS completed_count,
              COALESCE(SUM(s.price), 0)::numeric(10, 2) AS revenue
            FROM bookings b
            JOIN users u ON u.id = b.user_id
            JOIN services s ON s.id = b.service_id
            WHERE b.status = 'completed'
            GROUP BY u.id, u.name, u.email
            ORDER BY completed_count DESC, revenue DESC
            LIMIT 5
          `
        ),
        query(
          `
            SELECT
              status,
              COUNT(*)::int AS count
            FROM bookings
            GROUP BY status
            ORDER BY count DESC, status ASC
          `
        )
      ]);

      return res.json({
        overview: {
          ...overviewResult.rows[0],
          ...clientsResult.rows[0],
          ...servicesResult.rows[0]
        },
        monthlyRevenue: monthlyRevenueResult.rows,
        topMonth: topMonthResult.rows[0] || null,
        topServices: topServicesResult.rows,
        topClients: topClientsResult.rows,
        statusBreakdown: statusBreakdownResult.rows
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Не удалось загрузить аналитику" });
    }
  }
);

export default router;
