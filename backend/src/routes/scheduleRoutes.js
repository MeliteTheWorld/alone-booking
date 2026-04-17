import { Router } from "express";
import { query } from "../config/db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { filterPastSlotsForDate, isPastIsoDate } from "../utils/date.js";
import { calculateLoad, generateSlots } from "../utils/slots.js";

const router = Router();
const RESERVED_STATUSES = ["pending", "confirmed", "in_progress", "completed"];

router.get("/hours", async (_req, res) => {
  try {
    const result = await query(
      "SELECT * FROM business_hours ORDER BY day_of_week ASC"
    );
    return res.json(result.rows);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Не удалось загрузить настройки расписания" });
  }
});

router.put(
  "/hours/:dayOfWeek",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { dayOfWeek } = req.params;
      const { start_time, end_time, is_working } = req.body;

      const result = await query(
        `
          UPDATE business_hours
          SET start_time = $1,
              end_time = $2,
              is_working = $3
          WHERE day_of_week = $4
          RETURNING *
        `,
        [start_time, end_time, is_working, dayOfWeek]
      );

      if (!result.rowCount) {
        return res.status(404).json({ message: "День расписания не найден" });
      }

      return res.json(result.rows[0]);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Не удалось сохранить рабочие часы" });
    }
  }
);

router.get("/slots", async (req, res) => {
  try {
    const { serviceId, workerId, date, excludeBookingId } = req.query;

    if (!serviceId || !workerId || !date) {
      return res
        .status(400)
        .json({ message: "Передайте serviceId, workerId и date для поиска слотов" });
    }

    if (isPastIsoDate(date)) {
      return res.json({ slots: [] });
    }

    const serviceResult = await query(
      "SELECT id, duration FROM services WHERE id = $1 AND is_active = true",
      [serviceId]
    );

    const service = serviceResult.rows[0];

    if (!service) {
      return res.status(404).json({ message: "Услуга не найдена" });
    }

    const workerResult = await query(
      `
        SELECT sw.worker_id
        FROM service_workers sw
        WHERE sw.service_id = $1 AND sw.worker_id = $2
      `,
      [serviceId, workerId]
    );

    if (!workerResult.rowCount) {
      return res.status(404).json({
        message: "Исполнитель не назначен на выбранную услугу"
      });
    }

    const dayOfWeek = new Date(date).getUTCDay();
    const scheduleResult = await query(
      `
        SELECT start_time, end_time, is_working
        FROM business_hours
        WHERE day_of_week = $1
      `,
      [dayOfWeek]
    );

    const dayConfig = scheduleResult.rows[0];

    if (!dayConfig || !dayConfig.is_working) {
      return res.json({ slots: [] });
    }

    const params = [date, workerId];
    let exclusionClause = "";

    if (excludeBookingId) {
      params.push(excludeBookingId);
      exclusionClause = "AND b.id <> $3";
    }

    const bookingsResult = await query(
      `
        SELECT b.booking_time, s.duration
        FROM bookings b
        JOIN services s ON s.id = b.service_id
        WHERE b.booking_date = $1
          AND b.worker_id = $2
          AND b.status = ANY($${excludeBookingId ? 4 : 3})
          ${exclusionClause}
      `,
      [...params, RESERVED_STATUSES]
    );

    const slots = filterPastSlotsForDate(
      date,
      generateSlots({
        startTime: dayConfig.start_time.slice(0, 5),
        endTime: dayConfig.end_time.slice(0, 5),
        serviceDuration: Number(service.duration),
        existingBookings: bookingsResult.rows
      })
    );

    return res.json({ slots });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Не удалось рассчитать свободные слоты" });
  }
});

router.get(
  "/load",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { from, to } = req.query;

      if (!from || !to) {
        return res
          .status(400)
          .json({ message: "Передайте интервал from и to" });
      }

      const scheduleResult = await query(
        "SELECT * FROM business_hours ORDER BY day_of_week ASC"
      );

      const bookingsResult = await query(
        `
          SELECT b.booking_date, b.booking_time, b.status, s.duration
          FROM bookings b
          JOIN services s ON s.id = b.service_id
          WHERE b.booking_date BETWEEN $1 AND $2
            AND b.status <> 'cancelled'
          ORDER BY b.booking_date ASC, b.booking_time ASC
        `,
        [from, to]
      );

      const scheduleByDay = new Map(
        scheduleResult.rows.map((row) => [row.day_of_week, row])
      );
      const bookingsByDate = bookingsResult.rows.reduce((acc, booking) => {
        const rawDate =
          typeof booking.booking_date === "string"
            ? booking.booking_date
            : booking.booking_date.toISOString();
        const key = rawDate.slice(0, 10);
        acc[key] = acc[key] || [];
        acc[key].push(booking);
        return acc;
      }, {});

      const summary = [];
      const currentDate = new Date(`${from}T00:00:00Z`);
      const endDate = new Date(`${to}T00:00:00Z`);

      while (currentDate <= endDate) {
        const isoDate = currentDate.toISOString().slice(0, 10);
        const dayConfig = scheduleByDay.get(currentDate.getUTCDay());
        const bookings = bookingsByDate[isoDate] || [];

        summary.push({
          date: isoDate,
          is_working: dayConfig?.is_working ?? false,
          load: dayConfig?.is_working
            ? calculateLoad({
                startTime: dayConfig.start_time.slice(0, 5),
                endTime: dayConfig.end_time.slice(0, 5),
                bookings
              })
            : 0,
          bookings_count: bookings.length
        });

        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      }

      return res.json(summary);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Не удалось рассчитать загрузку расписания" });
    }
  }
);

export default router;
