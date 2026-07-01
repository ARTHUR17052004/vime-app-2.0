import { api } from "./api";

export const UnidadeService = {
  listar: () => api("/unidades"),
  buscar: (id) => api(`/unidades/${id}`),
};