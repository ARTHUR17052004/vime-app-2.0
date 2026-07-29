const asaas = require("./src/services/AsaasApi");

(async () => {

    const resposta =
        await asaas.receberPagamento("123");

    console.log(resposta);

})();