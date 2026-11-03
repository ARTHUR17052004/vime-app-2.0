// Número de controle do boleto (parte do "Nosso Número") derivado do
// id da Receita -- determinístico, então consultar/reenviar a mesma
// Receita sempre dá o mesmo número, sem precisar guardar nada extra.
// Usado tanto na criação do boleto (gatewayPagamentoService) quanto na
// consulta periódica de status (verificarBoletosBBJob) -- as duas
// PRECISAM usar exatamente essa mesma conta, senão a consulta aponta
// pro boleto errado.
const numeroControleParaReceita = (receitaId) => {
  const hex = receitaId.replace(/-/g, '').slice(0, 12);
  const numero = BigInt('0x' + hex) % 10000000000n;
  return numero.toString().padStart(10, '0');
};

module.exports = { numeroControleParaReceita };
