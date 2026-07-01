import { API_URL } from "../config/api";

export async function api(endpoint, options = {}) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Erro na API");
  }

  return data;
}