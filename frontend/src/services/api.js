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

  console.log("Resposta:", text);

  const data = JSON.parse(text);

  if (!response.ok) {
    throw new Error(data.message || "Erro na API");
  }

  return data;
}