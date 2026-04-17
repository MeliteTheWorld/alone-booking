import { query } from "../config/db.js";

export function formatVisitMoment(bookingDate, bookingTime) {
  const date = new Date(`${bookingDate}T00:00:00Z`);
  const formattedDate = date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  });

  return `${formattedDate} в ${String(bookingTime).slice(0, 5)}`;
}

function statusContent(status, serviceName, momentLabel) {
  switch (status) {
    case "confirmed":
      return {
        type: "booking_confirmed",
        title: "Запись подтверждена",
        message: `Ваша запись на услугу «${serviceName}» подтверждена. Ждём вас ${momentLabel}.`
      };
    case "in_progress":
      return {
        type: "booking_in_progress",
        title: "Услуга началась",
        message: `Запись на услугу «${serviceName}» переведена в работу.`
      };
    case "completed":
      return {
        type: "booking_completed",
        title: "Услуга завершена",
        message: `Запись на услугу «${serviceName}» отмечена как завершённая.`
      };
    case "cancelled":
      return {
        type: "booking_cancelled",
        title: "Запись отменена",
        message: `Запись на услугу «${serviceName}» на ${momentLabel} была отменена.`
      };
    default:
      return {
        type: "booking_updated",
        title: "Статус записи обновлён",
        message: `Статус вашей записи на услугу «${serviceName}» был изменён.`
      };
  }
}

export async function createNotification(payload, executor = query) {
  const {
    userId,
    type,
    title,
    message,
    linkPath = null,
    entityId = null
  } = payload;

  const result = await executor(
    `
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        link_path,
        entity_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        user_id,
        type,
        title,
        message,
        link_path,
        entity_id,
        is_read,
        read_at,
        created_at
    `,
    [userId, type, title, message, linkPath, entityId]
  );

  return result.rows[0];
}

export async function createNotifications(payloads, executor = query) {
  const notifications = [];

  for (const payload of payloads) {
    notifications.push(await createNotification(payload, executor));
  }

  return notifications;
}

export async function getAdminIds(executor = query) {
  const result = await executor(
    "SELECT id FROM users WHERE role = 'admin' ORDER BY id ASC"
  );

  return result.rows.map((row) => row.id);
}

export async function notifyClientBookingCreated(
  { bookingId, userId, serviceName, workerName, bookingDate, bookingTime },
  executor = query
) {
  const momentLabel = formatVisitMoment(bookingDate, bookingTime);
  const performerLabel = workerName ? ` Исполнитель: ${workerName}.` : "";

  return createNotification(
    {
      userId,
      type: "booking_created",
      title: "Запись создана",
      message: `Вы записаны на услугу «${serviceName}» ${momentLabel}.${performerLabel} Ждите подтверждения администратора.`,
      linkPath: "/profile?tab=bookings",
      entityId: bookingId
    },
    executor
  );
}

export async function notifyAdminsAboutNewBooking(
  {
    bookingId,
    clientName,
    serviceName,
    workerName,
    bookingDate,
    bookingTime
  },
  executor = query
) {
  const adminIds = await getAdminIds(executor);

  if (!adminIds.length) {
    return;
  }

  const momentLabel = formatVisitMoment(bookingDate, bookingTime);
  const performerLabel = workerName ? ` Исполнитель: ${workerName}.` : "";

  return createNotifications(
    adminIds.map((adminId) => ({
      userId: adminId,
      type: "booking_created_admin",
      title: "Новая запись",
      message: `Клиент ${clientName} записался на услугу «${serviceName}» ${momentLabel}.${performerLabel}`,
      linkPath: "/admin?tab=calendar",
      entityId: bookingId
    })),
    executor
  );
}

export async function notifyClientBookingStatusChanged(
  { bookingId, userId, serviceName, bookingDate, bookingTime, status },
  executor = query
) {
  const momentLabel = formatVisitMoment(bookingDate, bookingTime);
  const content = statusContent(status, serviceName, momentLabel);

  return createNotification(
    {
      userId,
      ...content,
      linkPath: "/profile?tab=bookings",
      entityId: bookingId
    },
    executor
  );
}

export async function notifyAdminsBookingChanged(
  { bookingId, clientName, serviceName, bookingDate, bookingTime, actionLabel },
  executor = query
) {
  const adminIds = await getAdminIds(executor);

  if (!adminIds.length) {
    return;
  }

  const momentLabel = formatVisitMoment(bookingDate, bookingTime);

  return createNotifications(
    adminIds.map((adminId) => ({
      userId: adminId,
      type: "booking_changed_admin",
      title: "Изменение записи",
      message: `${clientName}: ${actionLabel} для услуги «${serviceName}» (${momentLabel}).`,
      linkPath: "/admin?tab=calendar",
      entityId: bookingId
    })),
    executor
  );
}
