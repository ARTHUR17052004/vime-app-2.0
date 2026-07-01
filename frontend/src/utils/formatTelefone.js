export function formatTelefone(phone) {
  if (!phone) return "";

  return phone.replace(
    /(\d{2})(\d{5})(\d{4})/,
    "($1) $2-$3"
  );
}