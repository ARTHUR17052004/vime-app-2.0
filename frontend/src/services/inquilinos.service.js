import { api } from "./api";

export const InquilinoService = {
  listar: () => api("/inquilinos"),
  buscar: (id) => api(`/inquilinos/${id}`),
};