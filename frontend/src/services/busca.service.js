import { api } from "./api";

export const BuscaService = {
  buscar: (termo) => api(`/busca?q=${encodeURIComponent(termo)}`),
};
