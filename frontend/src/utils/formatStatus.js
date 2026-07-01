export function formatStatus(status) {

  if (!status) return "-";

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase());

}