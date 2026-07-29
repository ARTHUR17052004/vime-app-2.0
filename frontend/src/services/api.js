import { API_URL } from "../config/api";

export async function api(endpoint, options = {}) {
  function getCookie(nome) {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");

  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split("=");

    if (key === nome) {
      return value;
    }
  }

  return null;
}

const token = getCookie("token");

  console.log("API:", `${API_URL}${endpoint}`);

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
    },
    ...options,
  });

  const text = await response.text();

let data = {};

try {
  data = text ? JSON.parse(text) : {};
} catch {
  console.error("Resposta da API:", text);
  throw new Error("A API não retornou um JSON válido.");
}

if (!response.ok) {
  throw new Error(data.message || "Erro na API");
}

return data;
}