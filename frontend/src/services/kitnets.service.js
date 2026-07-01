import { api } from "./api";

export const KitnetService = {
  listar: () => api("/kitnets"),
  buscar: (id) => api(`/kitnets/${id}`),
};