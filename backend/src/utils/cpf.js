const isento = (valor) => {
  const limpo = (valor || '').trim().toUpperCase().replace(/[^A-Z]/g, '');
  return limpo === 'SN';
};

const validarCpf = (cpf) => {

  if (isento(cpf)) return true;

  const digitos = (cpf || '').replace(/\D/g, '');

  if (digitos.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digitos)) return false;

  const calcularDigito = (base) => {
    let soma = 0;
    let peso = base.length + 1;

    for (const n of base) {
      soma += Number(n) * peso;
      peso--;
    }

    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const d1 = calcularDigito(digitos.slice(0, 9));
  const d2 = calcularDigito(digitos.slice(0, 9) + d1);

  return digitos === digitos.slice(0, 9) + String(d1) + String(d2);

};

module.exports = { validarCpf };
