import { query } from "../config/db.js";
import { filterPastSlotsForDate, isPastIsoDate } from "./date.js";
import { generateSlots } from "./slots.js";

export const RESERVED_BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "in_progress",
  "completed"
];

export const SLOT_STEP_MINUTES = 5;

export async function getServiceWorkerTiming(
  serviceId,
  workerId,
  executor = query
) {
  const result = await executor(
    `
      SELECT
        s.id,
        s.name,
        s.is_active,
        s.duration AS default_duration_minutes,
        s.buffer_after_minutes AS default_buffer_after_minutes,
        sw.worker_id,
        COALESCE(sw.duration_minutes, s.duration) AS duration_minutes,
        COALESCE(
          sw.buffer_after_minutes,
          s.buffer_after_minutes
        ) AS buffer_after_minutes
      FROM services s
      JOIN service_workers sw ON sw.service_id = s.id
      WHERE s.id = $1
        AND sw.worker_id = $2
    `,
    [serviceId, workerId]
  );

  return result.rows[0] || null;
}

export async function getWorkerDaySchedule(
  workerId,
  date,
  executor = query
) {
  const dayOfWeek = new Date(date).getUTCDay();
  const result = await executor(
    `
      SELECT
        bh.day_of_week,
        COALESCE(wbh.start_time, bh.start_time) AS start_time,
        COALESCE(wbh.end_time, bh.end_time) AS end_time,
        COALESCE(wbh.is_working, bh.is_working) AS is_working
      FROM business_hours bh
      LEFT JOIN worker_business_hours wbh
        ON wbh.day_of_week = bh.day_of_week
       AND wbh.worker_id = $1
      WHERE bh.day_of_week = $2
    `,
    [workerId, dayOfWeek]
  );

  return result.rows[0] || null;
}

export async function getWorkerBookingsForDate(
  date,
  workerId,
  {
    excludeBookingId,
    statuses = RESERVED_BOOKING_STATUSES,
    executor = query
  } = {}
) {
  const params = [date, workerId];
  let exclusionClause = "";

  if (excludeBookingId) {
    params.push(excludeBookingId);
    exclusionClause = "AND b.id <> $3";
  }

  const statusIndex = params.length + 1;
  const result = await executor(
    `
      SELECT
        b.booking_time,
        b.duration_minutes,
        b.buffer_after_minutes
      FROM bookings b
      WHERE b.booking_date = $1
        AND b.worker_id = $2
        AND b.status = ANY($${statusIndex})
        ${exclusionClause}
      ORDER BY b.booking_time ASC
    `,
    [...params, statuses]
  );

  return result.rows;
}

export async function getAvailableSlotsForServiceWorker(
  {
    serviceId,
    workerId,
    date,
    excludeBookingId,
    durationOverride,
    bufferAfterOverride,
    step
  },
  executor = query
) {
  if (!serviceId || !workerId || !date || isPastIsoDate(date)) {
    return {
      slots: [],
      timing: null,
      schedule: null
    };
  }

  const timing = await getServiceWorkerTiming(serviceId, workerId, executor);

  if (!timing?.is_active) {
    return {
      slots: [],
      timing,
      schedule: null
    };
  }

  const schedule = await getWorkerDaySchedule(workerId, date, executor);

  if (!schedule?.is_working) {
    return {
      slots: [],
      timing,
      schedule
    };
  }

  const existingBookings = await getWorkerBookingsForDate(date, workerId, {
    excludeBookingId,
    executor
  });

  const resolvedDuration = Number(
    durationOverride ?? timing.duration_minutes ?? timing.default_duration_minutes
  );
  const resolvedBufferAfter = Number(
    bufferAfterOverride ??
      timing.buffer_after_minutes ??
      timing.default_buffer_after_minutes ??
      0
  );
  const resolvedStep = Math.max(
    Number(step ?? resolvedDuration + resolvedBufferAfter),
    SLOT_STEP_MINUTES
  );

  const slots = filterPastSlotsForDate(
    date,
    generateSlots({
      startTime: String(schedule.start_time).slice(0, 5),
      endTime: String(schedule.end_time).slice(0, 5),
      serviceDuration: resolvedDuration,
      bufferAfter: resolvedBufferAfter,
      existingBookings,
      step: resolvedStep
    })
  );

  return {
    slots,
    schedule,
    timing: {
      ...timing,
      duration_minutes: resolvedDuration,
      buffer_after_minutes: resolvedBufferAfter,
      slot_step_minutes: resolvedStep,
      occupied_minutes: resolvedDuration + resolvedBufferAfter
    }
  };
}
