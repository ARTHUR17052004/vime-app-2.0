import { api } from "./api";

export const ClicksignService = {
  configuracao() {
    return api("/clicksign/config");
  },

  contratos() {
    return api("/clicksign/contratos");
  },
};