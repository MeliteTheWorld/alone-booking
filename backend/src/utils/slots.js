export function timeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes) {
  const normalized = Math.max(minutes, 0);
  const hours = String(Math.floor(normalized / 60)).padStart(2, "0");
  const mins = String(normalized % 60).padStart(2, "0");
  return `${hours}:${mins}`;
}

export function getOccupiedMinutes(booking) {
  return (
    Number(
      booking.duration_minutes ??
        booking.duration ??
        booking.service_duration ??
        0
    ) +
    Number(booking.buffer_after_minutes ?? booking.buffer_after ?? 0)
  );
}

export function getBookingRange(booking) {
  const bookingStart = timeToMinutes(String(booking.booking_time).slice(0, 5));
  const bookingEnd = bookingStart + getOccupiedMinutes(booking);
  return [bookingStart, bookingEnd];
}

export function hasRangeOverlap(leftStart, leftEnd, rightStart, rightEnd) {
  return leftStart < rightEnd && leftEnd > rightStart;
}

export function generateSlots({
  startTime,
  endTime,
  serviceDuration,
  bufferAfter = 0,
  existingBookings = [],
  step = 5
}) {
  const scheduleStart = timeToMinutes(startTime);
  const scheduleEnd = timeToMinutes(endTime);
  const occupiedRanges = existingBookings.map(getBookingRange);
  const totalOccupiedMinutes = Number(serviceDuration) + Number(bufferAfter);

  const slots = [];

  for (
    let slotStart = scheduleStart;
    slotStart + totalOccupiedMinutes <= scheduleEnd;
    slotStart += step
  ) {
    const slotEnd = slotStart + totalOccupiedMinutes;
    const hasOverlap = occupiedRanges.some(
      ([busyStart, busyEnd]) =>
        hasRangeOverlap(slotStart, slotEnd, busyStart, busyEnd)
    );

    if (!hasOverlap) {
      slots.push(minutesToTime(slotStart));
    }
  }

  return slots;
}

export function calculateLoad({ startTime, endTime, bookings = [] }) {
  const totalMinutes =
    Math.max(timeToMinutes(endTime) - timeToMinutes(startTime), 0) || 1;
  const bookedMinutes = bookings.reduce(
    (sum, booking) => sum + getOccupiedMinutes(booking),
    0
  );

  return Math.min(Math.round((bookedMinutes / totalMinutes) * 100), 100);
}
