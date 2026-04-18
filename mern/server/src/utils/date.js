export function toIsoDate(value = new Date()) {
  return new Date(value).toISOString().split("T")[0];
}

export function getDateDaysAgo(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return toIsoDate(date);
}

export function listPastDates(totalDays) {
  return Array.from({ length: totalDays }, (_, index) => getDateDaysAgo(totalDays - index - 1));
}
