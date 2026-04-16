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

export function generateSlots({
  startTime,
  endTime,
  serviceDuration,
  existingBookings = [],
  step = 30
}) {
  const scheduleStart = timeToMinutes(startTime);
  const scheduleEnd = timeToMinutes(endTime);
  const occupiedRanges = existingBookings.map((booking) => {
    const bookingStart = timeToMinutes(booking.booking_time.slice(0, 5));
    const bookingEnd = bookingStart + Number(booking.duration);
    return [bookingStart, bookingEnd];
  });

  const slots = [];

  for (
    let slotStart = scheduleStart;
    slotStart + serviceDuration <= scheduleEnd;
    slotStart += step
  ) {
    const slotEnd = slotStart + serviceDuration;
    const hasOverlap = occupiedRanges.some(
      ([busyStart, busyEnd]) => slotStart < busyEnd && slotEnd > busyStart
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
    (sum, booking) => sum + Number(booking.duration),
    0
  );

  return Math.min(Math.round((bookedMinutes / totalMinutes) * 100), 100);
}

