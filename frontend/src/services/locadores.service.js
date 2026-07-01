import { api } from "./api";

export const LocadorService = {
  listar: () => api("/locadores"),
  buscar: (id) => api(`/locadores/${id}`),
};