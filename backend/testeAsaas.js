const asaas = require("./src/services/AsaasApi");

(async () => {

  const resposta = await asaas.listarClientes();

  console.log(resposta);

})();