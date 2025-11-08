export function addMonth(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().split('T')[0];
}