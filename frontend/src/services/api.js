import { API_URL } from "../config/api";

export async function api(endpoint, options = {}) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

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