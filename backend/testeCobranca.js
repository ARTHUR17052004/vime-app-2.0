const asaas = require("./src/services/AsaasApi");

(async () => {

    const resposta =
        await asaas.listarCobrancas();

    console.log(resposta);

})();