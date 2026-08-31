// "SN" (ou "S/N", "s.n.", etc.) é o valor que libera qualquer um destes
// campos sem precisar bater um formato válido -- usado quando a pessoa
// não tem/não sabe o dado (ex.: sem telefone de emergência, endereço
// sem CEP). Ignora tudo que não for letra pra aceitar as variações.
export function isento(valor) {
  const limpo = (valor || "").trim().toUpperCase().replace(/[^A-Z]/g, "");
  return limpo === "SN";
}

export function validarTelefone(valor) {

  if (isento(valor)) return true;

  const digitos = (valor || "").replace(/\D/g, "");

  // Fixo (DDD + 8 dígitos) ou celular (DDD + 9 dígitos).
  return digitos.length === 10 || digitos.length === 11;

}

export function validarCep(valor) {

  if (isento(valor)) return true;

  const digitos = (valor || "").replace(/\D/g, "");

  return digitos.length === 8;

}

export function validarCnpj(cnpj) {

  if (isento(cnpj)) return true;

  const digitos = (cnpj || "").replace(/\D/g, "");

  if (digitos.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digitos)) return false;

  const calcularDigito = (base, pesos) => {
    let soma = 0;

    for (let i = 0; i < base.length; i++) {
      soma += Number(base[i]) * pesos[i];
    }

    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const base = digitos.slice(0, 12);
  const d1 = calcularDigito(base, pesos1);
  const d2 = calcularDigito(base + d1, pesos2);

  return digitos === base + String(d1) + String(d2);

}

// Aceita CPF ou CNPJ, sempre os dois formatos -- não trava pelo que
// "Tipo de Pessoa" diz, porque esse campo pode estar errado num
// cadastro antigo (ex.: empresa marcada como Pessoa Física) e aí um
// CNPJ real seria barrado só por causa dessa discrepância.
import { validarCpf } from "./cpf";

export function validarDocumento(valor) {

  if (isento(valor)) return true;

  return validarCpf(valor) || validarCnpj(valor);

}
