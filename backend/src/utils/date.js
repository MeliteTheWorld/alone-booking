export function getLocalIsoDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getCurrentTimeLabel(date = new Date()) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function isPastIsoDate(value) {
  return value < getLocalIsoDate();
}

export function isPastTimeForToday(dateValue, timeValue) {
  if (!dateValue || !timeValue) {
    return false;
  }

  if (dateValue !== getLocalIsoDate()) {
    return false;
  }

  return String(timeValue).slice(0, 5) < getCurrentTimeLabel();
}

export function filterPastSlotsForDate(dateValue, slots) {
  if (dateValue !== getLocalIsoDate()) {
    return slots;
  }

  const currentTime = getCurrentTimeLabel();
  return slots.filter((slot) => slot >= currentTime);
}
